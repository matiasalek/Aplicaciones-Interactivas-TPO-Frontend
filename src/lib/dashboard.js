import { api, availability, inquiryStates } from "./api.js";

async function loadProducts(request, options) {
  const products = [];
  let total;
  for (let page = 1; ; page += 1) {
    const result = await request(
      `/admin/products?limit=100&page=${page}`,
      options,
    );
    total ??= result.meta.total;
    if (
      result.meta.total !== total ||
      (!result.data.length && products.length < total)
    )
      throw new Error("El catálogo cambió durante la carga. Volvé a intentar.");
    products.push(...result.data);
    if (products.length >= total) break;
  }
  if (
    products.length !== total ||
    new Set(products.map(({ id }) => id)).size !== total
  )
    throw new Error("El catálogo cambió durante la carga. Volvé a intentar.");
  return products;
}

export async function loadDashboard(signal, request = api) {
  const options = { authenticated: true, signal };
  const [products, categories, ...inquiries] = await Promise.all([
    loadProducts(request, options),
    request("/categories", options),
    ...Object.keys(inquiryStates).map((status) =>
      request(`/inquiries?status=${status}&limit=1`, options),
    ),
  ]);
  const active = products.filter((product) => product.isActive).length;
  const inquiryRows = Object.entries(inquiryStates).map(
    ([key, label], index) => ({
      key,
      label,
      count: inquiries[index].meta.total,
    }),
  );
  return {
    totalProducts: products.length,
    active,
    inactive: products.length - active,
    totalInquiries: inquiryRows.reduce((sum, row) => sum + row.count, 0),
    inquiries: inquiryRows,
    availability: Object.entries(availability).map(([key, label]) => ({
      key,
      label,
      count: products.filter((product) => product.availability === key).length,
    })),
    categories: categories.data.map((category) => ({
      key: category.id,
      label: category.name,
      count: products.filter((product) => product.category.id === category.id)
        .length,
    })),
    updatedAt: new Date().toISOString(),
  };
}
