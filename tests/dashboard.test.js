import test from "node:test";
import assert from "node:assert/strict";
import { loadDashboard } from "../src/lib/dashboard.js";

function fixture(products = [], counts = [0, 0, 0]) {
  const calls = [];
  const request = async (path, options) => {
    calls.push({ path, options });
    const url = new URL(path, "http://example.test");
    if (url.pathname === "/categories")
      return {
        data: [
          { id: 1, name: "Procesadores" },
          { id: 2, name: "Memorias" },
        ],
      };
    if (url.pathname === "/inquiries") {
      const index = ["pending", "read", "answered"].indexOf(
        url.searchParams.get("status"),
      );
      return { data: [], meta: { total: counts[index] } };
    }
    const page = Number(url.searchParams.get("page"));
    return {
      data: products.slice((page - 1) * 100, page * 100),
      meta: { total: products.length },
    };
  };
  return { request, calls };
}

test("el dashboard incluye todas las páginas, inactivos, categorías vacías y totales de consultas", async () => {
  const products = Array.from({ length: 205 }, (_, id) => ({
    id,
    isActive: id < 150,
    availability:
      id < 100 ? "in_stock" : id < 200 ? "out_of_stock" : "preorder",
    category: { id: 1 },
  }));
  const { request, calls } = fixture(products, [125, 2, 3]);
  const signal = new AbortController().signal;
  const result = await loadDashboard(signal, request);
  assert.equal(result.totalProducts, 205);
  assert.equal(result.active, 150);
  assert.equal(result.inactive, 55);
  assert.equal(result.totalInquiries, 130);
  assert.deepEqual(
    result.inquiries.map((row) => row.count),
    [125, 2, 3],
  );
  assert.deepEqual(
    result.availability.map((row) => row.count),
    [100, 100, 5],
  );
  assert.deepEqual(
    result.categories.map((row) => row.count),
    [205, 0],
  );
  assert.equal(
    calls.filter(({ path }) => path.startsWith("/admin/products")).length,
    3,
  );
  assert.ok(
    calls.every(
      ({ options }) => options.authenticated && options.signal === signal,
    ),
  );
});

test("sin registros devuelve ceros y conserva las categorías vacías", async () => {
  const { request } = fixture();
  const result = await loadDashboard(undefined, request);
  assert.equal(result.totalProducts, 0);
  assert.equal(result.totalInquiries, 0);
  assert.deepEqual(
    result.categories.map((row) => row.count),
    [0, 0],
  );
  assert.ok(result.availability.every((row) => row.count === 0));
});

test("un error de API impide presentar métricas parciales como completas", async () => {
  const { request } = fixture();
  await assert.rejects(
    loadDashboard(undefined, (path, options) => {
      if (path.includes("status=read")) throw new Error("Sin conexión");
      return request(path, options);
    }),
    /Sin conexión/,
  );
});

test("detecta cambios de total y productos duplicados entre páginas", async () => {
  for (const changedTotal of [true, false]) {
    const { request } = fixture(
      Array.from({ length: 101 }, (_, id) => ({
        id,
        isActive: true,
        availability: "in_stock",
        category: { id: 1 },
      })),
    );
    await assert.rejects(
      loadDashboard(undefined, async (path, options) => {
        const result = await request(path, options);
        if (path.includes("page=2")) {
          if (changedTotal) result.meta.total = 102;
          else result.data[0].id = 0;
        }
        return result;
      }),
      /El catálogo cambió/,
    );
  }
});
