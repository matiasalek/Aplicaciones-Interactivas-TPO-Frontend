import { imageReferenceKey, isCatalogImage } from "./productImages.js";

const text = (max, min = 1) => ({ required: min > 0, max, min });
const productImage = { ...text(2000), url: true, catalogImage: true };
// Mismo formato práctico que z.email() en el backend.
const emailPattern =
  /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
const email = { ...text(320), email: true };
const phone = { ...text(50, 5), phone: true };
const password = {
  required: true,
  min: 8,
  max: 72,
  maxBytes: 72,
  preserve: true,
};
const profile = { firstName: text(100), lastName: text(100), email, phone };
const priceFilter = {
  number: true,
  minNumber: 0,
  maxNumber: 9999999999.99,
  currency: true,
  decimal: true,
};
export const rules = {
  login: { email, password: { required: true, preserve: true } },
  register: {
    ...profile,
    password,
    confirmPassword: { ...password, matches: "password" },
  },
  profile,
  forgot: { email },
  reset: {
    token: { required: true, pattern: /^[a-f0-9]{64}$/i },
    password,
    confirmPassword: { ...password, matches: "password" },
  },
  contact: {
    name: text(150),
    email,
    phone: { ...phone, required: false },
    subject: text(200),
    message: text(10000),
  },
  category: { name: text(100), description: text(2000, 0) },
  announcement: {
    type: { required: true, oneOf: ["news", "promotion"] },
    title: text(120),
    description: text(2000),
    status: { required: true, oneOf: ["draft", "published"] },
  },
  product: {
    isActive: { boolean: true },
    isFeatured: { boolean: true },
    name: text(200),
    categoryId: {
      required: true,
      number: true,
      minNumber: 1,
      maxNumber: 2147483647,
      integer: true,
    },
    description: text(10000),
    imageUrl: productImage,
    additionalImageUrls: {
      images: true,
      max: 9,
      distinctFrom: "imageUrl",
      item: productImage,
    },
    price: {
      required: true,
      number: true,
      minNumber: 0,
      maxNumber: 9999999999.99,
      currency: true,
    },
    availability: {
      required: true,
      oneOf: ["in_stock", "out_of_stock", "preorder"],
    },
  },
  store: {
    name: text(150),
    description: text(5000),
    address: text(300),
    phone,
    openingHours: text(1000),
    instagram: { url: true, max: 2000 },
    facebook: { url: true, max: 2000 },
    website: { url: true, max: 2000 },
  },
  search: { q: text(100, 0) },
  priceRange: { minPrice: priceFilter, maxPrice: priceFilter },
};

export function validate(values, schema) {
  const errors = {};
  for (const [key, rule] of Object.entries(schema)) {
    if (rule.images) {
      const urls = values[key] === undefined ? [] : values[key];
      if (!Array.isArray(urls)) {
        errors[key] = "Ingresá una lista de URLs de imágenes.";
        continue;
      }
      if (urls.length > rule.max)
        errors[key] = "Usá hasta 10 imágenes por producto.";
      const seen = new Set();
      try {
        seen.add(imageReferenceKey(values[rule.distinctFrom]));
      } catch {
        /* La principal se valida por separado. */
      }
      urls.forEach((url, index) => {
        const name = `${key}.${index}`;
        const failure =
          typeof url === "string"
            ? validate({ url }, { url: rule.item }).url
            : "Ingresá una URL completa y válida.";
        if (failure) errors[name] = failure;
        else {
          const normalized = imageReferenceKey(url);
          if (seen.has(normalized))
            errors[name] = "Esta imagen ya está en la galería.";
          seen.add(normalized);
        }
      });
      continue;
    }
    if (rule.boolean) {
      if (values[key] !== undefined && typeof values[key] !== "boolean")
        errors[key] = "Seleccioná una opción válida.";
      continue;
    }
    const raw = String(values[key] ?? "");
    const value = rule.preserve ? raw : raw.trim();
    const customError = rule.check?.(value, values);
    if (customError) {
      errors[key] = customError;
      continue;
    }
    if (!value) {
      if (rule.required) errors[key] = "Completá este campo.";
      continue;
    }
    if (rule.min && value.length < rule.min)
      errors[key] = `Ingresá al menos ${rule.min} caracteres.`;
    else if (rule.max && value.length > rule.max)
      errors[key] = `Usá hasta ${rule.max} caracteres.`;
    else if (
      rule.maxBytes &&
      new TextEncoder().encode(value).length > rule.maxBytes
    )
      errors[key] =
        "Usá una contraseña más corta; los emojis y algunos caracteres ocupan más espacio.";
    else if (rule.email && !emailPattern.test(value))
      errors[key] = "Ingresá un correo electrónico válido.";
    else if (
      rule.phone &&
      (!/^\+?[0-9 ().-]+$/.test(value) || value.replace(/\D/g, "").length < 5)
    )
      errors[key] =
        "Ingresá al menos 5 dígitos; podés usar + al inicio, espacios, puntos, guiones y paréntesis.";
    else if (rule.pattern && !rule.pattern.test(value))
      errors[key] =
        "Ingresá un código de recuperación válido de 64 caracteres.";
    else if (rule.oneOf && !rule.oneOf.includes(value))
      errors[key] = "Seleccioná una opción válida.";
    else if (rule.decimal && !/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(value))
      errors[key] = "Ingresá un precio válido con hasta dos decimales.";
    else if (
      rule.number &&
      ((typeof values[key] !== "string" && typeof values[key] !== "number") ||
        !Number.isFinite(Number(value)) ||
        Number(value) < rule.minNumber ||
        Number(value) > (rule.maxNumber ?? Infinity) ||
        (rule.integer && !Number.isSafeInteger(Number(value))))
    )
      errors[key] = "Ingresá un número dentro del rango permitido.";
    else if (
      rule.currency &&
      Math.round(Number(value) * 100) / 100 !== Number(value)
    )
      errors[key] = "Usá como máximo dos decimales.";
    else if (rule.matches && raw !== values[rule.matches])
      errors[key] = "Las contraseñas no coinciden.";
    else if (rule.url && !(rule.catalogImage && isCatalogImage(value))) {
      try {
        if (
          !/^https?:\/\//i.test(value) ||
          !["http:", "https:"].includes(new URL(value).protocol)
        )
          errors[key] = "Usá una URL que comience con http:// o https://.";
      } catch {
        errors[key] = "Ingresá una URL completa y válida.";
      }
    }
  }
  return errors;
}

export function validatePriceRange(values) {
  const errors = validate(values, rules.priceRange);
  if (
    !Object.keys(errors).length &&
    String(values.minPrice ?? "").trim() &&
    String(values.maxPrice ?? "").trim() &&
    Number(values.minPrice) > Number(values.maxPrice)
  )
    errors.maxPrice = "El precio máximo debe ser mayor o igual al mínimo.";
  return errors;
}

export const clean = (values) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      typeof value === "string" &&
      !["password", "confirmPassword"].includes(key)
        ? value.trim()
        : Array.isArray(value)
          ? value.map((item) => (typeof item === "string" ? item.trim() : item))
          : value,
    ]),
  );
