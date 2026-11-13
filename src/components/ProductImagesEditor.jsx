import { useEffect, useId, useRef } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { ProductImage } from "./ProductCard";
import { Button } from "./UI";
import { rules, validate } from "../lib/validation";
import s from "../styles/App.module.css";

const imageRules = {
  imageUrl: rules.product.imageUrl,
  additionalImageUrls: rules.product.additionalImageUrls,
};
const imageError = (name) =>
  name === "imageUrl" || name.startsWith("additionalImageUrls");

export default function ProductImagesEditor({
  values,
  setValues,
  errors,
  setErrors,
  categoryName,
}) {
  const id = useId();
  const inputs = useRef([]);
  const focusIndex = useRef(null);
  const urls = [values.imageUrl, ...(values.additionalImageUrls || [])];
  useEffect(() => {
    if (focusIndex.current !== null) {
      inputs.current[focusIndex.current]?.focus();
      focusIndex.current = null;
    }
  }, [values.imageUrl, values.additionalImageUrls]);

  function check(next) {
    setErrors((previous) => ({
      ...Object.fromEntries(
        Object.entries(previous).filter(([name]) => !imageError(name)),
      ),
      ...validate(next, imageRules),
    }));
  }
  function update(nextUrls, nextFocus = null) {
    const [imageUrl, ...additionalImageUrls] = nextUrls;
    const next = { ...values, imageUrl, additionalImageUrls };
    focusIndex.current = nextFocus;
    setValues(next);
    if (Object.keys(errors).some((name) => imageError(name) && errors[name]))
      check(next);
  }
  function move(index, offset) {
    const next = [...urls];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    update(next, index + offset);
  }
  return (
    <fieldset
      className={s.imagesEditor}
      name="additionalImageUrls"
      tabIndex={-1}
      aria-describedby={`${id}-hint${errors.additionalImageUrls ? ` ${id}-error` : ""}`}
    >
      <legend>Imágenes del producto</legend>
      <p id={`${id}-hint`} className={s.formHint}>
        De 1 a 10 URLs públicas HTTP/HTTPS. La primera es la imagen principal.
      </p>
      <ol className={s.imageEditorList}>
        {urls.map((url, index) => {
          const name =
            index === 0 ? "imageUrl" : `additionalImageUrls.${index - 1}`;
          const inputId = `${id}-${index}`;
          return (
            <li className={s.imageEditorRow} key={index}>
              <div className={s.imageEditorPreview} aria-hidden="true">
                <ProductImage
                  product={{
                    name: "",
                    imageUrl: url,
                    category: { name: categoryName },
                  }}
                  thumbnail
                  alt=""
                />
              </div>
              <div className={s.field}>
                <label htmlFor={inputId}>
                  {index === 0
                    ? "URL de la imagen"
                    : `URL de la imagen ${index + 1}`}
                  <span aria-hidden="true" className={s.required}>
                    {" "}
                    *
                  </span>
                </label>
                <input
                  ref={(input) => {
                    inputs.current[index] = input;
                  }}
                  id={inputId}
                  name={name}
                  type="url"
                  required
                  maxLength={2000}
                  placeholder="https://…"
                  value={url}
                  onChange={(event) =>
                    update(
                      urls.map((value, position) =>
                        position === index ? event.target.value : value,
                      ),
                    )
                  }
                  onBlur={(event) => {
                    if (event.relatedTarget?.tagName === "BUTTON") return;
                    check(values);
                  }}
                  aria-invalid={!!errors[name]}
                  aria-describedby={
                    errors[name] ? `${inputId}-error` : `${inputId}-hint`
                  }
                />
                <small id={`${inputId}-hint`}>
                  {index === 0
                    ? "Imagen principal del catálogo."
                    : `Imagen ${index + 1} de la galería.`}
                </small>
                {errors[name] && (
                  <span className={s.fieldError} id={`${inputId}-error`}>
                    {errors[name]}
                  </span>
                )}
              </div>
              <div className={s.imageEditorActions}>
                <button
                  type="button"
                  className={s.iconButton}
                  disabled={index === 0}
                  aria-label={`Subir imagen ${index + 1}`}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  className={s.iconButton}
                  disabled={index === urls.length - 1}
                  aria-label={`Bajar imagen ${index + 1}`}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  className={s.iconButton}
                  disabled={urls.length === 1}
                  aria-label={`Eliminar imagen ${index + 1}`}
                  onClick={() =>
                    update(
                      urls.filter((_, position) => position !== index),
                      Math.min(index, urls.length - 2),
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      {errors.additionalImageUrls && (
        <p className={s.fieldError} id={`${id}-error`}>
          {errors.additionalImageUrls}
        </p>
      )}
      <div className={s.imageEditorFooter}>
        <Button
          type="button"
          variant="secondary"
          disabled={urls.length >= 10}
          onClick={() => update([...urls, ""], urls.length)}
        >
          <Plus size={16} />
          Agregar imagen
        </Button>
        <span className={s.muted}>{urls.length} de 10 imágenes</span>
      </div>
    </fieldset>
  );
}
