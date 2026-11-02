import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Box,
  ChevronRight,
  Grid2X2,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings2,
  UserRound,
  X,
} from "lucide-react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router";
import { useAuth } from "../context/AuthContext";
import { useMutation, useResource } from "../lib/hooks";
import { safeWebUrl } from "../lib/api";
import { Button, Loading, Notice } from "./UI";
import s from "../styles/App.module.css";

export function Brand({ compact = false }) {
  return (
    <Link
      to="/"
      className={s.brand}
      aria-label="Pixel Forge Componentes, inicio"
    >
      <span className={s.brandMark}>
        <span />
        <span />
        <span />
      </span>
      <span>
        pixel forge
        <span className={s.brandSub}>
          {compact ? "ADMINISTRACIÓN" : "COMPONENTES"}
        </span>
      </span>
    </Link>
  );
}

export function PublicLayout() {
  const store = useResource("/store", { optional404: true });
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const info = store.data?.data;
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  return (
    <div className={s.site}>
      <a href="#contenido" className={s.skip}>
        Saltar al contenido
      </a>
      <div className={s.topbar}>
        <span>Componentes para lo que viene.</span>
        <Link to="/contacto">
          Hablemos de tu próxima PC <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className={s.header}>
        <div className={s.headerInner}>
          <Brand />
          <button
            className={s.mobileMenu}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="navegacion"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav
            id="navegacion"
            aria-label="Navegación principal"
            className={`${s.publicNav} ${open ? s.navOpen : ""}`}
          >
            <NavLink to="/" end>
              Inicio
            </NavLink>
            <NavLink to="/productos">Componentes</NavLink>
            <NavLink to="/nosotros">Nosotros</NavLink>
            <NavLink to="/contacto">Contacto</NavLink>
            <Link to={user ? "/admin" : "/ingresar"} className={s.adminAccess}>
              <UserRound size={16} />
              {user ? "Administración" : "Acceso admin"}
            </Link>
          </nav>
        </div>
      </header>
      <main id="contenido" className={s.main} tabIndex="-1">
        <Outlet context={{ store }} />
      </main>
      <footer className={s.footer}>
        <div className={s.footerGrid}>
          <div>
            <Brand />
            <p>
              Tu próxima PC empieza con
              <br />
              una buena elección.
            </p>
          </div>
          <div>
            <h2>Explorá</h2>
            <Link to="/productos">Componentes</Link>
            <Link to="/nosotros">El comercio</Link>
            <Link to="/contacto">Hacé tu consulta</Link>
          </div>
          <div>
            <h2>Encontranos</h2>
            {info ? (
              <>
                <span>{info.address}</span>
                <span>{info.phone}</span>
                <span>{info.openingHours}</span>
              </>
            ) : (
              <Link to="/contacto">Información de contacto</Link>
            )}
            {Object.entries(info?.socialLinks || {})
              .filter(([, url]) => safeWebUrl(url))
              .map(([name, url]) => (
                <a
                  key={name}
                  href={safeWebUrl(url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {name}
                  <ArrowUpRight size={13} />
                </a>
              ))}
          </div>
        </div>
        <div className={s.footerBottom}>
          <span>© {new Date().getFullYear()} Pixel Forge Componentes</span>
          <span>Catálogo y asesoramiento · Precios en pesos argentinos</span>
        </div>
      </footer>
    </div>
  );
}
export const useStore = () => useOutletContext().store;

export function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.checking) return <Loading />;
  if (auth.error)
    return (
      <div className={s.container}>
        <Notice>{auth.error.message}</Notice>
        <Button onClick={auth.verify}>Volver a intentar</Button>
      </div>
    );
  if (!auth.user)
    return (
      <Navigate
        to="/ingresar"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  return <Outlet />;
}

const adminLinks = [
  ["", "Resumen", LayoutDashboard],
  ["productos", "Productos", Box],
  ["categorias", "Categorías", Grid2X2],
  ["consultas", "Consultas", Mail],
  ["comercio", "Información del comercio", Settings2],
  ["perfil", "Mi perfil", UserRound],
];
export function AdminLayout() {
  const auth = useAuth();
  const mutation = useMutation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  return (
    <div className={s.adminShell}>
      <a href="#contenido" className={s.skip}>
        Saltar al contenido
      </a>
      <aside className={s.sidebar}>
        <Brand compact />
        <button
          className={s.mobileMenu}
          aria-label="Alternar menú administrativo"
          aria-expanded={open}
          aria-controls="admin-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="admin-nav"
          className={`${s.adminNav} ${open ? s.navOpen : ""}`}
          aria-label="Administración"
        >
          {adminLinks.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={`/admin${path ? `/${path}` : ""}`}
              end={!path}
            >
              <Icon size={18} />
              {label}
              <ChevronRight size={14} />
            </NavLink>
          ))}
        </nav>
        <div className={s.sidebarBottom}>
          <Link to="/">
            Ver sitio público
            <ArrowUpRight size={16} />
          </Link>
          <span>
            {auth.user.firstName} {auth.user.lastName}
          </span>
          <small>Administrador</small>
          <Button
            variant="ghost"
            busy={mutation.pending}
            onClick={() =>
              mutation.run(async () => {
                await auth.logout();
                navigate("/ingresar");
              })
            }
          >
            <LogOut size={16} />
            Cerrar sesión
          </Button>
          {mutation.error && <Notice>{mutation.error.message}</Notice>}
        </div>
      </aside>
      <div className={s.adminWorkspace}>
        <header className={s.adminTop}>
          <span>PIXEL FORGE / GESTIÓN DEL COMERCIO</span>
          <Link to="/admin/perfil">
            <span className={s.avatar}>
              {auth.user.firstName?.[0]}
              {auth.user.lastName?.[0]}
            </span>
            <span>{auth.user.firstName}</span>
          </Link>
        </header>
        <main id="contenido" tabIndex="-1" className={s.adminMain}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
