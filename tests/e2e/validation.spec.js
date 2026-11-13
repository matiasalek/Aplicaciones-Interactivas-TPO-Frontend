import { test, expect } from "@playwright/test";

test.beforeAll(() => {
  if (process.env.E2E_ALLOW_WRITES !== "1")
    throw new Error("Usá una API con base aislada y E2E_ALLOW_WRITES=1.");
});

test("contacto y contraseñas rechazan datos inválidos antes de enviarlos", async ({
  page,
}) => {
  const writes = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/api/v1/"))
      writes.push(request.url());
  });
  await page.goto("/contacto");
  await page.getByLabel("Nombre", { exact: false }).fill("Ana Prueba");
  await page.getByLabel("Correo electrónico").fill("ana..p@example.com");
  await page.getByLabel("Teléfono (opcional)").fill("abcde");
  await page.getByLabel("Asunto").fill("Validación");
  await page.getByLabel("Mensaje").fill("Consulta de prueba");
  await page.getByRole("button", { name: "Enviar consulta" }).click();
  await expect(page.getByLabel("Correo electrónico")).toBeFocused();
  await expect(
    page.getByText("Ingresá un correo electrónico válido."),
  ).toBeVisible();
  await expect(page.getByLabel("Teléfono (opcional)")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("Correo electrónico").fill("ana+pc@example.com");
  await page.getByLabel("Teléfono (opcional)").fill("+54 (11) 4444-5555");
  await expect(page.getByLabel("Correo electrónico")).toHaveAttribute(
    "aria-invalid",
    "false",
  );
  await expect(page.getByLabel("Teléfono (opcional)")).toHaveAttribute(
    "aria-invalid",
    "false",
  );

  await page.goto("/registrarse");
  await page.getByRole("textbox", { name: "Nombre", exact: true }).fill("Ana");
  await page.getByLabel("Apellido").fill("Prueba");
  await page.getByLabel("Correo electrónico").fill("ana+pc@example.com");
  await page
    .getByRole("textbox", { name: "Teléfono", exact: true })
    .fill("+54 (11) 4444-5555");
  await page.getByLabel(/^Contraseña/).fill("😀".repeat(19));
  await page.getByLabel("Repetí la contraseña").fill("😀".repeat(19));
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(page.getByText(/Usá una contraseña más corta;/)).toHaveCount(2);
  await expect(page.getByLabel(/^Contraseña/)).toBeFocused();
  await page.getByLabel(/^Contraseña/).fill("😀".repeat(18));
  await page.getByLabel("Repetí la contraseña").fill("😀".repeat(18));
  await expect(page.getByText(/Usá una contraseña más corta;/)).toHaveCount(0);

  await page.goto("/restablecer-contrasena");
  await page.getByLabel("Código de recuperación").fill("a".repeat(64));
  await page.getByLabel("Nueva contraseña").fill("é".repeat(37));
  await page.getByLabel("Repetí la contraseña").fill("é".repeat(37));
  await page.getByRole("button", { name: "Actualizar contraseña" }).click();
  await expect(page.getByText(/Usá una contraseña más corta;/)).toHaveCount(2);
  expect(writes).toEqual([]);
});

test("productos y comercio validan precios, imágenes, redes y teléfonos", async ({
  page,
  request,
}) => {
  const unique = Date.now();
  const registration = await request.post("/api/v1/auth/register", {
    data: {
      firstName: "Ana",
      lastName: "Prueba",
      email: `validacion-${unique}@example.com`,
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
  const categories = (await (await request.get("/api/v1/categories")).json())
    .data;
  const name = `Validación ${unique}`;
  const writes = [];
  page.on("request", (request) => {
    if (
      ["POST", "PATCH", "PUT"].includes(request.method()) &&
      request.url().includes("/api/v1/")
    )
      writes.push(request.url());
  });
  let productId;
  try {
    await page.goto("/admin/productos/nuevo");
    await page.getByLabel("Nombre del producto").fill(name);
    await page
      .getByLabel("Categoría", { exact: false })
      .selectOption(String(categories[0].id));
    await page
      .getByLabel("Descripción")
      .fill("Validación de precios e imágenes");
    await page.getByLabel("URL de la imagen").fill("ftp://example.com/a.png");
    await page.getByLabel("Precio (ARS)").fill("1.000000001");
    await page
      .getByRole("button", { name: "Crear producto", exact: true })
      .click();
    await expect(page.getByLabel("URL de la imagen")).toBeFocused();
    await expect(
      page.getByText("Usá una URL que comience con http:// o https://."),
    ).toBeVisible();
    await expect(
      page.getByText("Usá como máximo dos decimales."),
    ).toBeVisible();
    expect(writes).toEqual([]);
    await page
      .getByLabel("URL de la imagen")
      .fill("https://placehold.co/800x600");
    await page.getByLabel("Precio (ARS)").fill("0.29");
    await page
      .getByRole("button", { name: "Crear producto", exact: true })
      .click();
    await expect(
      page.getByText("Producto creado correctamente."),
    ).toBeVisible();
    const products = (
      await (
        await request.get("/api/v1/admin/products?limit=100", { headers })
      ).json()
    ).data;
    const product = products.find((product) => product.name === name);
    productId = product.id;
    expect(product.price).toBe(0.29);

    await page.goto("/admin/comercio");
    await page.getByLabel("Nombre del comercio").fill("Comercio de prueba");
    await page
      .getByLabel("Descripción", { exact: false })
      .fill("Prueba de validaciones");
    await page.getByLabel("Dirección").fill("Av. Corrientes 1234");
    await page
      .getByRole("textbox", { name: "Teléfono", exact: true })
      .fill("abcde");
    await page.getByLabel("Horarios de atención").fill("Lunes a viernes");
    await page.getByLabel("Sitio web").fill("ftp://example.com");
    await page.getByRole("button", { name: "Guardar información" }).click();
    await expect(
      page.getByRole("textbox", { name: "Teléfono", exact: true }),
    ).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Sitio web")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(writes).toHaveLength(1);
    await page
      .getByRole("textbox", { name: "Teléfono", exact: true })
      .fill("+54 (11) 4444-5555");
    await page.getByLabel("Sitio web").fill("https://example.com");
    await expect(
      page.getByRole("textbox", { name: "Teléfono", exact: true }),
    ).toHaveAttribute("aria-invalid", "false");
    await expect(page.getByLabel("Sitio web")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  } finally {
    if (productId)
      expect(
        (
          await request.delete(`/api/v1/admin/products/${productId}`, {
            headers,
          })
        ).status(),
      ).toBe(204);
  }
});
