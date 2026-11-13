import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeAll(() => {
  if (process.env.E2E_ALLOW_WRITES !== "1")
    throw new Error("Usá una API con base aislada y E2E_ALLOW_WRITES=1.");
});

const selection = (page) =>
  page.getByRole("region", { name: "Productos destacados." });

async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test("destacados con persistencia real, edición, filtros, visibilidad y responsive", async ({
  page,
  request,
}) => {
  const unique = Date.now();
  const name = `Destacado ${unique}`;
  const registration = await request.post("/api/v1/auth/register", {
    data: {
      firstName: "Ana",
      lastName: "Prueba",
      email: `destacados-${unique}@example.com`,
      phone: "1144445555",
      password: "Segura123!",
    },
  });
  expect(registration.status()).toBe(201);
  const { token } = (await registration.json()).data;
  const headers = { Authorization: `Bearer ${token}` };
  await page.addInitScript(
    (value) => sessionStorage.setItem("pixel-forge-token", value),
    token,
  );
  const categoryResponse = await request.post("/api/v1/categories", {
    headers,
    data: { name: `Selección ${unique}`, description: "Pruebas de destacados" },
  });
  expect(categoryResponse.status()).toBe(201);
  const categoryId = (await categoryResponse.json()).data.id;
  const productValues = {
    categoryId,
    description: "Componente seleccionado",
    imageUrl: "https://placehold.co/800x600",
    price: 100,
    availability: "in_stock",
  };
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let productId;
  try {
    for (const values of [
      ...Array.from({ length: 5 }, (_, i) => ({
        name: `Selección ${unique} ${i}`,
        isFeatured: true,
      })),
      { name: `Oculto ${unique}`, isFeatured: true, isActive: false },
      { name: `Normal ${unique}` },
    ]) {
      expect(
        (
          await request.post("/api/v1/admin/products", {
            headers,
            data: { ...productValues, ...values },
          })
        ).status(),
      ).toBe(201);
    }

    await page.goto("/admin/productos/nuevo");
    await expect(page.getByLabel("Destacar producto")).not.toBeChecked();
    await page.getByLabel("Nombre del producto").fill(name);
    await page
      .getByLabel("Categoría", { exact: false })
      .selectOption(String(categoryId));
    await page.getByLabel("Descripción").fill(productValues.description);
    await page.getByLabel("URL de la imagen").fill(productValues.imageUrl);
    await page.getByLabel("Precio (ARS)").fill("12345");
    await page.getByLabel("Destacar producto").check();
    await page
      .getByRole("button", { name: "Crear producto", exact: true })
      .click();
    await expect(
      page.getByText("Producto creado correctamente."),
    ).toBeVisible();
    const all = (
      await (
        await request.get(
          `/api/v1/admin/products?categoryId=${categoryId}&limit=100`,
          { headers },
        )
      ).json()
    ).data;
    productId = all.find((product) => product.name === name).id;
    expect(all.find((product) => product.id === productId).isFeatured).toBe(
      true,
    );
    expect(
      all.find((product) => product.name === `Normal ${unique}`).isFeatured,
    ).toBe(false);

    await page.goto("/");
    await expect(selection(page).getByRole("article")).toHaveCount(4);
    await expect(
      selection(page).getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await expect(
      selection(page).getByText(`Oculto ${unique}`, { exact: true }),
    ).toHaveCount(0);
    await expect(
      selection(page).getByText(`Normal ${unique}`, { exact: true }),
    ).toHaveCount(0);
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await noOverflow(page);
      if (width === 375 || width === 1440)
        await selection(page).screenshot({
          path: `test-results/destacados-${width}.png`,
        });
    }
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await selection(page)
      .getByRole("link", { name: "Ver todos los destacados" })
      .click();
    await expect(page.getByLabel("Selección", { exact: true })).toHaveValue(
      "true",
    );
    await page
      .getByLabel("Categoría", { exact: true })
      .selectOption(String(categoryId));
    await expect(
      page.getByText("6 componentes", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Selección", { exact: true })).toHaveValue(
      "true",
    );
    await expect(
      page.getByText("6 componentes", { exact: true }),
    ).toBeVisible();
    await page.getByRole("heading", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/productos/${productId}$`));
    await expect(
      page.getByRole("heading", { level: 1, name, exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Destacado", { exact: true })).toBeVisible();
    await page.screenshot({
      path: "test-results/destacado-detalle-1440.png",
      fullPage: true,
    });

    await page.goto(`/admin/productos/${productId}/editar`);
    await expect(page.getByLabel("Destacar producto")).toBeChecked();
    await page.screenshot({
      path: "test-results/destacado-editor-1440.png",
      fullPage: true,
    });
    await page.getByLabel("Precio (ARS)").fill("23456");
    await page.getByRole("button", { name: "Guardar producto" }).click();
    await expect(
      page.getByText("Producto actualizado correctamente."),
    ).toBeVisible();
    await page
      .getByRole("switch", { name: `Visibilidad de ${name}`, exact: true })
      .click();
    await expect(
      page.getByText(
        "Producto desactivado. Ya no se muestra en el catálogo público.",
      ),
    ).toBeVisible();
    expect((await request.get(`/api/v1/products/${productId}`)).status()).toBe(
      404,
    );
    await expect(
      page.getByRole("switch", { name: `Destacado de ${name}`, exact: true }),
    ).toBeChecked();
    await page.goto("/");
    await expect(selection(page).getByRole("article")).toHaveCount(4);
    await expect(
      selection(page).getByRole("heading", { name, exact: true }),
    ).toHaveCount(0);
    const selected = await (
      await request.get(
        `/api/v1/products?isFeatured=true&categoryId=${categoryId}`,
      )
    ).json();
    expect(selected.meta.total).toBe(5);

    await page.goto(`/admin/productos?categoryId=${categoryId}`);
    await page.getByLabel("Destacados", { exact: true }).selectOption("true");
    await page.reload();
    await expect(page.getByLabel("Destacados", { exact: true })).toHaveValue(
      "true",
    );
    const patchPattern = `**/api/v1/admin/products/${productId}`;
    await page.route(patchPattern, (route) =>
      route.request().method() === "PATCH" ? route.abort() : route.continue(),
    );
    await page
      .getByRole("switch", { name: `Destacado de ${name}`, exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "No pudimos conectarnos",
    );
    await expect(
      page.getByRole("switch", { name: `Destacado de ${name}`, exact: true }),
    ).toBeChecked();
    await page.unroute(patchPattern);
    await page
      .getByRole("switch", { name: `Visibilidad de ${name}`, exact: true })
      .click();
    await expect(
      page.getByText("Producto activado. Ya está visible en el catálogo."),
    ).toBeVisible();
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await noOverflow(page);
    }
    await page.screenshot({
      path: "test-results/destacados-admin-1440.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 375, height: 900 });
    await page.screenshot({
      path: "test-results/destacados-admin-375.png",
      fullPage: true,
    });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page
      .getByRole("switch", { name: `Destacado de ${name}`, exact: true })
      .click();
    await expect(
      page.getByText("Producto quitado de destacados."),
    ).toBeVisible();
    await expect(page.getByRole("link", { name, exact: true })).toHaveCount(0);
    expect(
      (await (await request.get(`/api/v1/products/${productId}`)).json()).data
        .isFeatured,
    ).toBe(false);
    await page.getByLabel("Destacados", { exact: true }).selectOption("false");
    await expect(
      page.getByRole("switch", { name: `Destacado de ${name}`, exact: true }),
    ).not.toBeChecked();
    await page
      .getByRole("switch", { name: `Destacado de ${name}`, exact: true })
      .click();
    await expect(
      page.getByText("Producto destacado. Ya aparece en la selección pública."),
    ).toBeVisible();
    await page.goto(`/admin/productos/${productId}/editar`);
    await expect(page.getByLabel("Destacar producto")).toBeChecked();
    await page.getByLabel("Destacar producto").uncheck();
    await page.getByRole("button", { name: "Guardar producto" }).click();
    await expect(
      page.getByText("Producto actualizado correctamente."),
    ).toBeVisible();
    const updated = (
      await (await request.get(`/api/v1/products/${productId}`)).json()
    ).data;
    expect(updated.isFeatured).toBe(false);
    expect(updated.isActive).toBe(true);
    expect(updated.price).toBe(23456);
    expect(errors).toEqual([]);
  } finally {
    const response = await request.get(
      `/api/v1/admin/products?categoryId=${categoryId}&limit=100`,
      { headers },
    );
    expect(response.ok()).toBe(true);
    for (const product of (await response.json()).data)
      expect(
        (
          await request.delete(`/api/v1/admin/products/${product.id}`, {
            headers,
          })
        ).status(),
      ).toBe(204);
    expect(
      (
        await request.delete(`/api/v1/categories/${categoryId}`, { headers })
      ).status(),
    ).toBe(204);
  }
});

test("selección vacía, error, reintento y filtros sin resultados", async ({
  page,
}) => {
  const pattern = "**/api/v1/products?isFeatured=true&limit=4&sort=newest";
  await page.goto("/");
  await expect(
    selection(page).getByRole("heading", {
      name: "Estamos preparando nuestra selección",
    }),
  ).toBeVisible();
  await expect(selection(page).getByRole("article")).toHaveCount(0);
  await page.route(pattern, (route) => route.abort());
  await page.reload();
  await expect(selection(page).getByRole("alert")).toContainText(
    "No pudimos conectarnos",
  );
  await page.unroute(pattern);
  await selection(page)
    .getByRole("button", { name: "Volver a intentar" })
    .click();
  await expect(
    selection(page).getByRole("heading", {
      name: "Estamos preparando nuestra selección",
    }),
  ).toBeVisible();
  await selection(page)
    .getByRole("link", { name: "Ver todos los destacados" })
    .click();
  await expect(page.getByText("0 componentes", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No encontramos componentes" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(page.getByText("20 componentes", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Selección", { exact: true })).toHaveValue("");
});
