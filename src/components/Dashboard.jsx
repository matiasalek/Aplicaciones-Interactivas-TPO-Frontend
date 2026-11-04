import { useEffect, useState } from "react";
import { Button, ResourceState } from "./UI";
import { date } from "../lib/api";
import { loadDashboard } from "../lib/dashboard";
import s from "../styles/App.module.css";

function Distribution({ title, description, rows, total, empty }) {
  return (
    <section className={s.dashboardPanel} aria-label={title}>
      <h3>{title}</h3>
      <p>{description}</p>
      {total === 0 && <p className={s.dashboardEmpty}>{empty}</p>}
      <ul className={s.dashboardBars}>
        {rows.map(({ key, label, count }) => {
          const percentage = total ? (count / total) * 100 : 0;
          return (
            <li key={key}>
              <div className={s.dashboardBarLabel}>
                <span>{label}</span>
                <span>
                  {count} · {Math.round(percentage)} %
                </span>
              </div>
              <div className={s.dashboardTrack} aria-hidden="true">
                <div style={{ width: `${percentage}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Dashboard() {
  const [revision, setRevision] = useState(0);
  const [resource, setResource] = useState({
    loading: true,
    data: null,
    error: null,
  });
  const reload = () => setRevision((value) => value + 1);
  useEffect(() => {
    const controller = new AbortController();
    setResource({ loading: true, data: null, error: null });
    loadDashboard(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setResource({ loading: false, data, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setResource({ loading: false, data: null, error });
          controller.abort();
        }
      });
    return () => controller.abort();
  }, [revision]);
  const data = resource.data;
  return (
    <section aria-labelledby="dashboard-heading" className={s.dashboard}>
      <div className={s.dashboardHeading}>
        <div>
          <h2 id="dashboard-heading">Tu comercio en números</h2>
          <p>Estado actual del catálogo y las consultas recibidas.</p>
        </div>
        <Button
          variant="secondary"
          onClick={reload}
          disabled={resource.loading}
        >
          Actualizar
        </Button>
      </div>
      <ResourceState resource={{ ...resource, reload }}>
        {data && (
          <>
            <p className={s.dashboardUpdated} role="status">
              Última actualización: {date(data.updatedAt)}
            </p>
            <dl className={s.dashboardMetrics}>
              {[
                ["Total de productos", data.totalProducts],
                ["Productos activos", data.active],
                ["Productos inactivos", data.inactive],
                ["Total de consultas", data.totalInquiries],
              ].map(([label, count]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{count}</dd>
                </div>
              ))}
            </dl>
            <div className={s.dashboardDistributions}>
              <Distribution
                title="Disponibilidad"
                description="Incluye productos activos e inactivos."
                rows={data.availability}
                total={data.totalProducts}
                empty="Todavía no hay productos cargados."
              />
              <Distribution
                title="Estado de las consultas"
                description="Distribución de todas las consultas recibidas."
                rows={data.inquiries}
                total={data.totalInquiries}
                empty="Todavía no recibiste consultas."
              />
              <Distribution
                title="Productos por categoría"
                description="Incluye productos activos e inactivos y categorías vacías."
                rows={data.categories}
                total={data.totalProducts}
                empty="Todavía no hay productos cargados."
              />
            </div>
          </>
        )}
      </ResourceState>
    </section>
  );
}
