import ProductCard from "./ProductCard";
import { ArrowLink, Empty, ResourceState } from "./UI";
import { useResource } from "../lib/hooks";
import s from "../styles/App.module.css";

export default function FeaturedProducts() {
  const products = useResource(
    "/products?isFeatured=true&limit=4&sort=offers_first",
  );
  return (
    <section className={s.section} aria-labelledby="featured-heading">
      <div className={s.sectionHeading}>
        <div>
          <p className={s.eyebrow}>ELEGIDOS POR PIXEL FORGE</p>
          <h2 id="featured-heading">Productos destacados.</h2>
        </div>
        <ArrowLink to="/productos?isFeatured=true">
          Ver todos los destacados
        </ArrowLink>
      </div>
      <ResourceState resource={products}>
        {products.data?.data.length ? (
          <div className={s.productGrid}>
            {products.data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Empty title="Estamos preparando nuestra selección">
            Mientras tanto, explorá todos los componentes del catálogo.
          </Empty>
        )}
      </ResourceState>
    </section>
  );
}
