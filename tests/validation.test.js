import test from "node:test";
import assert from "node:assert/strict";
import {
  clean,
  rules,
  validate,
  validatePriceRange,
} from "../src/lib/validation.js";
import { queryString, safeWebUrl } from "../src/lib/api.js";

test("el registro valida todos los datos requeridos y la confirmación", () => {
  assert.equal(Object.keys(validate({}, rules.register)).length, 7);
  const valid = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phone: "1144445555",
    password: "ClaveSegura123",
    confirmPassword: "ClaveSegura123",
    inviteCode: "invitacion-de-prueba",
  };
  assert.deepEqual(validate(valid, rules.register), {});
  assert.ok(validate({ ...valid, inviteCode: " " }, rules.register).inviteCode);
  assert.ok(
    validate({ ...valid, confirmPassword: "distinta" }, rules.register)
      .confirmPassword,
  );
  assert.ok(validate({ ...valid, email: "inválido" }, rules.register).email);
});
test("los límites coinciden con el contrato de contraseña del backend", () => {
  assert.ok(
    validate(
      {
        token: "a".repeat(64),
        password: "a".repeat(73),
        confirmPassword: "a".repeat(73),
      },
      rules.reset,
    ).password,
  );
  assert.ok(
    validate(
      {
        token: "incorrecto",
        password: "segura123",
        confirmPassword: "segura123",
      },
      rules.reset,
    ).token,
  );
  assert.deepEqual(
    validate(
      {
        token: "a".repeat(64),
        password: "segura123",
        confirmPassword: "segura123",
      },
      rules.reset,
    ),
    {},
  );
});
test("el teléfono de contacto es opcional pero valida si se informa", () => {
  const valid = {
    name: "Ana",
    email: "ana@example.com",
    phone: "",
    subject: "Stock",
    message: "Hola",
  };
  assert.deepEqual(validate(valid, rules.contact), {});
  assert.ok(validate({ ...valid, phone: "12" }, rules.contact).phone);
  assert.ok(validate({ ...valid, name: "  " }, rules.contact).name);
});
test("producto exige categoría, URL HTTP, precio válido y disponibilidad", () => {
  const valid = {
    name: "CPU",
    categoryId: "1",
    description: "Procesador",
    imageUrl: "https://example.com/a.png",
    price: "123.45",
    availability: "in_stock",
  };
  assert.deepEqual(validate(valid, rules.product), {});
  for (const [field, value] of [
    ["categoryId", "0"],
    ["price", "-1"],
    ["price", "1.001"],
    ["price", "NaN"],
    ["imageUrl", "javascript:alert(1)"],
    ["availability", "otro"],
  ])
    assert.ok(
      validate({ ...valid, [field]: value }, rules.product)[field],
      field,
    );
});
test("la limpieza conserva espacios significativos en contraseñas", () => {
  assert.deepEqual(
    clean({
      name: " Ada ",
      password: " segura123 ",
      confirmPassword: " segura123 ",
    }),
    { name: "Ada", password: " segura123 ", confirmPassword: " segura123 " },
  );
});
test("la selección de destacado conserva booleanos y rechaza textos", () => {
  const schema = { isFeatured: rules.product.isFeatured };
  for (const isFeatured of [true, false]) {
    assert.deepEqual(validate({ isFeatured }, schema), {});
    assert.deepEqual(clean({ isFeatured }), { isFeatured });
  }
  for (const isFeatured of ["true", "false", "", 0, null])
    assert.ok(validate({ isFeatured }, schema).isFeatured);
  assert.deepEqual(validate({}, schema), {});
});
test("los enlaces externos solo permiten HTTP y HTTPS", () => {
  assert.equal(safeWebUrl("javascript:alert(1)"), null);
  assert.equal(safeWebUrl("data:text/html,test"), null);
  assert.equal(safeWebUrl("https://example.com"), "https://example.com/");
});
test("los filtros descartan valores vacíos y codifican el texto", () => {
  assert.equal(
    queryString({ q: "CPU & GPU", categoryId: "", isActive: false, page: 2 }),
    "q=CPU+%26+GPU&isActive=false&page=2",
  );
});

