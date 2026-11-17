import { useResource } from "../lib/hooks";
import { announcementTypes } from "../lib/api";
import { ProductPrice } from "./ProductCard";
import { ArrowLink, ResourceState } from "./UI";
import s from "../styles/App.module.css";

export default function Announcements() {
  const resource = useResource("/announcements");
  const items = resource.data?.data;
  if (items?.length === 0) return null;

  return (
    <section className={s.section} aria-labelledby="announcements-heading">
      <div className={s.sectionHeading}>
        <h2 id="announcements-heading">Promociones y novedades</h2>
      </div>
      <ResourceState resource={resource}>
        <div className={s.announcementGrid}>
          {items?.map((item) => (
            <article key={item.id} className={s.announcementCard}>
              <span
                className={item.type === "promotion" ? s.offerBadge : s.badge}
              >
                {announcementTypes[item.type]}
              </span>
              <h3>{item.title}</h3>
              <p className={s.announcementText}>{item.description}</p>
              {item.product && (
                <>
                  <ProductPrice
                    product={{
                      ...item.product,
                      promotionPrice: item.promotionPrice,
                    }}
                  />
                  <ArrowLink to={`/productos/${item.product.id}`}>
                    Ver {item.product.name}
                  </ArrowLink>
                </>
              )}
            </article>
          ))}
        </div>
      </ResourceState>
    </section>
  );
}
