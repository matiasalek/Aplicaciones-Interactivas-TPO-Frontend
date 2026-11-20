import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeAll(() => {
  if (process.env.E2E_ALLOW_WRITES !== "1")
    throw new Error("Usá una API con base aislada y E2E_ALLOW_WRITES=1.");
});

const urlField = (page, index) =>
  page.getByRole("textbox", {
    name: index === 1 ? "URL de la imagen" : `URL de la imagen ${index}`,
    exact: true,
  });
async function signIn(page, request, label) {
  const response = await request.post("/api/v1/auth/register", {
    data: {
      firstName: "Ana",
      lastName: "Galerías",
      email: `${label}-${Date.now()}@example.com`,
      phone: "1144445555",
      password: "Segura123!",
      inviteCode: process.env.E2E_ADMIN_INVITE_CODE,
    },
  });
  expect(response.status()).toBe(201);
  const { token } = (await response.json()).data;
  await page.addInitScript(
    (value) => sessionStorage.setItem("pixel-forge-token", value),
    token,
  );
  return { Authorization: `Bearer ${token}` };
}
async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test("galería real: agregar, ordenar, cambiar principal, miniaturas, errores y eliminación", async ({
  page,
  request,
}) => {
  const headers = await signIn(page, request, "galeria");
  const unique = Date.now();
  const name = `Galería E2E ${unique}`;
  const urls = ["front.svg", "back.svg", "side.svg", "missing.svg"].map(
    (file) => `https://images.example.test/gallery/${file}`,
  );
  await page.route("https://images.example.test/gallery/**", (route) => {
    if (route.request().url().endsWith("missing.svg")) return route.abort();
    const filename = new URL(route.request().url()).pathname.split("/").at(-1);
    const color =
      filename === "front.svg"
        ? "#4f6c30"
        : filename === "back.svg"
          ? "#3e6186"
          : "#71511c";
    return route.fulfill({
      contentType: "image/svg+xml",
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="${color}"/><text x="400" y="300" text-anchor="middle" fill="white" font-size="60">${filename}</text></svg>`,
    });
  });
  const categoryResponse = await request.post("/api/v1/categories", {
    headers,
    data: { name: `Galerías ${unique}`, description: "Galería de prueba" },
  });
  expect(categoryResponse.status()).toBe(201);
  const categoryId = (await categoryResponse.json()).data.id;
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const writes = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/api/v1/admin/products"
    )
      writes.push(request);
  });
  let productId;
  try {
    await page.goto("/admin/productos/nuevo");
    await page.getByLabel("Nombre del producto").fill(name);
    await page
      .getByLabel("Categoría", { exact: false })
      .selectOption(String(categoryId));
    await page
      .getByLabel("Descripción")
      .fill("Producto con varias imágenes para probar su galería.");
    await page.getByLabel("Precio (ARS)").fill("12345.67");
    await page.getByLabel("Destacar producto").check();
    await urlField(page, 1).fill(urls[0]);
    await page
      .getByRole("button", { name: "Agregar imagen", exact: true })
      .click();
    await expect(urlField(page, 2)).toBeFocused();
    await urlField(page, 2).fill(urls[0]);
    await page
      .getByRole("button", { name: "Agregar imagen", exact: true })
      .click();
    await urlField(page, 3).fill(urls[3]);
    await page
      .getByRole("button", { name: "Crear producto", exact: true })
      .click();
    await expect(
      page.getByText("Esta imagen ya está en la galería."),
    ).toBeVisible();
    await expect(urlField(page, 2)).toBeFocused();
    expect(writes).toHaveLength(0);
    await urlField(page, 2).fill(urls[1]);
    await expect(
      page.getByText("Esta imagen ya está en la galería."),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Crear producto", exact: true })
      .click();
    await expect(
      page.getByText("Producto creado correctamente."),
    ).toBeVisible();
    expect(writes).toHaveLength(1);
    expect(writes[0].postDataJSON().imageUrls).toEqual([
      urls[0],
      urls[1],
      urls[3],
    ]);
    expect(writes[0].postDataJSON()).not.toHaveProperty("additionalImageUrls");
    const products = (
      await (
        await request.get(`/api/v1/admin/products?categoryId=${categoryId}`, {
          headers,
        })
      ).json()
    ).data;
    productId = products.find((product) => product.name === name).id;
    expect(products[0].imageUrls).toEqual([urls[0], urls[1], urls[3]]);

    await page.goto(`/productos/${productId}`);
    const gallery = page.getByRole("region", {
      name: `Imágenes de ${name}`,
      exact: true,
    });
    await expect(
      gallery.getByRole("img", { name: `${name}, imagen 1 de 3`, exact: true }),
    ).toHaveAttribute("src", urls[0]);
    await gallery
      .getByRole("button", { name: "Ver imagen 2 de 3", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(
      gallery.getByRole("img", { name: `${name}, imagen 2 de 3`, exact: true }),
    ).toHaveAttribute("src", urls[1]);
    await gallery
      .getByRole("button", { name: "Ver imagen 3 de 3", exact: true })
      .click();
    await expect(
      gallery.getByText("Imagen 3 de 3", { exact: true }),
    ).toBeVisible();
    await expect(
      gallery.getByText("Ilustración de categoría", { exact: true }),
    ).toBeVisible();
    await gallery.getByRole("button", { name: /Ver imagen 1 de 3/ }).click();
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await noOverflow(page);
      if (width === 375 || width === 1440) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: `test-results/galeria-detalle-${width}.png`,
          fullPage: true,
        });
      }
    }
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);

    await page.goto(`/admin/productos/${productId}/editar`);
    await expect(urlField(page, 3)).toHaveValue(urls[3]);
    await page
      .getByRole("button", { name: "Subir imagen 2", exact: true })
      .click();
    await expect(urlField(page, 1)).toHaveValue(urls[1]);
    await expect(urlField(page, 1)).toBeFocused();
    await page
      .getByRole("button", { name: "Eliminar imagen 3", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Agregar imagen", exact: true })
      .click();
    await urlField(page, 3).fill(urls[2]);
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await noOverflow(page);
      if (width === 375 || width === 1440) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: `test-results/galeria-editor-${width}.png`,
          fullPage: true,
        });
      }
    }
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await expect(
      page.getByText("Producto actualizado correctamente."),
    ).toBeVisible();
    const updated = (
      await (await request.get(`/api/v1/products/${productId}`)).json()
    ).data;
    expect(updated.imageUrls).toEqual([urls[1], urls[0], urls[2]]);
    expect(updated.imageUrl).toBe(urls[1]);
    expect(updated.isFeatured).toBe(true);
    await page.goto(`/productos?categoryId=${categoryId}`);
    await expect(
      page.getByRole("article").getByRole("img", { name, exact: true }),
    ).toHaveAttribute("src", urls[1]);

    await page.goto(`/admin/productos/${productId}/editar`);
    await page.reload();
    await expect(urlField(page, 1)).toHaveValue(urls[1]);
    await expect(urlField(page, 3)).toHaveValue(urls[2]);
    await page
      .getByRole("button", { name: "Eliminar imagen 1", exact: true })
      .click();
    await expect(urlField(page, 1)).toHaveValue(urls[0]);
    await page
      .getByRole("button", { name: "Eliminar imagen 2", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Eliminar imagen 1", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: "Guardar producto", exact: true })
      .click();
    await expect(
      page.getByText("Producto actualizado correctamente."),
    ).toBeVisible();
    await page.goto(`/productos/${productId}`);
    await expect(
      page.getByRole("group", { name: "Elegir imagen del producto" }),
    ).toHaveCount(0);
    expect(
      (await (await request.get(`/api/v1/products/${productId}`)).json()).data
        .imageUrls,
    ).toEqual([urls[0]]);
    await page.goto(`/admin/productos?categoryId=${categoryId}`);
    await page
      .getByRole("button", { name: `Eliminar ${name}`, exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Eliminar", exact: true })
      .click();
    await expect(
      page.getByText("Producto eliminado.", { exact: true }),
    ).toBeVisible();
    expect((await request.get(`/api/v1/products/${productId}`)).status()).toBe(
      404,
    );
    expect(errors).toEqual([]);
  } finally {
    const response = await request.get(
      `/api/v1/admin/products?categoryId=${categoryId}&limit=100`,
      { headers },
    );
    expect(response.status()).toBe(200);
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

test("límite de diez imágenes y errores locales por fila sin enviar datos", async ({
  page,
  request,
}) => {
  await signIn(page, request, "galeria-limite");
  const categories = (await (await request.get("/api/v1/categories")).json())
    .data;
  const writes = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/api/v1/admin/products"
    )
      writes.push(request.url());
  });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/admin/productos/nuevo");
  await page.getByLabel("Nombre del producto").fill("Galería de límite");
  await page
    .getByLabel("Categoría", { exact: false })
    .selectOption(String(categories[0].id));
  await page.getByLabel("Descripción").fill("Validación de galerías");
  await page.getByLabel("Precio (ARS)").fill("100");
  const urls = Array.from(
    { length: 10 },
    (_, index) => `https://placehold.co/800x600?text=Imagen${index + 1}`,
  );
  await urlField(page, 1).fill(urls[0]);
  for (let index = 2; index <= 10; index++) {
    await page
      .getByRole("button", { name: "Agregar imagen", exact: true })
      .click();
    await urlField(page, index).fill(urls[index - 1]);
  }
  await expect(
    page.getByRole("button", { name: "Agregar imagen", exact: true }),
  ).toBeDisabled();
  await expect(
    page
      .getByRole("group", { name: "Imágenes del producto", exact: true })
      .getByRole("textbox"),
  ).toHaveCount(10);
  await urlField(page, 10).fill("");
  await page
    .getByRole("button", { name: "Crear producto", exact: true })
    .click();
  await expect(urlField(page, 10)).toBeFocused();
  await expect(urlField(page, 10)).toHaveAttribute("aria-invalid", "true");
  await urlField(page, 10).fill("ftp://example.com/a.png");
  await expect(
    page.getByText("Usá una URL que comience con http:// o https://.", {
      exact: true,
    }),
  ).toBeVisible();
  await urlField(page, 10).fill(urls[0]);
  await expect(
    page.getByText("Esta imagen ya está en la galería."),
  ).toBeVisible();
  await urlField(page, 10).fill(urls[9]);
  await expect(urlField(page, 10)).toHaveAttribute("aria-invalid", "false");
  await noOverflow(page);
  await page
    .getByRole("button", { name: "Eliminar imagen 1", exact: true })
    .click();
  await expect(urlField(page, 1)).toHaveValue(urls[1]);
  await expect(
    page.getByRole("button", { name: "Agregar imagen", exact: true }),
  ).toBeEnabled();
  expect(writes).toEqual([]);
});
