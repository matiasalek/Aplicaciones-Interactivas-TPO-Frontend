import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeAll(() => {
  if (process.env.E2E_ALLOW_WRITES !== "1")
    throw new Error(
      "Estas pruebas escriben datos. Usá una API con base aislada y establecé E2E_ALLOW_WRITES=1.",
    );
});

async function expectNoOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}
async function getToken(page) {
  return page.evaluate(() => sessionStorage.getItem("pixel-forge-token"));
}
async function assertAccessible(page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

test("catálogo real, búsqueda, filtros, paginación, detalle y validaciones de contacto", async ({
  page,
  request,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const seed = await request.get("/api/v1/products?limit=100");
  expect(seed.ok()).toBe(true);
  expect((await seed.json()).meta.total).toBeGreaterThanOrEqual(20);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Buenas piezas/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Encontrá tu categoría." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Procesadores", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/inicio-desktop.png",
    fullPage: true,
  });
  await expectNoOverflow(page);
  await assertAccessible(page);
  await page.goto("/productos");
  await expect(page.getByText("20 componentes", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText("Página 2 de 2", { exact: true })).toBeVisible();
  await page.getByLabel("Buscar componentes").fill("Ryzen");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(
    page.getByText("2 componentes para “Ryzen”", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Buscar componentes")).toHaveValue("Ryzen");
  await page
    .getByRole("heading", { name: "AMD Ryzen 5 7600", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "AMD Ryzen 5 7600", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Consultar por este producto" }).click();
  await expect(page.getByLabel("Asunto")).toHaveValue(
    "Consulta por AMD Ryzen 5 7600",
  );
  await page.getByRole("button", { name: "Enviar consulta" }).click();
  await expect(page.getByLabel("Nombre", { exact: false })).toBeFocused();
  await expect(page.getByText("Completá este campo.").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("responsive, menú móvil, modo claro y accesibilidad del formulario", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Buenas piezas/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/inicio-mobile.png",
    fullPage: true,
  });
  await expectNoOverflow(page);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    ),
  ).toBe("light");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link", { name: "Componentes", exact: true })
    .click();
  await expect(page.getByText("20 componentes", { exact: true })).toBeVisible();
  await expectNoOverflow(page);
  await page
    .getByLabel("Disponibilidad", { exact: true })
    .selectOption("out_of_stock");
  await expect(page.getByText("2 componentes", { exact: true })).toBeVisible();
  await page.goto("/contacto");
  await assertAccessible(page);
  await expectNoOverflow(page);
});

test("errores de red, reintento, 404 y protección de rutas", async ({
  page,
}) => {
  await page.route("**/api/v1/products?**", (route) => route.abort());
  await page.goto("/productos");
  await expect(
    page.getByRole("alert").filter({ hasText: "No pudimos conectarnos" }),
  ).toBeVisible();
  await page.unroute("**/api/v1/products?**");
  await page.getByRole("button", { name: "Volver a intentar" }).click();
  await expect(page.getByText("20 componentes", { exact: true })).toBeVisible();
  await page.goto("/admin/productos");
  await expect(page).toHaveURL(/ingresar/);
  await page.goto("/productos/no-es-un-id");
  await expect(
    page.getByRole("heading", { name: "Producto no encontrado" }),
  ).toBeVisible();
  await page.goto("/no-existe");
  await expect(
    page.getByRole("heading", { name: "Esta página no existe" }),
  ).toBeVisible();
});

test("correo duplicado visible en registro y redirección al revocarse una sesión", async ({
  page,
  request,
}) => {
  const email = `sesion-${Date.now()}@example.com`;
  const data = {
    firstName: "Ana",
    lastName: "Test",
    email,
    phone: "1144445555",
    password: "Segura123!",
  };
  expect((await request.post("/api/v1/auth/register", { data })).status()).toBe(
    201,
  );
  await page.goto("/registrarse");
  await page.getByLabel("Nombre").fill(data.firstName);
  await page.getByLabel("Apellido").fill(data.lastName);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Teléfono").fill(data.phone);
  await page.getByLabel(/^Contraseña/).fill(data.password);
  await page.getByLabel("Repetí la contraseña").fill(data.password);
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Ya existe una cuenta con ese correo electrónico.",
  );
  await page.goto("/admin/productos");
  await expect(page).toHaveURL(/ingresar/);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel(/^Contraseña/).fill(data.password);
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/productos$/);
  const token = await getToken(page);
  expect(
    (
      await request.post("/api/v1/auth/logout", {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).status(),
  ).toBe(204);
  await page
    .getByRole("navigation", { name: "Administración" })
    .getByRole("link", { name: "Mi perfil" })
    .click();
  await expect(page).toHaveURL(/ingresar/);
  await expect(
    page.getByText("Tu sesión finalizó. Ingresá nuevamente para continuar."),
  ).toBeVisible();
});

test("pantallas públicas sin desborde en tablet y escritorio mediano", async ({
  page,
}) => {
  for (const width of [768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/productos",
      "/nosotros",
      "/contacto",
      "/ingresar",
      "/registrarse",
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await expectNoOverflow(page);
    }
  }
});

test("administración completa con persistencia real, recuperación y revocación", async ({
  page,
  request,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const unique = Date.now();
  const email = `e2e-${unique}@example.com`;
  const password = "ClaveInicial123!";
  const newPassword = "ClaveRenovada123!";
  const categoryName = `Categoría E2E ${unique}`;
  const productName = `Producto E2E ${unique}`;
  const subject = `Consulta E2E ${unique}`;
  await page.goto("/registrarse");
  await page.getByLabel("Nombre", { exact: false }).fill("Ada");
  await page.getByLabel("Apellido").fill("Lovelace");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Teléfono").fill("1144445555");
  await page.getByLabel(/^Contraseña/).fill(password);
  await page.getByLabel("Repetí la contraseña").fill(password);
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Hola, Ada." })).toBeVisible();
  const token = await getToken(page);
  const headers = { Authorization: `Bearer ${token}` };
  const duplicate = await request.post("/api/v1/auth/register", {
    data: {
      firstName: "Otra",
      lastName: "Cuenta",
      email,
      phone: "1144445555",
      password,
    },
  });
  expect(duplicate.status()).toBe(409);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/administracion-desktop.png",
    fullPage: true,
  });
  await assertAccessible(page);

  await test.step("perfil e información institucional", async () => {
    await page.goto("/admin/perfil");
    await page.getByLabel("Teléfono").fill("1155556666");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(
      page.getByText("Tus datos se actualizaron correctamente."),
    ).toBeVisible();
    expect(
      (await (await request.get("/api/v1/profile", { headers })).json()).data
        .phone,
    ).toBe("1155556666");
    await page.goto("/admin/comercio");
    await page
      .getByLabel("Nombre del comercio")
      .fill("Pixel Forge Componentes");
    await page
      .getByLabel("Descripción", { exact: false })
      .fill("Componentes y asesoramiento para tu próxima PC.");
    await page.getByLabel("Dirección").fill("Av. Corrientes 1234, CABA");
    await page.getByLabel("Teléfono").fill("1144445555");
    await page
      .getByLabel("Horarios de atención")
      .fill("Lunes a viernes de 10 a 19 h");
    await page.getByLabel("Instagram").fill("https://instagram.com/pixelforge");
    await page.getByRole("button", { name: "Guardar información" }).click();
    await expect(
      page.getByText(/Información del comercio guardada/),
    ).toBeVisible();
    await page.goto("/nosotros");
    await expect(
      page.getByText("Componentes y asesoramiento para tu próxima PC.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  let categoryId;
  let productId;
  await test.step("crear y editar categoría y producto", async () => {
    await page.goto("/admin/categorias/nueva");
    await page.getByLabel("Nombre").fill(categoryName);
    await page.getByLabel("Descripción").fill("Pruebas de navegador");
    await page.getByRole("button", { name: "Crear categoría" }).click();
    await expect(
      page.getByText("Categoría creada correctamente."),
    ).toBeVisible();
    const categories = (await (await request.get("/api/v1/categories")).json())
      .data;
    categoryId = categories.find(
      (category) => category.name === categoryName,
    ).id;
    await page.goto(`/admin/categorias/${categoryId}/editar`);
    await page.getByLabel("Descripción").fill("Descripción editada");
    await page.getByRole("button", { name: "Guardar categoría" }).click();
    await expect(
      page.getByText("Categoría actualizada correctamente."),
    ).toBeVisible();
    await page.goto("/admin/productos/nuevo");
    await page.getByLabel("Nombre del producto").fill(productName);
    await page
      .getByLabel("Categoría", { exact: false })
      .selectOption(String(categoryId));
    await page
      .getByLabel("Descripción")
      .fill("Componente de prueba con persistencia real.");
    await page
      .getByLabel("URL de la imagen")
      .fill("https://placehold.co/800x600");
    await page.getByLabel("Precio (ARS)").fill("12345.67");
    await page.getByRole("button", { name: "Crear producto" }).click();
    await expect(
      page.getByText("Producto creado correctamente."),
    ).toBeVisible();
    const products = (
      await (
        await request.get("/api/v1/admin/products?limit=100", { headers })
      ).json()
    ).data;
    productId = products.find((product) => product.name === productName).id;
    await page.goto(`/admin/productos/${productId}/editar`);
    await page.getByLabel("Precio (ARS)").fill("23456.78");
    await page.getByRole("button", { name: "Guardar producto" }).click();
    await expect(
      page.getByText("Producto actualizado correctamente."),
    ).toBeVisible();
    await page
      .getByRole("switch", { name: `Visibilidad de ${productName}` })
      .click();
    await expect(
      page.getByText(
        "Producto desactivado. Ya no se muestra en el catálogo público.",
      ),
    ).toBeVisible();
    expect((await request.get(`/api/v1/products/${productId}`)).status()).toBe(
      404,
    );
    expect(
      (
        await request.get(`/api/v1/admin/products/${productId}`, { headers })
      ).status(),
    ).toBe(200);
    await page
      .getByRole("switch", { name: `Visibilidad de ${productName}` })
      .click();
    await expect(
      page.getByText("Producto activado. Ya está visible en el catálogo."),
    ).toBeVisible();
    expect(
      (await (await request.get(`/api/v1/products/${productId}`)).json()).data
        .price,
    ).toBe(23456.78);
    await page.goto("/admin/categorias");
    await page
      .getByRole("button", { name: `Eliminar ${categoryName}`, exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Eliminar", exact: true })
      .click();
    await expect(
      page
        .getByRole("dialog")
        .getByText(/Esta categoría tiene productos asociados/),
    ).toBeVisible();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Cancelar" })
      .click();
  });

  await test.step("contacto público y gestión de consultas", async () => {
    await page.goto("/contacto");
    await page.getByLabel("Nombre").fill("Cliente de prueba");
    await page.getByLabel("Correo electrónico").fill("cliente@example.com");
    await page.getByLabel("Asunto").fill(subject);
    await page.getByLabel("Mensaje").fill("¿Me ayudan a elegir un componente?");
    await page.getByRole("button", { name: "Enviar consulta" }).click();
    await expect(
      page.getByRole("heading", { name: "Tu consulta ya está en camino." }),
    ).toBeVisible();
    await page.goto("/admin/consultas");
    await page.getByRole("link", { name: subject, exact: true }).click();
    await page.getByLabel(/^Estado/).selectOption("read");
    await page.getByRole("button", { name: "Actualizar estado" }).click();
    await expect(
      page.getByText("Estado de la consulta actualizado."),
    ).toBeVisible();
    await page.getByLabel(/^Estado/).selectOption("answered");
    await page.getByRole("button", { name: "Actualizar estado" }).click();
    await expect(page.getByLabel(/^Estado/)).toHaveValue("answered");
    await page.getByRole("button", { name: "Eliminar consulta" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Eliminar", exact: true })
      .click();
    await expect(page).toHaveURL(/\/admin\/consultas$/);
  });

  await test.step("recuperación, revocación y nuevo inicio de sesión", async () => {
    await page.goto("/recuperar-contrasena");
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByRole("button", { name: "Generar código" }).click();
    await expect(page.getByLabel("Código de recuperación")).toHaveValue(
      /^[a-f0-9]{64}$/,
    );
    await page.getByRole("link", { name: "Elegir nueva contraseña" }).click();
    await page.getByLabel("Nueva contraseña").fill(newPassword);
    await page.getByLabel("Repetí la contraseña").fill(newPassword);
    await page.getByRole("button", { name: "Actualizar contraseña" }).click();
    await expect(page.getByText(/Contraseña actualizada/)).toBeVisible();
    expect((await request.get("/api/v1/profile", { headers })).status()).toBe(
      401,
    );
    await page
      .getByRole("link", { name: "Iniciar sesión", exact: true })
      .click();
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel(/^Contraseña/).fill(newPassword);
    await page
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Hola, Ada." }),
    ).toBeVisible();
  });

  await test.step("eliminación, versión móvil administrativa y cierre", async () => {
    await page.goto("/admin/productos");
    await page
      .getByRole("button", { name: `Eliminar ${productName}`, exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Eliminar", exact: true })
      .click();
    await expect(
      page.getByText("Producto eliminado.", { exact: true }),
    ).toBeVisible();
    await page.goto("/admin/categorias");
    await page
      .getByRole("button", { name: `Eliminar ${categoryName}`, exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Eliminar", exact: true })
      .click();
    await expect(
      page.getByText("Categoría eliminada.", { exact: true }),
    ).toBeVisible();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/admin/productos");
    await expect(
      page.getByRole("heading", { name: "Productos", exact: true }),
    ).toBeVisible();
    await expectNoOverflow(page);
    await page.screenshot({
      path: "test-results/administracion-mobile.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Alternar menú administrativo" })
      .click();
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/ingresar/);
    await page.goto("/admin/perfil");
    await expect(page).toHaveURL(/ingresar/);
  });
  expect(errors).toEqual([]);
});
