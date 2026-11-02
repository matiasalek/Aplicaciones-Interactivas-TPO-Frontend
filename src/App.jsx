import { Component, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import { AdminLayout, PublicLayout, RequireAuth } from "./components/Layouts";
import { Button, Notice } from "./components/UI";
import {
  HomePage,
  CatalogPage,
  ProductPage,
  AboutPage,
  ContactPage,
  NotFoundPage,
} from "./pages/PublicPages";
import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "./pages/AuthPages";
import {
  AdminHomePage,
  AdminProductsPage,
  ProductEditorPage,
  CategoriesPage,
  CategoryEditorPage,
  InquiriesPage,
  InquiryDetailPage,
  StoreEditorPage,
  ProfilePage,
} from "./pages/AdminPages";

class ErrorBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (this.state.error)
      return (
        <div style={{ padding: "3rem", maxWidth: 800, margin: "auto" }}>
          <h1>No pudimos mostrar esta página.</h1>
          <Notice>
            Ocurrió un error inesperado. Recargá la página para volver a
            intentar.
          </Notice>
          <Button onClick={() => window.location.reload()}>Recargar</Button>
        </div>
      );
    return this.props.children;
  }
}

function NavigationEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const timer = setTimeout(() => {
      const heading = document.querySelector("h1");
      document.title = `${heading?.textContent || "Pixel Forge"} · Pixel Forge Componentes`;
      const main = document.getElementById("contenido");
      main?.focus({ preventScroll: true });
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationEffects />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="productos" element={<CatalogPage />} />
          <Route path="productos/:id" element={<ProductPage />} />
          <Route path="nosotros" element={<AboutPage />} />
          <Route path="contacto" element={<ContactPage />} />
          <Route path="ingresar" element={<LoginPage />} />
          <Route path="registrarse" element={<LoginPage register />} />
          <Route path="recuperar-contrasena" element={<ForgotPasswordPage />} />
          <Route
            path="restablecer-contrasena"
            element={<ResetPasswordPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path="productos" element={<AdminProductsPage />} />
            <Route
              path="productos/nuevo"
              element={<ProductEditorPage create />}
            />
            <Route
              path="productos/:id/editar"
              element={<ProductEditorPage />}
            />
            <Route path="categorias" element={<CategoriesPage />} />
            <Route
              path="categorias/nueva"
              element={<CategoryEditorPage create />}
            />
            <Route
              path="categorias/:id/editar"
              element={<CategoryEditorPage />}
            />
            <Route path="consultas" element={<InquiriesPage />} />
            <Route path="consultas/:id" element={<InquiryDetailPage />} />
            <Route path="comercio" element={<StoreEditorPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
