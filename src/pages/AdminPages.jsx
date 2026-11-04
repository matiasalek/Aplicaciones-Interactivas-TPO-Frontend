import { useState } from "react";
import {
  ArrowUpRight,
  Box,
  Check,
  Grid2X2,
  Mail,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { useAuth } from "../context/AuthContext";
import { AvailabilityBadge } from "../components/ProductCard";
import { Dashboard } from "../components/Dashboard";
import {
  ArrowLink,
  BackLink,
  Button,
  ButtonLink,
  ConfirmDialog,
  Empty,
  Form,
  Notice,
  PageHeading,
  Pagination,
  ResourceState,
} from "../components/UI";
import {
  api,
  availability,
  date,
  inquiryStates,
  money,
  queryString,
} from "../lib/api";
import { useMutation, useResource } from "../lib/hooks";
import { rules, validate } from "../lib/validation";
import s from "../styles/App.module.css";

export function AdminHomePage() {
  const { user } = useAuth();
  const cards = [
    [
      "productos",
      Box,
      "Tus productos",
      "Creá, editá y organizá los componentes del catálogo.",
    ],
    [
      "categorias",
      Grid2X2,
      "Categorías",
      "Ordená el catálogo para que encontrar sea más fácil.",
    ],
    [
      "consultas",
      Mail,
      "Consultas recibidas",
      "Leé y gestioná los mensajes de tus clientes.",
    ],
    [
      "comercio",
      Settings2,
      "Tu comercio",
      "Mantené actualizados tus datos, redes y horarios.",
    ],
    [
      "perfil",
      UserRound,
      "Mi perfil",
      "Actualizá tus datos personales y de contacto.",
    ],
  ];
  return (
    <>
      <PageHeading
        eyebrow="TU ESPACIO DE TRABAJO"
        title={`Hola, ${user.firstName}.`}
        description="Todo listo para gestionar Pixel Forge."
        action={
          <ButtonLink to="/admin/productos/nuevo">
            <Plus size={17} />
            Nuevo producto
          </ButtonLink>
        }
      />
      <Dashboard />
      <div className={s.adminCards}>
        {cards.map(([path, Icon, title, description]) => (
          <Link key={path} to={`/admin/${path}`} className={s.adminCard}>
            <div>
              <Icon size={22} />
              <ArrowUpRight size={18} />
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
          </Link>
        ))}
      </div>
      <div className={s.adminTip}>
        <Check size={19} />
        <p>
          Los productos desactivados quedan guardados y solo se muestran en
          administración.
        </p>
      </div>
    </>
  );
}

export function AdminProductsPage() {
  const [params, setParams] = useSearchParams();
  const [searchError, setSearchError] = useState("");
  const q = (params.get("q") || "").slice(0, 100);
  const page = Math.max(1, Number.parseInt(params.get("page"), 10) || 1);
  const isActive = ["true", "false"].includes(params.get("isActive"))
    ? params.get("isActive")
    : "";
  const categoryId = /^[1-9]\d*$/.test(params.get("categoryId") || "")
    ? params.get("categoryId")
    : "";
  const resource = useResource(
    `/admin/products?${queryString({ q, page, isActive, categoryId, limit: 12 })}`,
    { authenticated: true },
  );
  const categories = useResource("/categories");
  const location = useLocation();
  const mutation = useMutation();
  const [target, setTarget] = useState(null);
  const [message, setMessage] = useState(location.state?.message || "");
  function update(values) {
    setParams(
      queryString({
        q,
        isActive,
        categoryId,
        ...values,
        page: values.page || 1,
      }),
    );
  }
  async function toggle(product) {
    await mutation.run(async () => {
      await api(`/admin/products/${product.id}`, {
        method: "PATCH",
        authenticated: true,
        body: { isActive: !product.isActive },
      });
      setMessage(
        product.isActive
          ? "Producto desactivado. Ya no se muestra en el catálogo público."
          : "Producto activado. Ya está visible en el catálogo.",
      );
      resource.reload();
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="CATÁLOGO"
        title="Productos"
        description="Gestioná las piezas que tus clientes pueden descubrir."
        action={
          <ButtonLink to="/admin/productos/nuevo">
            <Plus size={17} />
            Nuevo producto
          </ButtonLink>
        }
      />
      {message && <Notice tone="success">{message}</Notice>}
      {mutation.error && !target && <Notice>{mutation.error.message}</Notice>}
      <div className={s.adminFilters}>
        <form
          className={s.searchForm}
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get("q");
            const failure = validate({ q: value }, rules.search).q;
            setSearchError(failure || "");
            if (!failure) update({ q: value.trim() });
          }}
        >
          <Search size={17} />
          <label htmlFor="admin-search" className={s.srOnly}>
            Buscar productos
          </label>
          <input
            id="admin-search"
            name="q"
            key={q}
            defaultValue={q}
            placeholder="Buscar productos…"
            maxLength={100}
          />
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
        <label className={s.filterLabel}>
          Visibilidad
          <select
            value={isActive}
            onChange={(event) => update({ isActive: event.target.value })}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </label>
        <label className={s.filterLabel}>
          Categoría
          <select
            value={categoryId}
            onChange={(event) => update({ categoryId: event.target.value })}
          >
            <option value="">Todas</option>
            {categories.data?.data.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        {(q || isActive || categoryId) && (
          <Button variant="ghost" onClick={() => setParams({})}>
            Limpiar
          </Button>
        )}
      </div>
      {searchError && <Notice>{searchError}</Notice>}
      {categories.error && <Notice>{categories.error.message}</Notice>}
      <ResourceState resource={resource}>
        {resource.data?.data.length ? (
          <div className={s.tableWrap}>
            <table>
              <caption className={s.srOnly}>
                Productos del catálogo administrativo
              </caption>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Disponibilidad</th>
                  <th>Visibilidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resource.data.data.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <Link
                        className={s.tableTitle}
                        to={`/admin/productos/${product.id}/editar`}
                      >
                        {product.name}
                      </Link>
                      <small>{product.category.name}</small>
                    </td>
                    <td className={s.nowrap}>{money(product.price)}</td>
                    <td>
                      <AvailabilityBadge value={product.availability} />
                    </td>
                    <td>
                      <button
                        className={`${s.toggle} ${product.isActive ? s.toggleOn : ""}`}
                        role="switch"
                        aria-checked={product.isActive}
                        aria-label={`Visibilidad de ${product.name}`}
                        disabled={mutation.pending}
                        onClick={() => toggle(product)}
                      >
                        <span />
                        {product.isActive ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td>
                      <div className={s.tableActions}>
                        <Link
                          className={s.iconButton}
                          aria-label={`Editar ${product.name}`}
                          to={`/admin/productos/${product.id}/editar`}
                        >
                          <Pencil size={17} />
                        </Link>
                        <button
                          className={s.iconButton}
                          aria-label={`Eliminar ${product.name}`}
                          disabled={mutation.pending}
                          onClick={() => {
                            mutation.clearError();
                            setTarget(product);
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No hay productos para mostrar">
            Creá un producto o probá otros filtros.
          </Empty>
        )}
        <Pagination
          page={page}
          total={resource.data?.meta.total || 0}
          limit={12}
          count={resource.data?.data.length || 0}
          onChange={(page) => update({ page })}
        />
      </ResourceState>
      {target && (
        <ConfirmDialog
          title="¿Eliminar este producto?"
          pending={mutation.pending}
          error={mutation.error}
          onClose={() => setTarget(null)}
          onConfirm={() =>
            mutation.run(async () => {
              await api(`/admin/products/${target.id}`, {
                method: "DELETE",
                authenticated: true,
              });
              setTarget(null);
              setMessage("Producto eliminado.");
              resource.reload();
            })
          }
        >
          Se eliminará “{target.name}”. Esta acción no se puede deshacer.
        </ConfirmDialog>
      )}
    </>
  );
}

export function ProductEditorPage({ create = false }) {
  const { id } = useParams();
  const valid = create || /^[1-9]\d*$/.test(id);
  const resource = useResource(
    !create && valid ? `/admin/products/${id}` : null,
    { authenticated: true },
  );
  const categories = useResource("/categories");
  const mutation = useMutation();
  const navigate = useNavigate();
  const product = resource.data?.data;
  const initial = product
    ? {
        name: product.name,
        categoryId: String(product.category.id),
        description: product.description,
        imageUrl: product.imageUrl,
        price: String(product.price),
        availability: product.availability,
        isActive: product.isActive,
      }
    : {
        name: "",
        categoryId: "",
        description: "",
        imageUrl: "",
        price: "",
        availability: "in_stock",
        isActive: true,
      };
  return (
    <>
      <BackLink to="/admin/productos">Volver a productos</BackLink>
      <PageHeading
        title={create ? "Nuevo producto" : "Editar producto"}
        description="La información clara ayuda a elegir mejor."
      />
      {!valid ? (
        <Notice>El identificador del producto no es válido.</Notice>
      ) : (
        <ResourceState resource={resource}>
          <ResourceState resource={categories}>
            {categories.data?.data.length ? (
              <div className={s.editorLayout}>
                <div className={s.formPanel}>
                  <Form
                    key={product?.id || "new"}
                    initialValues={initial}
                    schema={rules.product}
                    pending={mutation.pending}
                    error={mutation.error}
                    submitLabel={create ? "Crear producto" : "Guardar producto"}
                    onSubmit={(values) =>
                      mutation.run(async () => {
                        await api(
                          create ? "/admin/products" : `/admin/products/${id}`,
                          {
                            method: create ? "POST" : "PATCH",
                            authenticated: true,
                            body: {
                              ...values,
                              categoryId: Number(values.categoryId),
                              price: Number(values.price),
                            },
                          },
                        );
                        navigate("/admin/productos", {
                          state: {
                            message: create
                              ? "Producto creado correctamente."
                              : "Producto actualizado correctamente.",
                          },
                        });
                      })
                    }
                  >
                    {({ field, values, setValues }) => (
                      <>
                        {field("name", "Nombre del producto")}
                        {field("categoryId", "Categoría", {
                          options: [
                            { value: "", label: "Seleccioná una categoría" },
                            ...categories.data.data.map((category) => ({
                              value: String(category.id),
                              label: category.name,
                            })),
                          ],
                        })}
                        {field("description", "Descripción", {
                          multiline: true,
                          rows: 5,
                        })}
                        {field("imageUrl", "URL de la imagen", {
                          type: "url",
                          placeholder: "https://…",
                          hint: "Usá una URL pública de imagen. No se suben archivos al servidor.",
                        })}
                        <div className={s.twoColumns}>
                          {field("price", "Precio (ARS)", {
                            type: "number",
                            min: 0,
                            max: 9999999999.99,
                            step: ".01",
                          })}
                          {field("availability", "Disponibilidad", {
                            options: Object.entries(availability).map(
                              ([value, label]) => ({ value, label }),
                            ),
                          })}
                        </div>
                        <label className={s.checkbox}>
                          <input
                            type="checkbox"
                            checked={values.isActive}
                            onChange={(event) =>
                              setValues({
                                ...values,
                                isActive: event.target.checked,
                              })
                            }
                          />
                          Mostrar en el catálogo público
                        </label>
                      </>
                    )}
                  </Form>
                </div>
                <aside className={s.editorAside}>
                  <Box size={27} />
                  <h2>Todo en su lugar.</h2>
                  <p>
                    La categoría es obligatoria. El producto se puede guardar
                    como inactivo y publicarse más adelante.
                  </p>
                  <p>
                    “Sin stock” indica disponibilidad; desactivar oculta el
                    producto del sitio público.
                  </p>
                </aside>
              </div>
            ) : (
              <Empty
                title="Primero creá una categoría"
                action={
                  <ButtonLink to="/admin/categorias/nueva">
                    Crear categoría
                  </ButtonLink>
                }
              >
                Cada producto debe pertenecer a una categoría.
              </Empty>
            )}
          </ResourceState>
        </ResourceState>
      )}
    </>
  );
}

export function CategoriesPage() {
  const resource = useResource("/categories");
  const mutation = useMutation();
  const [target, setTarget] = useState(null);
  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message || "");
  return (
    <>
      <PageHeading
        eyebrow="ORGANIZACIÓN"
        title="Categorías"
        description="Un catálogo ordenado se explora mejor."
        action={
          <ButtonLink to="/admin/categorias/nueva">
            <Plus size={17} />
            Nueva categoría
          </ButtonLink>
        }
      />
      {message && <Notice tone="success">{message}</Notice>}
      <ResourceState resource={resource}>
        {resource.data?.data.length ? (
          <div className={s.tableWrap}>
            <table>
              <caption className={s.srOnly}>Categorías del catálogo</caption>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resource.data.data.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <Link
                        className={s.tableTitle}
                        to={`/admin/categorias/${category.id}/editar`}
                      >
                        {category.name}
                      </Link>
                    </td>
                    <td className={s.descriptionCell}>
                      {category.description || "Sin descripción"}
                    </td>
                    <td>
                      <div className={s.tableActions}>
                        <Link
                          to={`/admin/categorias/${category.id}/editar`}
                          className={s.iconButton}
                          aria-label={`Editar ${category.name}`}
                        >
                          <Pencil size={17} />
                        </Link>
                        <button
                          className={s.iconButton}
                          aria-label={`Eliminar ${category.name}`}
                          onClick={() => {
                            mutation.clearError();
                            setTarget(category);
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Todavía no hay categorías">
            Creá la primera para comenzar a organizar tus productos.
          </Empty>
        )}
      </ResourceState>
      {target && (
        <ConfirmDialog
          title="¿Eliminar esta categoría?"
          pending={mutation.pending}
          error={mutation.error}
          onClose={() => setTarget(null)}
          onConfirm={() =>
            mutation.run(async () => {
              await api(`/categories/${target.id}`, {
                method: "DELETE",
                authenticated: true,
              });
              setTarget(null);
              setMessage("Categoría eliminada.");
              resource.reload();
            })
          }
        >
          Se eliminará “{target.name}”. Solo es posible si no tiene productos
          asociados.
        </ConfirmDialog>
      )}
    </>
  );
}

export function CategoryEditorPage({ create = false }) {
  const { id } = useParams();
  const valid = create || /^[1-9]\d*$/.test(id);
  const resource = useResource(!create && valid ? `/categories/${id}` : null);
  const mutation = useMutation();
  const navigate = useNavigate();
  const category = resource.data?.data;
  return (
    <>
      <BackLink to="/admin/categorias">Volver a categorías</BackLink>
      <PageHeading
        title={create ? "Nueva categoría" : "Editar categoría"}
        description="Dale un lugar a cada componente."
      />
      {!valid ? (
        <Notice>El identificador de la categoría no es válido.</Notice>
      ) : (
        <ResourceState resource={resource}>
          <div className={`${s.formPanel} ${s.narrowPanel}`}>
            <Form
              key={category?.id || "new"}
              initialValues={{
                name: category?.name || "",
                description: category?.description || "",
              }}
              schema={rules.category}
              pending={mutation.pending}
              error={mutation.error}
              submitLabel={create ? "Crear categoría" : "Guardar categoría"}
              onSubmit={(values) =>
                mutation.run(async () => {
                  await api(create ? "/categories" : `/categories/${id}`, {
                    method: create ? "POST" : "PATCH",
                    authenticated: true,
                    body: {
                      ...values,
                      description: values.description || null,
                    },
                  });
                  navigate("/admin/categorias", {
                    state: {
                      message: create
                        ? "Categoría creada correctamente."
                        : "Categoría actualizada correctamente.",
                    },
                  });
                })
              }
            >
              {({ field }) => (
                <>
                  {field("name", "Nombre")}
                  {field("description", "Descripción (opcional)", {
                    multiline: true,
                    rows: 4,
                  })}
                </>
              )}
            </Form>
          </div>
        </ResourceState>
      )}
    </>
  );
}

export function InquiriesPage() {
  const [params, setParams] = useSearchParams();
  const status = Object.hasOwn(inquiryStates, params.get("status"))
    ? params.get("status")
    : "";
  const page = Math.max(1, Number.parseInt(params.get("page"), 10) || 1);
  const resource = useResource(
    `/inquiries?${queryString({ status, page, limit: 12 })}`,
    { authenticated: true },
  );
  return (
    <>
      <PageHeading
        eyebrow="CONVERSACIONES"
        title="Consultas"
        description="Cada mensaje es una oportunidad para ayudar."
      />
      <div className={s.tabs} aria-label="Filtrar por estado">
        {[["", "Todas"], ...Object.entries(inquiryStates)].map(
          ([value, label]) => (
            <button
              key={value}
              className={status === value ? s.selectedTab : ""}
              aria-pressed={status === value}
              onClick={() => setParams(queryString({ status: value }))}
            >
              {label}
            </button>
          ),
        )}
      </div>
      <ResourceState resource={resource}>
        {resource.data?.data.length ? (
          <div className={s.tableWrap}>
            <table>
              <caption className={s.srOnly}>Consultas recibidas</caption>
              <thead>
                <tr>
                  <th>Consulta</th>
                  <th>Contacto</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {resource.data.data.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td>
                      <Link
                        to={`/admin/consultas/${inquiry.id}`}
                        className={s.tableTitle}
                      >
                        {inquiry.subject}
                      </Link>
                      <small>{inquiry.name}</small>
                    </td>
                    <td>{inquiry.email}</td>
                    <td className={s.nowrap}>{date(inquiry.createdAt)}</td>
                    <td>
                      <span className={`${s.badge} ${s[inquiry.status]}`}>
                        {inquiryStates[inquiry.status]}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/admin/consultas/${inquiry.id}`}
                        className={s.iconButton}
                        aria-label={`Leer ${inquiry.subject}`}
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No hay consultas en este estado">
            Los mensajes del formulario de contacto aparecen acá.
          </Empty>
        )}
        <Pagination
          page={page}
          total={resource.data?.meta.total || 0}
          limit={12}
          count={resource.data?.data.length || 0}
          onChange={(page) => setParams(queryString({ status, page }))}
        />
      </ResourceState>
    </>
  );
}

export function InquiryDetailPage() {
  const { id } = useParams();
  const valid = /^[1-9]\d*$/.test(id);
  const resource = useResource(valid ? `/inquiries/${id}` : null, {
    authenticated: true,
  });
  const mutation = useMutation();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const inquiry = resource.data?.data;
  return (
    <>
      <BackLink to="/admin/consultas">Volver a consultas</BackLink>
      {!valid ? (
        <Notice>El identificador de la consulta no es válido.</Notice>
      ) : (
        <ResourceState resource={resource}>
          {inquiry && (
            <>
              <PageHeading
                eyebrow={`CONSULTA #${inquiry.id}`}
                title={inquiry.subject}
                description={date(inquiry.createdAt)}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      mutation.clearError();
                      setConfirm(true);
                    }}
                  >
                    <Trash2 size={17} />
                    Eliminar consulta
                  </Button>
                }
              />
              {message && <Notice tone="success">{message}</Notice>}
              {mutation.error && !confirm && (
                <Notice>{mutation.error.message}</Notice>
              )}
              <div className={s.inquiryLayout}>
                <article className={s.messagePanel}>
                  <div className={s.sender}>
                    <span className={s.avatar}>{inquiry.name[0]}</span>
                    <div>
                      <h2>{inquiry.name}</h2>
                      <a href={`mailto:${encodeURIComponent(inquiry.email)}`}>
                        {inquiry.email}
                      </a>
                      {inquiry.phone && <p>{inquiry.phone}</p>}
                    </div>
                  </div>
                  <p className={s.messageBody}>{inquiry.message}</p>
                </article>
                <aside className={s.formPanel}>
                  <h2>Estado de la consulta</h2>
                  <p className={s.muted}>
                    Marcala según el seguimiento que le diste.
                  </p>
                  <Form
                    initialValues={{ status: inquiry.status }}
                    schema={{
                      status: {
                        required: true,
                        oneOf: Object.keys(inquiryStates),
                      },
                    }}
                    pending={mutation.pending}
                    submitLabel="Actualizar estado"
                    onSubmit={(values) =>
                      mutation.run(async () => {
                        await api(`/inquiries/${id}/status`, {
                          method: "PATCH",
                          authenticated: true,
                          body: values,
                        });
                        setMessage("Estado de la consulta actualizado.");
                        resource.reload();
                      })
                    }
                  >
                    {({ field }) =>
                      field("status", "Estado", {
                        options: Object.entries(inquiryStates).map(
                          ([value, label]) => ({ value, label }),
                        ),
                      })
                    }
                  </Form>
                  <p className={s.formHint}>
                    Cambiar el estado no envía un correo. La respuesta se
                    coordina por fuera de la aplicación.
                  </p>
                </aside>
              </div>
            </>
          )}
        </ResourceState>
      )}
      {confirm && (
        <ConfirmDialog
          title="¿Eliminar esta consulta?"
          pending={mutation.pending}
          error={mutation.error}
          onClose={() => setConfirm(false)}
          onConfirm={() =>
            mutation.run(async () => {
              await api(`/inquiries/${id}`, {
                method: "DELETE",
                authenticated: true,
              });
              navigate("/admin/consultas");
            })
          }
        >
          Se eliminará el mensaje y sus datos de contacto. Esta acción no se
          puede deshacer.
        </ConfirmDialog>
      )}
    </>
  );
}

export function StoreEditorPage() {
  const resource = useResource("/store", { optional404: true });
  const mutation = useMutation();
  const [message, setMessage] = useState("");
  const store = resource.data?.data;
  const initial = {
    name: store?.name || "Pixel Forge Componentes",
    description: store?.description || "",
    address: store?.address || "",
    phone: store?.phone || "",
    openingHours: store?.openingHours || "",
    instagram: store?.socialLinks?.instagram || "",
    facebook: store?.socialLinks?.facebook || "",
    website: store?.socialLinks?.website || "",
  };
  return (
    <>
      <PageHeading
        eyebrow="IDENTIDAD Y CONTACTO"
        title="Tu comercio"
        description="La información que tus clientes ven en el sitio público."
      />
      {message && <Notice tone="success">{message}</Notice>}
      <ResourceState resource={resource}>
        <div className={s.editorLayout}>
          <div className={s.formPanel}>
            <Form
              key={store?.updatedAt || "new"}
              initialValues={initial}
              schema={rules.store}
              pending={mutation.pending}
              error={mutation.error}
              submitLabel="Guardar información"
              onSubmit={(values) =>
                mutation.run(async () => {
                  const { instagram, facebook, website, ...body } = values;
                  const socialLinks = { ...store?.socialLinks };
                  for (const [key, value] of Object.entries({
                    instagram,
                    facebook,
                    website,
                  })) {
                    if (value) socialLinks[key] = value;
                    else delete socialLinks[key];
                  }
                  await api("/store", {
                    method: "PUT",
                    authenticated: true,
                    body: { ...body, socialLinks },
                  });
                  setMessage(
                    "Información del comercio guardada. Ya está disponible en el sitio público.",
                  );
                  resource.reload();
                })
              }
            >
              {({ field }) => (
                <>
                  {field("name", "Nombre del comercio")}
                  {field("description", "Descripción", {
                    multiline: true,
                    rows: 5,
                  })}
                  {field("address", "Dirección")}
                  {field("phone", "Teléfono", { type: "tel" })}
                  {field("openingHours", "Horarios de atención", {
                    multiline: true,
                    rows: 2,
                  })}
                  <h3>Redes y enlaces</h3>
                  {field("instagram", "Instagram (opcional)", {
                    type: "url",
                    placeholder: "https://instagram.com/…",
                  })}
                  {field("facebook", "Facebook (opcional)", {
                    type: "url",
                    placeholder: "https://facebook.com/…",
                  })}
                  {field("website", "Sitio web (opcional)", {
                    type: "url",
                    placeholder: "https://…",
                  })}
                </>
              )}
            </Form>
          </div>
          <aside className={s.editorAside}>
            <Settings2 size={27} />
            <h2>Presentá tu comercio.</h2>
            <p>
              Estos datos aparecen en Nosotros, Contacto y el pie del sitio.
            </p>
            <p>
              Usá enlaces completos para las redes sociales, incluyendo
              https://.
            </p>
          </aside>
        </div>
      </ResourceState>
    </>
  );
}

export function ProfilePage() {
  const auth = useAuth();
  const resource = useResource("/profile", { authenticated: true });
  const mutation = useMutation();
  const [message, setMessage] = useState("");
  const user = resource.data?.data;
  return (
    <>
      <PageHeading
        eyebrow="TU CUENTA"
        title="Mi perfil"
        description="Mantené actualizados tus datos personales."
      />
      {message && <Notice tone="success">{message}</Notice>}
      <ResourceState resource={resource}>
        {user && (
          <div className={`${s.formPanel} ${s.narrowPanel}`}>
            <Form
              initialValues={{
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
              }}
              schema={rules.profile}
              pending={mutation.pending}
              error={mutation.error}
              onSubmit={(values) =>
                mutation.run(async () => {
                  const result = await api("/profile", {
                    method: "PATCH",
                    authenticated: true,
                    body: { ...values, email: values.email.toLowerCase() },
                  });
                  auth.setUser(result.data);
                  setMessage("Tus datos se actualizaron correctamente.");
                })
              }
            >
              {({ field }) => (
                <>
                  <div className={s.twoColumns}>
                    {field("firstName", "Nombre", {
                      autoComplete: "given-name",
                    })}
                    {field("lastName", "Apellido", {
                      autoComplete: "family-name",
                    })}
                  </div>
                  {field("email", "Correo electrónico", {
                    type: "email",
                    autoComplete: "email",
                  })}
                  {field("phone", "Teléfono", {
                    type: "tel",
                    autoComplete: "tel",
                  })}
                </>
              )}
            </Form>
            <div className={s.profileRecovery}>
              <h3>¿Querés cambiar tu contraseña?</h3>
              <p>
                Podés hacerlo desde el flujo de recuperación. Al completarlo se
                cerrarán tus sesiones anteriores.
              </p>
              <ArrowLink to="/recuperar-contrasena">
                Recuperar contraseña
              </ArrowLink>
            </div>
          </div>
        )}
      </ResourceState>
    </>
  );
}
