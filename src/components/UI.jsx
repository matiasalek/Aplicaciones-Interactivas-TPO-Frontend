import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react";
import { Link } from "react-router";
import { clean, validate } from "../lib/validation";
import s from "../styles/App.module.css";

export function Button({
  children,
  variant = "primary",
  className = "",
  busy,
  ...props
}) {
  return (
    <button
      className={`${s.button} ${s[variant]} ${className}`}
      {...props}
      disabled={props.disabled || busy}
      aria-busy={busy || undefined}
    >
      {busy && <LoaderCircle className={s.spin} size={16} />}
      {children}
    </button>
  );
}
export function ButtonLink({ children, to, variant = "primary", ...props }) {
  return (
    <Link to={to} className={`${s.button} ${s[variant]}`} {...props}>
      {children}
    </Link>
  );
}
export function Notice({ children, tone = "error" }) {
  return (
    <div
      className={`${s.notice} ${s[tone]}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {tone === "error" ? <TriangleAlert size={19} /> : <Check size={19} />}
      <div>{children}</div>
    </div>
  );
}
export function Loading() {
  return (
    <div className={s.loading} role="status">
      <LoaderCircle className={s.spin} size={24} />
      <span>Cargando…</span>
    </div>
  );
}
export function ResourceState({ resource, children }) {
  if (resource.loading) return <Loading />;
  if (resource.error)
    return (
      <div className={s.state}>
        <Notice>{resource.error.message}</Notice>
        <Button variant="secondary" onClick={resource.reload}>
          Volver a intentar
        </Button>
      </div>
    );
  return children;
}
export function Empty({
  title = "Todavía no hay resultados",
  children,
  action,
}) {
  return (
    <div className={s.empty}>
      <span className={s.emptyMark}>↗</span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className={s.pageHeading}>
      <div>
        {eyebrow && <p className={s.eyebrow}>{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className={s.lead}>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function BackLink({ to, children }) {
  return (
    <Link className={s.backLink} to={to}>
      <ArrowLeft size={16} />
      {children}
    </Link>
  );
}
export function ArrowLink({ to, children }) {
  return (
    <Link className={s.arrowLink} to={to}>
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}

export function Form({
  initialValues,
  schema,
  onSubmit,
  submitLabel = "Guardar cambios",
  children,
  pending,
  error,
  className = "",
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const formId = useId();
  const field = (name, label, props = {}) => {
    const id = `${formId}-${name}`;
    const { multiline, options, hint, ...inputProps } = props;
    const Component = multiline ? "textarea" : options ? "select" : "input";
    return (
      <div className={s.field} key={name}>
        <label htmlFor={id}>
          {label}
          {schema[name]?.required && (
            <span className={s.required} aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
        <Component
          id={id}
          name={name}
          value={values[name] ?? ""}
          required={schema[name]?.required || undefined}
          maxLength={schema[name]?.max}
          {...inputProps}
          onChange={(event) => {
            const next = { ...values, [name]: event.target.value };
            setValues(next);
            if (errors[name])
              setErrors((previous) => ({
                ...previous,
                [name]: validate(next, schema)[name],
              }));
          }}
          onBlur={() =>
            setErrors((previous) => ({
              ...previous,
              [name]: validate(values, schema)[name],
            }))
          }
          aria-invalid={!!errors[name]}
          aria-describedby={
            errors[name] ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Component>
        {hint && <small id={`${id}-hint`}>{hint}</small>}
        {errors[name] && (
          <span id={`${id}-error`} className={s.fieldError}>
            {errors[name]}
          </span>
        )}
      </div>
    );
  };
  async function submit(event) {
    event.preventDefault();
    const nextErrors = validate(values, schema);
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) {
      formRef.current.elements.namedItem(first)?.focus();
      return;
    }
    await onSubmit(clean(values), () => {
      setValues(initialValues);
      setErrors({});
    });
  }
  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={submit}
      className={`${s.form} ${className}`}
    >
      <p className={s.formHint}>Los campos con * son obligatorios.</p>
      <fieldset disabled={pending} className={s.fieldset}>
        {children({ field, values, setValues, errors })}
      </fieldset>
      {error && <Notice>{error.message}</Notice>}
      <Button type="submit" busy={pending}>
        {submitLabel}
        <ArrowRight size={17} />
      </Button>
    </form>
  );
}

export function Pagination({ page, total, limit, onChange, count = 0 }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (page === 1 && totalPages <= 1) return null;
  return (
    <nav aria-label="Paginación" className={s.pagination}>
      <Button
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={16} />
        Anterior
      </Button>
      <span aria-live="polite">
        Página {page}
        {total > 0 && ` de ${totalPages}`}
        {!count && " · Sin resultados"}
      </span>
      <Button
        variant="secondary"
        disabled={page >= totalPages || count < limit}
        onClick={() => onChange(page + 1)}
      >
        Siguiente
        <ChevronRight size={16} />
      </Button>
    </nav>
  );
}

export function ConfirmDialog({
  title,
  children,
  pending,
  error,
  onConfirm,
  onClose,
}) {
  const ref = useRef(null);
  const titleId = useId();
  const busyRef = useRef(pending);
  busyRef.current = pending;
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={s.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busyRef.current) onClose();
      }}
    >
      <div className={s.dialogTop}>
        <span className={s.eyebrow}>Confirmar acción</span>
        <button
          aria-label="Cerrar"
          className={s.iconButton}
          disabled={pending}
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <h2 id={titleId}>{title}</h2>
      <p>{children}</p>
      {error && <Notice>{error.message}</Notice>}
      <div className={s.actions}>
        <Button variant="secondary" disabled={pending} onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" busy={pending} onClick={onConfirm}>
          Eliminar
        </Button>
      </div>
    </dialog>
  );
}