test("precios con centavos válidos y sin redondeo silencioso", () => {
  const schema = { price: rules.product.price };
  for (const price of [
    0,
    0.01,
    0.29,
    1.1,
    123.45,
    9999999999.99,
    "0",
    "0.29",
    "123.45",
  ])
    assert.deepEqual(validate({ price }, schema), {}, String(price));
  for (const price of [
    null,
    true,
    false,
    [],
    [1],
    {},
    "",
    " ",
    -1,
    1.001,
    1.000000001,
    0.0000001,
    10000000000,
    Infinity,
    NaN,
  ])
    assert.ok(validate({ price }, schema).price, String(price));
});

test("identificadores enteros seguros y visibilidad con booleanos", () => {
  const schema = {
    categoryId: rules.product.categoryId,
    isActive: rules.product.isActive,
  };
  assert.deepEqual(validate({ categoryId: "1", isActive: false }, schema), {});
  for (const categoryId of [
    true,
    false,
    null,
    [1],
    0,
    1.5,
    2147483648,
    Number.MAX_SAFE_INTEGER + 1,
  ])
    assert.ok(validate({ categoryId }, schema).categoryId);
  for (const isActive of ["true", "false", 1, null])
    assert.ok(validate({ categoryId: "1", isActive }, schema).isActive);
});

test("correos alineados con el formato del backend en todos los formularios", () => {
  for (const name of ["register", "login", "profile", "forgot", "contact"]) {
    const schema = { email: rules[name].email };
    for (const email of [
      "ana@example.com",
      " O'Connor+pc@EXAMPLE.COM ",
      "ana.perez@example.com.ar",
    ])
      assert.deepEqual(validate({ email }, schema), {}, `${name}: ${email}`);
    for (const email of [
      ".ana@example.com",
      "ana.@example.com",
      "ana..p@example.com",
      "ana@exam_ple.com",
      "ana@example.c",
      "ana@localhost",
    ])
      assert.ok(validate({ email }, schema).email, `${name}: ${email}`);
  }
});

test("teléfonos permiten separadores habituales y exigen dígitos", () => {
  for (const name of ["register", "profile", "contact", "store"]) {
    const schema = { phone: rules[name].phone };
    for (const phone of [
      "11444",
      "+54 (11) 4444-5555",
      "11.4444.5555",
      " 1144445555 ",
    ])
      assert.deepEqual(validate({ phone }, schema), {}, `${name}: ${phone}`);
    for (const phone of [
      "abcde",
      "-----",
      "12-34",
      "11+44445555",
      "114444hola",
      "1".repeat(51),
    ])
      assert.ok(validate({ phone }, schema).phone, `${name}: ${phone}`);
  }
  assert.deepEqual(validate({ phone: "" }, { phone: rules.contact.phone }), {});
});

test("URLs completas HTTP/HTTPS y límite uniforme para imágenes y redes", () => {
  for (const rule of [
    rules.product.imageUrl,
    rules.store.instagram,
    rules.store.facebook,
    rules.store.website,
  ]) {
    const schema = { url: rule };
    for (const url of [
      "https://example.com/a.png",
      "HTTP://localhost:3000/a",
      " https://example.com ",
    ])
      assert.deepEqual(validate({ url }, schema), {}, url);
    for (const url of [
      "ftp://example.com/a.png",
      "javascript:alert(1)",
      "data:image/png;base64,AA",
      "//example.com/a",
      "https:example.com",
      "https://example.com/" + "a".repeat(2000),
    ])
      assert.ok(validate({ url }, schema).url, url);
  }
});

test("las contraseñas nuevas respetan bytes UTF-8 sin restringir el acceso existente", () => {
  for (const name of ["register", "reset"]) {
    const schema = { password: rules[name].password };
    for (const password of ["a".repeat(72), "é".repeat(36), "😀".repeat(18)])
      assert.deepEqual(validate({ password }, schema), {});
    for (const password of ["a".repeat(73), "é".repeat(37), "😀".repeat(19)])
      assert.ok(validate({ password }, schema).password);
  }
  assert.deepEqual(
    validate({ password: "é".repeat(40) }, { password: rules.login.password }),
    {},
  );
});

