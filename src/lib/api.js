const messages = {
  EMAIL_CONFLICT: "Ya existe una cuenta con ese correo electrónico.",
  INVALID_CREDENTIALS: "El correo o la contraseña son incorrectos.",
  AUTHENTICATION_REQUIRED: "Tu sesión venció. Volvé a iniciar sesión.",
  INVALID_RESET_TOKEN:
    "El código de recuperación es inválido, venció o ya fue utilizado.",
  CATEGORY_IN_USE:
    "Esta categoría tiene productos asociados. Reasignalos o eliminá esos productos antes de borrar la categoría.",
  CATEGORY_NAME_CONFLICT: "Ya existe una categoría con ese nombre.",
  PRODUCT_NAME_CONFLICT: "Ya existe un producto con ese nombre.",
  INVALID_CATEGORY: "La categoría seleccionada ya no existe.",
  CATEGORY_NOT_FOUND: "No encontramos esa categoría.",
  PRODUCT_NOT_FOUND: "Este producto no está disponible o ya no existe.",
  INQUIRY_NOT_FOUND: "Esta consulta ya no existe.",
  STORE_INFORMATION_NOT_FOUND:
    "El comercio todavía no configuró su información.",
  VALIDATION_ERROR:
    "Revisá los datos ingresados. Algún campo no cumple el formato requerido.",
};

export class ApiError extends Error {
  constructor(message, status = 0, code = "", details = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getToken() {
  try {
    return sessionStorage.getItem("pixel-forge-token");
  } catch {
    return null;
  }
}

export function saveToken(token) {
  try {
    if (token) sessionStorage.setItem("pixel-forge-token", token);
    else sessionStorage.removeItem("pixel-forge-token");
  } catch {
    /* La sesión sigue funcionando en memoria si el navegador bloquea storage. */
  }
}

let memoryToken = getToken();
export function setToken(token) {
  memoryToken = token;
  saveToken(token);
}

export async function api(
  path,
  { method = "GET", body, signal, authenticated = false } = {},
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authenticated && memoryToken)
    headers.Authorization = `Bearer ${memoryToken}`;
  let response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal,
    });
    if (response.status === 204) return null;
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 && authenticated)
        window.dispatchEvent(new Event("session-expired"));
      const code = payload?.error?.code;
      throw new ApiError(
        messages[code] ||
          (response.status === 404
            ? "No encontramos el recurso solicitado."
            : "No pudimos completar la operación. Intentá nuevamente."),
        response.status,
        code,
        payload?.error?.details,
      );
    }
    if (!payload)
      throw new ApiError(
        "La API no respondió en el formato esperado. Verificá que el backend esté iniciado.",
      );
    return payload;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "No pudimos conectarnos con el servidor. Verificá que la API y PostgreSQL estén iniciados y volvé a intentar.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export const money = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
export const date = (value) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
export const availability = {
  in_stock: "Disponible",
  out_of_stock: "Sin stock",
  preorder: "A pedido",
};
export const inquiryStates = {
  pending: "Pendiente",
  read: "Leída",
  answered: "Respondida",
};

export function queryString(values) {
  return new URLSearchParams(
    Object.entries(values).filter(([, value]) => value !== "" && value != null),
  ).toString();
}

export function safeWebUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
