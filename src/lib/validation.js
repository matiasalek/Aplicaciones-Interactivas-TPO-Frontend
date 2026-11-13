const text = (max, min = 1) => ({ required: min > 0, max, min });
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
    imageUrl: { ...text(2000), url: true },
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
};

export function validate(values, schema) {
  const errors = {};
  for (const [key, rule] of Object.entries(schema)) {
    if (rule.boolean) {
      if (values[key] !== undefined && typeof values[key] !== "boolean")
        errors[key] = "Seleccioná una opción válida.";
      continue;
    }
    const raw = String(values[key] ?? "");
    const value = rule.preserve ? raw : raw.trim();
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
    else if (rule.url) {
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

export const clean = (values) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      typeof value === "string" &&
      !["password", "confirmPassword"].includes(key)
        ? value.trim()
        : value,
    ]),
  );
