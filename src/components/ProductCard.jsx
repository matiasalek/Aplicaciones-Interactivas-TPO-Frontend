import { useState } from "react";
import { ArrowUpRight, Star, Tag } from "lucide-react";
import { Link } from "react-router";
import { availability, money, safeWebUrl } from "../lib/api";
import HardwareArt from "./HardwareArt";
import s from "../styles/App.module.css";

export function ProductImage({
  product,
  large = false,
  thumbnail = false,
  alt = product.name,
}) {
  const [failedUrl, setFailedUrl] = useState(null);
  const url = safeWebUrl(product.imageUrl);
  const illustrated =
    !url || failedUrl === url || new URL(url).hostname === "placehold.co";
  return (
    <div className={`${s.productImage} ${large ? s.largeImage : ""}`}>
      {illustrated ? (
        <>
          <HardwareArt category={product.category?.name} />
          {!thumbnail && (
            <span className={s.imageCaption}>Ilustración de categoría</span>
          )}
        </>
      ) : (
        <img
          src={url}
          alt={alt}
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
export function FeaturedBadge() {
  return (
    <span className={s.featuredBadge}>
      <Star size={13} aria-hidden="true" />
      Destacado
    </span>
  );
}
export function OfferBadge() {
  return (
    <span className={s.offerBadge}>
      <Tag size={13} aria-hidden="true" />
      Oferta
    </span>
  );
}
export function ProductPrice({ product, className = s.price }) {
  const onOffer = product.promotionPrice != null;
  return (
    <p className={className}>
      {onOffer && (
        <>
          <span className={s.srOnly}>Precio habitual</span>
          <s className={s.oldPrice}>{money(product.price)}</s>
          <span className={s.srOnly}>Precio promocional</span>
        </>
      )}
      {money(product.effectivePrice ?? product.promotionPrice ?? product.price)}
    </p>
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
          <div className={s.productBadges}>
            <AvailabilityBadge value={product.availability} />
            {product.isFeatured && <FeaturedBadge />}
            {product.promotionPrice != null && <OfferBadge />}
          </div>
          <ProductPrice product={product} />
        </div>
      </Link>
    </article>
  );
}
