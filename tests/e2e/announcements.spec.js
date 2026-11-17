import { expect, test } from "@playwright/test";
import { money } from "../../src/lib/api";

test.beforeAll(() => {
  if (process.env.E2E_ALLOW_WRITES !== "1")
    throw new Error("Usá una API con base aislada y E2E_ALLOW_WRITES=1.");
});

test("publica una oferta con el mismo precio en Inicio, catálogo, filtros y detalle", async ({
  page,
  request,
}) => {
  const unique = Date.now();
  const productName = `Producto oferta ${unique}`;
  const title = `Promoción ${unique}`;
  const news = `Novedad ${unique}`;
  const apiPath = "/api/v1/admin/announcements";
  const registration = await request.post("/api/v1/auth/register", {
    data: {
      firstName: "Ana",
      lastName: "Prueba",
      email: `promociones-${unique}@example.com`,
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
  const category = (await (await request.get("/api/v1/categories")).json())
    .data[0];
  const productResponse = await request.post("/api/v1/admin/products", {
    headers,
    data: {
      name: productName,
      description: "Prueba de una oferta publicada.",
      categoryId: category.id,
      price: 500,
      imageUrl: "https://placehold.co/800x600",
    },
  });
  expect(productResponse.status()).toBe(201);
  const productId = (await productResponse.json()).data.id;
  const list = "/admin/novedades";
  const catalog = `/productos?q=${encodeURIComponent(productName)}`;
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: productName, exact: true }),
  });

  try {
    await page.goto(list);
    await page.getByRole("link", { name: "Nueva publicación" }).click();
    await page.getByLabel("Tipo").selectOption("promotion");
    await page.getByLabel("Título").fill(title);
    await page.getByLabel("Texto").fill("Oferta temporal para el catálogo.");
    await page
      .getByLabel("Producto (opcional)")
      .selectOption(String(productId));
    const price = page.getByLabel("Precio promocional (ARS)");
    const save = page.getByRole("button", { name: "Guardar publicación" });
    const row = page.getByRole("row").filter({ hasText: title });
    await price.fill("500");
    await page.getByRole("button", { name: "Crear publicación" }).click();
    await expect(
      page.getByText("El precio promocional debe ser menor que el habitual."),
    ).toBeVisible();
    await price.fill("125.5");
    await page.getByRole("button", { name: "Crear publicación" }).click();
    await expect(row.getByText("Borrador")).toBeVisible();
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toHaveCount(0);
    await page.goto(catalog);
    await expect(card.getByText(money(500), { exact: true })).toBeVisible();
    await expect(card.getByText("Oferta", { exact: true })).toHaveCount(0);

    await page.goto(list);
    await row.getByRole("link", { name: `Editar ${title}` }).click();
    await page.getByLabel("Estado").selectOption("published");
    await save.click();
    await expect(row.getByText("Publicada")).toBeVisible();
    await page.goto("/");
    const announcement = page.getByRole("article").filter({ hasText: title });
    await expect(announcement.locator("s")).toHaveText(money(500));
    await expect(announcement).toContainText(money(125.5));
    await announcement
      .getByRole("link", { name: `Ver ${productName}` })
      .click();
    await expect(
      page.getByRole("heading", { name: productName, level: 1, exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Oferta", { exact: true })).toBeVisible();
    await expect(page.locator("s")).toHaveText(money(500));
    await expect(page.getByText(money(125.5), { exact: false })).toBeVisible();

    await page.goto(catalog);
    await page.getByLabel("Precio máximo (ARS)").fill("130");
    await page.getByRole("button", { name: "Aplicar precio" }).click();
    await expect(page).toHaveURL(/maxPrice=130/);
    await expect(card.getByText("Oferta", { exact: true })).toBeVisible();
    await expect(card.locator("s")).toHaveText(money(500));
    await expect(card).toContainText(money(125.5));
    await page.setViewportSize({ width: 375, height: 850 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);

    await page.goto(list);
    await row.getByRole("link", { name: `Editar ${title}` }).click();
    await page.getByLabel("Estado").selectOption("draft");
    await save.click();
    await expect(row.getByText("Borrador")).toBeVisible();
    await page.goto(catalog);
    await expect(card.getByText(money(500), { exact: true })).toBeVisible();
    await expect(card.getByText("Oferta", { exact: true })).toHaveCount(0);

    await page.goto(list);
    await row.getByRole("button", { name: `Eliminar ${title}` }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Eliminar", exact: true })
      .click();
    await expect(page.getByText("Publicación eliminada.")).toBeVisible();
    await page.getByRole("link", { name: "Nueva publicación" }).click();
    await page.getByLabel("Título").fill(news);
    await page.getByLabel("Texto").fill("Esta novedad aparece en el inicio.");
    await page.getByLabel("Estado").selectOption("published");
    await page.getByRole("button", { name: "Crear publicación" }).click();
    await expect(page.getByText("Publicación creada.")).toBeVisible();
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: news, exact: true }),
    ).toBeVisible();
  } finally {
    const response = await request.get(apiPath, { headers });
    if (response.ok()) {
      const { data } = await response.json();
      for (const item of data.filter((item) =>
        [title, news].includes(item.title),
      ))
        await request.delete(`${apiPath}/${item.id}`, { headers });
    }
    await request.delete(`/api/v1/admin/products/${productId}`, { headers });
  }
});
