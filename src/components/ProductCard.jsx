import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { availability, money, safeWebUrl } from "../lib/api";
import HardwareArt from "./HardwareArt";
import s from "../styles/App.module.css";

export function ProductImage({ product, large = false }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const url = safeWebUrl(product.imageUrl);
  const illustrated =
    !url || failedUrl === url || new URL(url).hostname === "placehold.co";
  return (
    <div className={`${s.productImage} ${large ? s.largeImage : ""}`}>
      {illustrated ? (
        <>
          <HardwareArt category={product.category?.name} />
          <span className={s.imageCaption}>Ilustración de categoría</span>
        </>
      ) : (
        <img
          src={url}
          alt={product.name}
          loading="lazy"
          onError={() => setFailedUrl(url)}
        />
      )}
    </div>
  );
}
export function AvailabilityBadge({ value }) {
  return (
    <span className={`${s.badge} ${s[value]}`}>
      <i />
      {availability[value] || value}
    </span>
  );
}
export default function ProductCard({ product }) {
  return (
    <article className={s.productCard}>
      <Link to={`/productos/${product.id}`} className={s.productCardLink}>
        <ProductImage product={product} />
        <div className={s.productCardBody}>
          <div className={s.cardMeta}>
            <span>{product.category?.name}</span>
            <ArrowUpRight size={18} />
          </div>
          <h3>{product.name}</h3>
          <AvailabilityBadge value={product.availability} />
          <p className={s.price}>{money(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