test("las imágenes adicionales validan cada URL, cantidad y tipo de dato", () => {
  const schema = {
    imageUrl: rules.product.imageUrl,
    additionalImageUrls: rules.product.additionalImageUrls,
  };
  const imageUrl = "https://example.com/main.png";
  const urls = Array.from(
    { length: 9 },
    (_, index) => `https://example.com/${index}.png`,
  );
  assert.deepEqual(
    validate({ imageUrl, additionalImageUrls: urls }, schema),
    {},
  );
  assert.deepEqual(validate({ imageUrl }, schema), {});
  assert.ok(
    validate(
      {
        imageUrl,
        additionalImageUrls: [...urls, "https://example.com/extra.png"],
      },
      schema,
    ).additionalImageUrls,
  );
  for (const additionalImageUrls of [null, "https://example.com/a.png", {}])
    assert.ok(
      validate({ imageUrl, additionalImageUrls }, schema).additionalImageUrls,
    );
  for (const value of [
    "",
    "  ",
    null,
    1,
    "ftp://example.com/a.png",
    "javascript:alert(1)",
    "https://example.com/" + "a".repeat(2000),
  ])
    assert.ok(
      validate({ imageUrl, additionalImageUrls: [value] }, schema)[
        "additionalImageUrls.0"
      ],
    );
});

test("la galería rechaza duplicados después de normalizar las URLs", () => {
  const schema = {
    imageUrl: rules.product.imageUrl,
    additionalImageUrls: rules.product.additionalImageUrls,
  };
  assert.ok(
    validate(
      {
        imageUrl: "https://example.com",
        additionalImageUrls: [" HTTPS://EXAMPLE.COM:443/ "],
      },
      schema,
    )["additionalImageUrls.0"],
  );
  assert.ok(
    validate(
      {
        imageUrl: "https://example.com/main.png",
        additionalImageUrls: [
          "https://example.com/a.png",
          " https://example.com/a.png ",
        ],
      },
      schema,
    )["additionalImageUrls.1"],
  );
  const corrected = {
    imageUrl: "https://example.com/b.png",
    additionalImageUrls: ["https://example.com/a.png"],
  };
  assert.deepEqual(validate(corrected, schema), {});
});

test("la limpieza de la galería conserva el orden y recorta cada URL", () => {
  assert.deepEqual(
    clean({
      imageUrl: " https://example.com/main.png ",
      additionalImageUrls: [
        " https://example.com/b.png ",
        "https://example.com/a.png ",
      ],
      isFeatured: false,
    }),
    {
      imageUrl: "https://example.com/main.png",
      additionalImageUrls: [
        "https://example.com/b.png",
        "https://example.com/a.png",
      ],
      isFeatured: false,
    },
  );
});

test("rango de precios admite límites opcionales, cero y valores iguales", () => {
  for (const values of [
    {},
    { minPrice: "", maxPrice: "" },
    { minPrice: "0" },
    { maxPrice: "0" },
    { minPrice: "0", maxPrice: "0" },
    { minPrice: ".29", maxPrice: "0.29" },
    { minPrice: " 10.50 ", maxPrice: "20" },
    { maxPrice: "9999999999.99" },
  ])
    assert.deepEqual(validatePriceRange(values), {}, JSON.stringify(values));
});

test("rango de precios rechaza importes inválidos y mínimo mayor al máximo", () => {
  for (const field of ["minPrice", "maxPrice"])
    for (const value of [
      "-1",
      "1.001",
      "1e3",
      "0x10",
      "NaN",
      "Infinity",
      "10000000000",
      "1,50",
    ])
      assert.ok(
        validatePriceRange({ [field]: value })[field],
        `${field}: ${value}`,
      );
  assert.equal(
    validatePriceRange({ minPrice: "20", maxPrice: "10" }).maxPrice,
    "El precio máximo debe ser mayor o igual al mínimo.",
  );
});
