import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  BackLink,
  ButtonLink,
  ConfirmDialog,
  Empty,
  Form,
  Notice,
  PageHeading,
  ResourceState,
} from "../components/UI";
import { announcementTypes, api, money } from "../lib/api";
import { useMutation, useResource } from "../lib/hooks";
import { rules, validate } from "../lib/validation";
import s from "../styles/App.module.css";

const listPath = "/admin/novedades";
const apiPath = "/admin/announcements";
const typeOptions = Object.entries(announcementTypes).map(([value, label]) => ({
  value,
  label,
}));
const statusOptions = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicada" },
];

export function AnnouncementsPage() {
  const resource = useResource(apiPath, { authenticated: true });
  const mutation = useMutation();
  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message || "");
  const [target, setTarget] = useState(null);
  const items = resource.data?.data;

  return (
    <>
      <PageHeading
        title="Promociones y novedades"
        action={
          <ButtonLink to={`${listPath}/nueva`}>
            <Plus size={17} />
            Nueva publicación
          </ButtonLink>
        }
      />
      {message && <Notice tone="success">{message}</Notice>}
      <ResourceState resource={resource}>
        {items?.length ? (
          <div className={s.tableWrap}>
            <table>
              <caption className={s.srOnly}>Promociones y novedades</caption>
              <thead>
                <tr>
                  <th>Publicación</th>
                  <th>Producto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const editPath = `${listPath}/${item.id}/editar`;
                  return (
                    <tr key={item.id}>
                      <td>
                        <Link className={s.tableTitle} to={editPath}>
                          {item.title}
                        </Link>
                        <small>{announcementTypes[item.type]}</small>
                      </td>
                      <td>
                        {item.product ? (
                          <>
                            {item.product.name}
                            <small>{money(item.promotionPrice)}</small>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{item.isPublished ? "Publicada" : "Borrador"}</td>
                      <td>
                        <div className={s.tableActions}>
                          <Link
                            to={editPath}
                            className={s.iconButton}
                            aria-label={`Editar ${item.title}`}
                          >
                            <Pencil size={17} />
                          </Link>
                          <button
                            type="button"
                            className={s.iconButton}
                            aria-label={`Eliminar ${item.title}`}
                            onClick={() => {
                              mutation.clearError();
                              setTarget(item);
                            }}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Todavía no hay publicaciones">
            Creá una novedad o una promoción para mostrarla en Inicio.
          </Empty>
        )}
      </ResourceState>
      {target && (
        <ConfirmDialog
          title="¿Eliminar esta publicación?"
          pending={mutation.pending}
          error={mutation.error}
          onClose={() => setTarget(null)}
          onConfirm={() =>
            mutation.run(async () => {
              await api(`${apiPath}/${target.id}`, {
                method: "DELETE",
                authenticated: true,
              });
              setTarget(null);
              setMessage("Publicación eliminada.");
              resource.reload();
            })
          }
        >
          Se eliminará “{target.title}”.
          {target.product &&
            " El producto seguirá en el catálogo si está activo."}
        </ConfirmDialog>
      )}
    </>
  );
}

export function AnnouncementEditorPage({ create = false }) {
  const { id } = useParams();
  const valid = create || /^[1-9]\d*$/.test(id);
  const resource = useResource(!create && valid ? `${apiPath}/${id}` : null, {
    authenticated: true,
  });
  const products = useResource(valid ? `${apiPath}/products` : null, {
    authenticated: true,
  });
  const mutation = useMutation();
  const navigate = useNavigate();
  const item = resource.data?.data;
  const options = products.data?.data || [];

  const schema = {
    ...rules.announcement,
    promotionPrice: {
      check(value, values) {
        if (values.type !== "promotion" || !values.productId) return;
        const failure = validate(
          { promotionPrice: value },
          { promotionPrice: rules.product.price },
        ).promotionPrice;
        if (failure) return failure;
        const product = options.find(
          ({ id }) => String(id) === values.productId,
        );
        if (product && Number(value) >= product.price)
          return "El precio promocional debe ser menor que el habitual.";
      },
    },
  };

  return (
    <>
      <BackLink to={listPath}>Volver a promociones y novedades</BackLink>
      <PageHeading
        title={create ? "Nueva publicación" : "Editar publicación"}
      />
      {!valid ? (
        <Notice>El identificador de la publicación no es válido.</Notice>
      ) : (
        <ResourceState resource={resource}>
          <ResourceState resource={products}>
            <div className={`${s.formPanel} ${s.narrowPanel}`}>
              <Form
                key={item?.id || "new"}
                initialValues={{
                  type: item?.type || "news",
                  title: item?.title || "",
                  description: item?.description || "",
                  status: item?.isPublished ? "published" : "draft",
                  productId: String(item?.product?.id ?? ""),
                  promotionPrice: String(item?.promotionPrice ?? ""),
                }}
                schema={schema}
                pending={mutation.pending}
                error={mutation.error}
                submitLabel={
                  create ? "Crear publicación" : "Guardar publicación"
                }
                onSubmit={(values) =>
                  mutation.run(async () => {
                    const linked =
                      values.type === "promotion" && values.productId;
                    await api(create ? apiPath : `${apiPath}/${id}`, {
                      method: create ? "POST" : "PUT",
                      authenticated: true,
                      body: {
                        type: values.type,
                        title: values.title,
                        description: values.description,
                        isPublished: values.status === "published",
                        productId: linked ? Number(values.productId) : null,
                        promotionPrice: linked
                          ? Number(values.promotionPrice)
                          : null,
                      },
                    });
                    navigate(listPath, {
                      state: {
                        message: create
                          ? "Publicación creada."
                          : "Publicación actualizada.",
                      },
                    });
                  })
                }
              >
                {({ field, values }) => (
                  <>
                    {field("type", "Tipo", { options: typeOptions })}
                    {field("title", "Título")}
                    {field("description", "Texto", {
                      multiline: true,
                      rows: 5,
                    })}
                    {values.type === "promotion" && (
                      <>
                        {field("productId", "Producto (opcional)", {
                          options: [
                            { value: "", label: "Sin producto asociado" },
                            ...options.map((product) => ({
                              value: String(product.id),
                              label: `${product.name} · ${money(product.price)}${product.isActive ? "" : " · Inactivo"}`,
                            })),
                          ],
                        })}
                        {values.productId &&
                          field("promotionPrice", "Precio promocional (ARS)", {
                            inputMode: "decimal",
                            required: true,
                            hint: "Tiene que ser menor que el precio habitual.",
                          })}
                      </>
                    )}
                    {field("status", "Estado", { options: statusOptions })}
                  </>
                )}
              </Form>
            </div>
          </ResourceState>
        </ResourceState>
      )}
    </>
  );
}
