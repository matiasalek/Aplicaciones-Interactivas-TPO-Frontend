import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Cpu,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";
import { useStore } from "../components/Layouts";
import HardwareArt from "../components/HardwareArt";
import ProductCard, {
  AvailabilityBadge,
  ProductImage,
} from "../components/ProductCard";
import {
  ArrowLink,
  BackLink,
  Button,
  ButtonLink,
  Empty,
  Form,
  Notice,
  PageHeading,
  Pagination,
  ResourceState,
} from "../components/UI";
import { api, availability, money, queryString, safeWebUrl } from "../lib/api";
import { useMutation, useResource } from "../lib/hooks";
import { rules, validate } from "../lib/validation";
import s from "../styles/App.module.css";

export function HomePage() {
  const categories = useResource("/categories");
  const products = useResource("/products?limit=4&sort=newest");
  return (
    <>
      <section className={s.hero}>
        <div className={s.heroText}>
          <p className={s.eyebrow}>
            <span className={s.dot} /> HARDWARE. SIN VUELTAS.
          </p>
          <h1>
            Buenas piezas.
            <br />
            Grandes <em>posibilidades.</em>
          </h1>
          <p>
            Componentes para jugar, crear y llevar tus ideas un poco más lejos.
            Encontrá el próximo paso para tu PC.
          </p>
          <div className={s.actions}>
            <ButtonLink to="/productos">
              Explorar componentes
              <ArrowUpRight size={18} />
            </ButtonLink>
            <ButtonLink to="/contacto" variant="ghost">
              Necesito asesoramiento
              <ArrowRight size={17} />
            </ButtonLink>
          </div>
          <div className={s.heroNote}>
            <span>01 / ELEGÍ</span>
            <span>02 / CONSULTÁ</span>
            <span>03 / POTENCIÁ TU PC</span>
          </div>
        </div>
        <div className={s.heroVisual}>
          <div className={s.heroGrid} />
          <span className={s.visualLabel}>
            EL PRÓXIMO NIVEL, PIEZA A PIEZA.
          </span>
          <HardwareArt hero />
          <div className={s.heroStamp}>
            <Cpu size={18} />
            <span>
              Más posibilidades.
              <br />
              <strong>Tu propia configuración.</strong>
            </span>
          </div>
          <span className={s.visualNumber}>PF—001</span>
        </div>
      </section>
      <section className={s.promiseStrip} aria-label="Nuestra propuesta">
        <div>
          <Cpu size={23} />
          <span>
            <strong>Componentes para tu PC</strong>
            <small>Elegí según lo que necesitás.</small>
          </span>
        </div>
        <div>
          <MessageSquare size={23} />
          <span>
            <strong>Asesoramiento cercano</strong>
            <small>Consultanos antes de elegir.</small>
          </span>
        </div>
        <div>
          <Check size={23} />
          <span>
            <strong>Disponibilidad a la vista</strong>
            <small>Información clara en cada producto.</small>
          </span>
        </div>
      </section>
      <section className={s.section}>
        <div className={s.sectionHeading}>
          <div>
            <p className={s.eyebrow}>CADA PIEZA CUENTA</p>
            <h2>Encontrá tu categoría.</h2>
          </div>
          <ArrowLink to="/productos">Ver todo el catálogo</ArrowLink>
        </div>
        <ResourceState resource={categories}>
          {categories.data?.data.length ? (
            <div className={s.categoryGrid}>
              {categories.data.data.map((category, index) => (
                <Link
                  to={`/productos?categoryId=${category.id}`}
                  className={s.categoryCard}
                  key={category.id}
                >
                  <span className={s.categoryNumber}>0{index + 1}</span>
                  <HardwareArt category={category.name} />
                  <div>
                    <h3>{category.name}</h3>
                    <ArrowUpRight size={19} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Empty title="Estamos preparando el catálogo">
              Pronto vas a poder explorar nuestras categorías.
            </Empty>
          )}
        </ResourceState>
      </section>
      <section className={`${s.section} ${s.softSection}`}>
        <div className={s.sectionHeading}>
          <div>
            <p className={s.eyebrow}>EXPLORÁ EL CATÁLOGO</p>
            <h2>Tu próxima mejora.</h2>
          </div>
          <ArrowLink to="/productos">Todos los componentes</ArrowLink>
        </div>
        <ResourceState resource={products}>
          {products.data?.data.length ? (
            <div className={s.productGrid}>
              {products.data.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Empty title="Todavía no hay productos">
              Volvé a visitarnos pronto.
            </Empty>
          )}
        </ResourceState>
      </section>
      <section className={s.contactBanner}>
        <div>
          <p className={s.eyebrow}>UNA BUENA PC EMPIEZA CON UNA CHARLA</p>
          <h2>¿No sabés por dónde empezar?</h2>
          <p>
            Contanos qué tenés en mente. Te ayudamos a encontrar los componentes
            para tu próxima configuración.
          </p>
        </div>
        <ButtonLink to="/contacto">
          Hacé tu consulta
          <ArrowUpRight size={18} />
        </ButtonLink>
      </section>
    </>
  );
}

const sortOptions = {
  newest: "Más recientes",
  name: "Nombre: A–Z",
  price_asc: "Menor precio",
  price_desc: "Mayor precio",
};

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").slice(0, 100);
  const categoryId = /^[1-9]\d*$/.test(params.get("categoryId") || "")
    ? params.get("categoryId")
    : "";
  const stock = Object.hasOwn(availability, params.get("availability"))
    ? params.get("availability")
    : "";
  const sort = Object.hasOwn(sortOptions, params.get("sort"))
    ? params.get("sort")
    : "newest";
  const page = Math.max(
    1,
    Math.min(100000, Number.parseInt(params.get("page"), 10) || 1),
  );
  const [search, setSearch] = useState(q);
  useEffect(() => {
    setSearch(q);
  }, [q, categoryId, stock, sort, page]);
  const [searchError, setSearchError] = useState("");
  const categories = useResource("/categories");
  const products = useResource(
    `/products?${queryString({ q, categoryId, availability: stock, sort, page, limit: 12 })}`,
  );
  function update(values) {
    setParams(
      queryString({
        q,
        categoryId,
        availability: stock,
        sort,
        ...values,
        page: values.page || 1,
      }),
    );
  }
  const active = q || categoryId || stock;
  return (
    <div className={s.container}>
      <PageHeading
        eyebrow="EL SIGUIENTE PASO PARA TU PC"
        title="Componentes."
        description="Elegí lo que necesitás. Consultanos lo que quieras."
      />
      <div className={s.catalogLayout}>
        <aside className={s.filters}>
          <h2>
            <SlidersHorizontal size={17} />
            Filtrá tu búsqueda
          </h2>
          <label htmlFor="category-filter">Categoría</label>
          <select
            id="category-filter"
            value={categoryId}
            onChange={(event) => update({ categoryId: event.target.value })}
          >
            <option value="">Todas las categorías</option>
            {categories.data?.data.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categories.error && (
            <>
              <Notice>{categories.error.message}</Notice>
              <Button variant="ghost" onClick={categories.reload}>
                Reintentar categorías
              </Button>
            </>
          )}
          <label htmlFor="availability-filter">Disponibilidad</label>
          <select
            id="availability-filter"
            value={stock}
            onChange={(event) => update({ availability: event.target.value })}
          >
            <option value="">Todos los estados</option>
            {Object.entries(availability).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {active && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearch("");
                setSearchError("");
                setParams({});
              }}
            >
              Limpiar filtros
            </Button>
          )}
          <div className={s.filterHelp}>
            <MessageSquare size={23} />
            <h3>¿Una mano para elegir?</h3>
            <p>Estamos para ayudarte a dar el próximo paso.</p>
            <ArrowLink to="/contacto">Consultanos</ArrowLink>
          </div>
        </aside>
        <div className={s.catalogResults}>
          <form
            className={s.searchForm}
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const error = validate({ q: search }, rules.search).q;
              setSearchError(error || "");
              if (!error) update({ q: search.trim() });
            }}
          >
            <Search size={19} />
            <label className={s.srOnly} htmlFor="catalog-search">
              Buscar componentes
            </label>
            <input
              id="catalog-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscá por nombre o descripción…"
              maxLength={100}
            />
            <Button type="submit">Buscar</Button>
          </form>
          {searchError && <Notice>{searchError}</Notice>}
          <div className={s.resultToolbar}>
            <span aria-live="polite">
              {products.loading
                ? "Buscando componentes…"
                : `${products.data?.meta.total ?? 0} componentes${q ? ` para “${q}”` : ""}`}
            </span>
            <label>
              Ordenar por{" "}
              <select
                value={sort}
                onChange={(event) => update({ sort: event.target.value })}
                aria-label="Ordenar productos"
              >
                {Object.entries(sortOptions).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ResourceState resource={products}>
            {products.data?.data.length ? (
              <div className={`${s.productGrid} ${s.catalogGrid}`}>
                {products.data.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Empty title="No encontramos componentes">
                Probá con otra búsqueda o quitá los filtros.
                {page > 1 && " También podés volver a la primera página."}
              </Empty>
            )}
            <Pagination
              page={page}
              total={products.data?.meta.total || 0}
              limit={12}
              count={products.data?.data.length || 0}
              onChange={(page) => update({ page })}
            />
          </ResourceState>
        </div>
      </div>
    </div>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const validId = /^[1-9]\d*$/.test(id);
  const resource = useResource(validId ? `/products/${id}` : null);
  const product = resource.data?.data;
  return (
    <div className={s.container}>
      <BackLink to="/productos">Volver a componentes</BackLink>
      {!validId ? (
        <Empty title="Producto no encontrado">
          El identificador no es válido.
        </Empty>
      ) : (
        <ResourceState resource={resource}>
          {product && (
            <>
              <div className={s.productDetail}>
                <ProductImage product={product} large />
                <div className={s.productInfo}>
                  <Link
                    className={s.eyebrow}
                    to={`/productos?categoryId=${product.category.id}`}
                  >
                    {product.category.name}
                  </Link>
                  <h1>{product.name}</h1>
                  <AvailabilityBadge value={product.availability} />
                  <p className={s.detailPrice}>{money(product.price)}</p>
                  <p className={s.muted}>
                    Precio expresado en pesos argentinos.
                  </p>
                  <p className={s.description}>{product.description}</p>
                  <ButtonLink
                    to={`/contacto?producto=${encodeURIComponent(product.name)}`}
                  >
                    Consultar por este producto
                    <ArrowUpRight size={18} />
                  </ButtonLink>
                  <p className={s.productFinePrint}>
                    Te confirmamos disponibilidad y respondemos tus dudas antes
                    de que elijas.
                  </p>
                </div>
              </div>
              <div className={s.detailBottom}>
                <h2>Los detalles importan.</h2>
                <dl>
                  <div>
                    <dt>Categoría</dt>
                    <dd>{product.category.name}</dd>
                  </div>
                  <div>
                    <dt>Disponibilidad</dt>
                    <dd>{availability[product.availability]}</dd>
                  </div>
                  <div>
                    <dt>Referencia</dt>
                    <dd>PF-{String(product.id).padStart(4, "0")}</dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </ResourceState>
      )}
    </div>
  );
}

export function AboutPage() {
  const store = useStore();
  const info = store.data?.data;
  return (
    <div className={s.container}>
      <PageHeading
        eyebrow="CONOCÉ PIXEL FORGE"
        title="Tecnología, con criterio."
        description="Un espacio para encontrar las piezas de tu próxima idea."
      />
      <div className={s.aboutLayout}>
        <div className={s.aboutArt}>
          <HardwareArt hero />
          <span className={s.eyebrow}>
            BUENAS PIEZAS. GRANDES POSIBILIDADES.
          </span>
        </div>
        <div>
          <h2>{info?.name || "Pixel Forge Componentes"}</h2>
          <ResourceState resource={store}>
            {info ? (
              <p className={s.description}>{info.description}</p>
            ) : (
              <p className={s.lead}>
                El comercio todavía no publicó su información institucional.
                Podés enviarnos una consulta desde el formulario de contacto.
              </p>
            )}
          </ResourceState>
          <ButtonLink to="/contacto" variant="secondary">
            Conversemos
            <ArrowUpRight size={17} />
          </ButtonLink>
        </div>
      </div>
      {info && <StoreDetails info={info} />}
    </div>
  );
}

function StoreDetails({ info }) {
  return (
    <div className={s.storeDetails}>
      <div>
        <MapPin size={22} />
        <h3>Dónde estamos</h3>
        <p>{info.address}</p>
      </div>
      <div>
        <Phone size={22} />
        <h3>Hablemos</h3>
        <p>{info.phone}</p>
        {Object.entries(info.socialLinks || {})
          .filter(([, url]) => safeWebUrl(url))
          .map(([name, url]) => (
            <a
              key={name}
              href={safeWebUrl(url)}
              target="_blank"
              rel="noreferrer"
            >
              {name}
              <ArrowUpRight size={14} />
            </a>
          ))}
      </div>
      <div>
        <span className={s.clockSymbol}>◷</span>
        <h3>Horarios</h3>
        <p>{info.openingHours}</p>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [params] = useSearchParams();
  const productName = params.get("producto");
  const store = useStore();
  const mutation = useMutation();
  const [sent, setSent] = useState(false);
  const initial = {
    name: "",
    email: "",
    phone: "",
    subject: productName ? `Consulta por ${productName}`.slice(0, 200) : "",
    message: "",
  };
  return (
    <div className={s.container}>
      <PageHeading
        eyebrow="ESTAMOS PARA AYUDARTE"
        title="Hablemos de tu próxima PC."
        description="Dejanos tu consulta y tus datos de contacto para que podamos responderte."
      />
      <div className={s.contactLayout}>
        <div className={s.contactIntro}>
          <span className={s.largeIcon}>
            <MessageSquare size={34} />
          </span>
          <h2>
            Una consulta.
            <br />
            Un buen comienzo.
          </h2>
          <p>
            Contanos qué buscás, qué equipo tenés o qué te gustaría mejorar.
          </p>
          <ResourceState resource={store}>
            {store.data?.data ? (
              <StoreDetails info={store.data.data} />
            ) : (
              <p className={s.muted}>
                La información de dirección, teléfono y horarios todavía no fue
                publicada.
              </p>
            )}
          </ResourceState>
        </div>
        <div className={s.formPanel}>
          {sent ? (
            <div className={s.successPanel} role="status">
              <span className={s.successMark}>
                <Check size={28} />
              </span>
              <h2>Tu consulta ya está en camino.</h2>
              <p>
                La guardamos correctamente. Usaremos los datos que nos dejaste
                para ponernos en contacto.
              </p>
              <Button variant="secondary" onClick={() => setSent(false)}>
                Enviar otra consulta
              </Button>
            </div>
          ) : (
            <>
              <h2>¿En qué podemos ayudarte?</h2>
              <Form
                key={productName || "contact"}
                initialValues={initial}
                schema={rules.contact}
                pending={mutation.pending}
                error={mutation.error}
                submitLabel="Enviar consulta"
                onSubmit={(values) =>
                  mutation.run(async () => {
                    await api("/inquiries", {
                      method: "POST",
                      body: {
                        ...values,
                        email: values.email.toLowerCase(),
                        phone: values.phone || null,
                      },
                    });
                    setSent(true);
                  })
                }
              >
                {({ field }) => (
                  <>
                    <div className={s.twoColumns}>
                      {field("name", "Nombre", { autoComplete: "name" })}
                      {field("email", "Correo electrónico", {
                        type: "email",
                        autoComplete: "email",
                      })}
                    </div>
                    {field("phone", "Teléfono (opcional)", {
                      type: "tel",
                      autoComplete: "tel",
                    })}
                    {field("subject", "Asunto")}
                    {field("message", "Mensaje", { multiline: true, rows: 5 })}
                    <p className={s.formHint}>
                      Tus datos se utilizan para gestionar esta consulta.
                    </p>
                  </>
                )}
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className={s.container}>
      <Empty
        title="Esta página no existe"
        action={
          <ButtonLink to="/">
            Volver al inicio
            <ArrowRight size={16} />
          </ButtonLink>
        }
      >
        Puede que el enlace haya cambiado. Seguimos acá para ayudarte.
      </Empty>
    </div>
  );
}
