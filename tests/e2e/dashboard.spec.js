import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("dashboard con datos reales, actualización, responsive, vacío y reintento", async ({
  page,
  request,
}) => {
  test.skip(
    process.env.E2E_ALLOW_WRITES !== "1",
    "Requiere una API con base aislada y E2E_ALLOW_WRITES=1.",
  );
  const response = await request.post("/api/v1/auth/register", {
    data: {
      firstName: "Ana",
      lastName: "Prueba",
      email: `dashboard-${Date.now()}@example.com`,
      phone: "1144445555",
      password: "PruebaSegura123!",
    },
  });
  expect(response.status()).toBe(201);
  const { token } = (await response.json()).data;
  await page.addInitScript(
    (value) => sessionStorage.setItem("pixel-forge-token", value),
    token,
  );
  const headers = { Authorization: `Bearer ${token}` };
  const products = (
    await (
      await request.get("/api/v1/admin/products?limit=100", { headers })
    ).json()
  ).data;
  const metric = (label) =>
    page
      .locator("dl > div")
      .filter({ has: page.getByText(label, { exact: true }) })
      .locator("dd");
  await page.goto("/admin");
  await expect(metric("Total de productos")).toHaveText(
    String(products.length),
  );
  await expect(metric("Productos activos")).toHaveText(
    String(products.filter((product) => product.isActive).length),
  );
  await expect(
    page
      .getByRole("region", { name: "Productos por categoría" })
      .getByRole("listitem"),
  ).toHaveCount(6);
  const inquiryIds = [];
  for (const status of ["pending", "read", "answered"]) {
    const created = await request.post("/api/v1/inquiries", {
      data: {
        name: "Cliente",
        email: "cliente@example.com",
        subject: `Dashboard ${status}`,
        message: "Consulta de prueba",
      },
    });
    expect(created.status()).toBe(201);
    const id = (await created.json()).data.id;
    inquiryIds.push(id);
    expect(
      (
        await request.patch(`/api/v1/inquiries/${id}/status`, {
          headers,
          data: { status },
        })
      ).ok(),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Actualizar", exact: true }).click();
  await expect(metric("Total de consultas")).toHaveText("3");
  await expect(
    page
      .getByRole("region", { name: "Estado de las consultas" })
      .getByText("1 · 33 %"),
  ).toHaveCount(3);
  const product = products[0];
  try {
    expect(
      (
        await request.patch(`/api/v1/admin/products/${product.id}`, {
          headers,
          data: { isActive: !product.isActive },
        })
      ).ok(),
    ).toBe(true);
    await page.getByRole("button", { name: "Actualizar", exact: true }).click();
    await expect(metric("Productos activos")).toHaveText(
      String(
        products.filter((item) => item.isActive).length +
          (product.isActive ? -1 : 1),
      ),
    );
    await expect(metric("Total de productos")).toHaveText(
      String(products.length),
    );
  } finally {
    expect(
      (
        await request.patch(`/api/v1/admin/products/${product.id}`, {
          headers,
          data: { isActive: product.isActive },
        })
      ).ok(),
    ).toBe(true);
  }
  for (const width of [1440, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 1440 || width === 375)
      await page.screenshot({
        path: `test-results/dashboard-${width}.png`,
        fullPage: true,
      });
  }
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);

  for (const id of inquiryIds)
    expect(
      (await request.delete(`/api/v1/inquiries/${id}`, { headers })).status(),
    ).toBe(204);

  await page.route("**/api/v1/admin/products?**", (route) => route.abort());
  await page.getByRole("button", { name: "Actualizar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("No pudimos conectarnos");
  await expect(metric("Total de productos")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Tus productos/ })).toBeVisible();
  await page.unroute("**/api/v1/admin/products?**");
  await page.getByRole("button", { name: "Volver a intentar" }).click();
  await expect(metric("Total de productos")).toHaveText(
    String(products.length),
  );

  await page.route("**/api/v1/admin/products?**", (route) =>
    route.fulfill({ json: { data: [], meta: { total: 0 } } }),
  );
  await page.route("**/api/v1/inquiries?**", (route) =>
    route.fulfill({ json: { data: [], meta: { total: 0 } } }),
  );
  await page.getByRole("button", { name: "Actualizar", exact: true }).click();
  await expect(metric("Total de productos")).toHaveText("0");
  await expect(metric("Total de consultas")).toHaveText("0");
  await expect(page.getByText("Todavía no recibiste consultas.")).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Disponibilidad" })
      .getByText("Todavía no hay productos cargados."),
  ).toBeVisible();
  await page.route("**/api/v1/categories", (route) =>
    route.fulfill({ json: { data: [] } }),
  );
  await page.getByRole("button", { name: "Actualizar", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Productos por categoría" })
      .getByRole("listitem"),
  ).toHaveCount(0);
});
