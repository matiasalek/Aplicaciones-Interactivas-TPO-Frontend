import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeAll(() => {
  if (process.env.E2E_ALLOW_WRITES !== "1")
    throw new Error("Usá una API con base aislada y E2E_ALLOW_WRITES=1.");
});

const minimum = (page) =>
  page.getByLabel("Precio mínimo (ARS)", { exact: true });
const maximum = (page) =>
  page.getByLabel("Precio máximo (ARS)", { exact: true });
const apply = (page) =>
  page.getByRole("button", { name: "Aplicar precio", exact: true }).click();
const params = (page) => new URL(page.url()).searchParams;

test("precios combinados con filtros, paginación, recarga y navegación", async ({
  page,
  request,
}) => {
  const response = await request.get("/api/v1/products?limit=100");
  expect(response.status()).toBe(200);
  const all = (await response.json()).data;
  const ceiling = String(Math.max(...all.map((product) => product.price)));
  const expected = all.filter(
    (product) => product.price >= 129999 && product.price <= 289999,
  );
  await page.goto("/productos?page=2");
  await expect(page.getByText("Página 2 de 2", { exact: true })).toBeVisible();
  await minimum(page).fill("0");
  await maximum(page).fill(ceiling);
  await apply(page);
  await expect(page.getByText("Página 1 de 2", { exact: true })).toBeVisible();
  expect(params(page).get("minPrice")).toBe("0");
  expect(params(page).get("maxPrice")).toBe(ceiling);
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(page.getByText("Página 2 de 2", { exact: true })).toBeVisible();
  expect(params(page).get("minPrice")).toBe("0");
  expect(params(page).get("maxPrice")).toBe(ceiling);

  await minimum(page).fill("129999");
  await maximum(page).fill("289999");
  await apply(page);
  await expect(
    page.getByText(`${expected.length} componentes`, { exact: true }),
  ).toBeVisible();
  expect(params(page).get("page")).toBe("1");
  await expect(page.getByRole("article")).toHaveCount(expected.length);
  for (const product of expected)
    await expect(
      page.getByRole("heading", { name: product.name, exact: true }),
    ).toBeVisible();
  await page.reload();
  await expect(minimum(page)).toHaveValue("129999");
  await expect(maximum(page)).toHaveValue("289999");
  await maximum(page).fill("129999");
  await apply(page);
  await expect(page.getByText("2 componentes", { exact: true })).toBeVisible();
  await page.goBack();
  await expect(maximum(page)).toHaveValue("289999");
  await expect(
    page.getByText(`${expected.length} componentes`, { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Ordenar productos").selectOption("price_desc");
  expect(params(page).get("minPrice")).toBe("129999");
  expect(params(page).get("maxPrice")).toBe("289999");
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 375 || width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `test-results/precios-catalogo-${width}.png`,
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
  await page.getByLabel("Buscar componentes").fill("Ryzen");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  const cpu = all.find((product) => product.name === "AMD Ryzen 5 7600");
  await page
    .getByLabel("Categoría", { exact: true })
    .selectOption(String(cpu.category.id));
  await page
    .getByLabel("Disponibilidad", { exact: true })
    .selectOption("in_stock");
  await expect(
    page.getByRole("heading", { name: cpu.name, exact: true }),
  ).toBeVisible();
  expect(params(page).get("minPrice")).toBe("129999");
  expect(params(page).get("maxPrice")).toBe("289999");
  await page
    .getByRole("button", { name: "Limpiar filtros", exact: true })
    .click();
  await expect(minimum(page)).toHaveValue("");
  await expect(maximum(page)).toHaveValue("");
  await expect(page.getByText("20 componentes", { exact: true })).toBeVisible();
  expect(params(page).get("minPrice")).toBeNull();
  expect(params(page).get("maxPrice")).toBeNull();
});

test("precios inválidos no se consultan y una URL invertida se puede corregir", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/v1/products")
      requests.push(request.url());
  });
  await page.goto("/productos");
  await expect(page.getByText("20 componentes", { exact: true })).toBeVisible();
  requests.length = 0;
  await minimum(page).fill("300");
  await maximum(page).fill("200");
  await apply(page);
  await expect(
    page.getByText("El precio máximo debe ser mayor o igual al mínimo."),
  ).toBeVisible();
  await expect(maximum(page)).toBeFocused();
  expect(params(page).get("minPrice")).toBeNull();
  expect(requests).toEqual([]);
  await minimum(page).fill("-1");
  await apply(page);
  await expect(minimum(page)).toHaveAttribute("aria-invalid", "true");
  await minimum(page).fill("0");
  await maximum(page).fill("1.001");
  await apply(page);
  await expect(maximum(page)).toHaveAttribute("aria-invalid", "true");
  await maximum(page).fill("10000000000");
  await apply(page);
  await expect(maximum(page)).toHaveAttribute("aria-invalid", "true");
  expect(requests).toEqual([]);

  await page.goto("/productos?minPrice=500&maxPrice=100");
  await expect(page.getByRole("alert")).toContainText(
    "Corregí el rango de precios",
  );
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(minimum(page)).toHaveValue("500");
  await expect(maximum(page)).toHaveValue("100");
  expect(requests).toEqual([]);
  await minimum(page).fill("0");
  await maximum(page).fill("0");
  await apply(page);
  await expect(page.getByText("0 componentes", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No encontramos componentes" }),
  ).toBeVisible();
  expect(params(page).get("maxPrice")).toBe("0");
  await page
    .getByRole("button", { name: "Limpiar filtros", exact: true })
    .click();
  await expect(page.getByText("20 componentes", { exact: true })).toBeVisible();
});
