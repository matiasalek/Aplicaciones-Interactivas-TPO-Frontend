import { useState } from "react";
import { ProductImage } from "./ProductCard";
import s from "../styles/App.module.css";

export default function ProductGallery({ product }) {
  const urls = product.imageUrls?.length
    ? product.imageUrls
    : [product.imageUrl];
  const [selected, setSelected] = useState(0);
  const index = selected < urls.length ? selected : 0;
  return (
    <section
      className={s.productGallery}
      aria-label={`Imágenes de ${product.name}`}
    >
      <ProductImage
        product={{ ...product, imageUrl: urls[index] }}
        large
        alt={`${product.name}, imagen ${index + 1} de ${urls.length}`}
      />
      {urls.length > 1 && (
        <>
          <div
            className={s.galleryThumbnails}
            role="group"
            aria-label="Elegir imagen del producto"
          >
            {urls.map((url, position) => (
              <button
                type="button"
                key={url}
                className={`${s.galleryThumbnail} ${position === index ? s.galleryThumbnailSelected : ""}`}
                aria-label={`Ver imagen ${position + 1} de ${urls.length}${position === 0 ? ", principal" : ""}`}
                aria-pressed={position === index}
                onClick={() => setSelected(position)}
              >
                <ProductImage
                  product={{ ...product, imageUrl: url }}
                  thumbnail
                  alt=""
                />
              </button>
            ))}
          </div>
          <p className={s.galleryPosition} aria-live="polite">
            Imagen {index + 1} de {urls.length}
          </p>
        </>
      )}
    </section>
  );
}
