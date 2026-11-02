import test from "node:test";
import assert from "node:assert/strict";
import { clean, rules, validate } from "../src/lib/validation.js";
import { queryString, safeWebUrl } from "../src/lib/api.js";

test("el registro valida todos los datos requeridos y la confirmación", () => {
  assert.equal(Object.keys(validate({}, rules.register)).length, 6);
  const valid = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phone: "1144445555",
    password: "ClaveSegura123",
    confirmPassword: "ClaveSegura123",
  };
  assert.deepEqual(validate(valid, rules.register), {});
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
