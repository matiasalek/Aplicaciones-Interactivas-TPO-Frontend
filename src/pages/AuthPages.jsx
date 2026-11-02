import { useState } from "react";
import { ArrowUpRight, KeyRound, ShieldCheck } from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useMutation } from "../lib/hooks";
import { rules } from "../lib/validation";
import { BackLink, ButtonLink, Form, Loading, Notice } from "../components/UI";
import s from "../styles/App.module.css";

function AuthFrame({
  eyebrow = "ÁREA DE ADMINISTRACIÓN",
  title,
  description,
  children,
}) {
  return (
    <div className={s.authContainer}>
      <BackLink to="/">Volver al sitio</BackLink>
      <div className={s.authLayout}>
        <div className={s.authIntro}>
          <span className={s.largeIcon}>
            <ShieldCheck size={32} />
          </span>
          <p className={s.eyebrow}>{eyebrow}</p>
          <h1>
            Todo tu comercio.
            <br />
            <em>En un lugar.</em>
          </h1>
          <p>
            Administrá tus componentes, mantené tu catálogo al día y conectá con
            tus clientes.
          </p>
          <span className={s.authSignature}>
            PIXEL FORGE COMPONENTES / GESTIÓN
          </span>
        </div>
        <div className={s.authPanel}>
          <h2>{title}</h2>
          <p className={s.muted}>{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage({ register = false }) {
  const auth = useAuth();
  const location = useLocation();
  const mutation = useMutation();
  const destination = location.state?.from?.startsWith("/admin")
    ? location.state.from
    : "/admin";
  if (auth.checking) return <Loading />;
  if (auth.user) return <Navigate to={destination} replace />;
  return (
    <AuthFrame
      title={
        register ? "Creá tu cuenta de administrador" : "Bienvenido de nuevo."
      }
      description={
        register
          ? "Completá tus datos para comenzar a gestionar el comercio."
          : "Ingresá para administrar Pixel Forge."
      }
    >
      {auth.expired && (
        <Notice>Tu sesión finalizó. Ingresá nuevamente para continuar.</Notice>
      )}
      <Form
        key={register ? "register" : "login"}
        initialValues={
          register
            ? {
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
              }
            : { email: "", password: "" }
        }
        schema={register ? rules.register : rules.login}
        pending={mutation.pending}
        error={mutation.error}
        submitLabel={register ? "Crear cuenta" : "Iniciar sesión"}
        onSubmit={(values) =>
          mutation.run(async () => {
            const { confirmPassword, ...body } = values;
            await auth.authenticate(register ? "register" : "login", {
              ...body,
              email: body.email.toLowerCase(),
            });
          })
        }
      >
        {({ field }) => (
          <>
            {register && (
              <div className={s.twoColumns}>
                {field("firstName", "Nombre", { autoComplete: "given-name" })}
                {field("lastName", "Apellido", { autoComplete: "family-name" })}
              </div>
            )}
            {field("email", "Correo electrónico", {
              type: "email",
              autoComplete: "email",
            })}
            {register &&
              field("phone", "Teléfono", { type: "tel", autoComplete: "tel" })}
            {field("password", "Contraseña", {
              type: "password",
              autoComplete: register ? "new-password" : "current-password",
              hint: register ? "Entre 8 y 72 caracteres." : undefined,
            })}
            {register ? (
              field("confirmPassword", "Repetí la contraseña", {
                type: "password",
                autoComplete: "new-password",
              })
            ) : (
              <Link to="/recuperar-contrasena" className={s.inlineLink}>
                Olvidé mi contraseña
              </Link>
            )}
          </>
        )}
      </Form>
      <p className={s.authSwitch}>
        {register ? "¿Ya tenés cuenta?" : "¿Primera vez acá?"}{" "}
        <Link to={register ? "/ingresar" : "/registrarse"}>
          {register ? "Iniciá sesión" : "Creá tu cuenta"}
          <ArrowUpRight size={14} />
        </Link>
      </p>
    </AuthFrame>
  );
}

export function ForgotPasswordPage() {
  const mutation = useMutation();
  const [result, setResult] = useState(null);
  return (
    <AuthFrame
      title="Recuperá tu acceso."
      description="Ingresá el correo de tu cuenta para generar un código de recuperación."
    >
      {result ? (
        <div className={s.recoveryResult}>
          <Notice tone="success">
            Si el correo corresponde a una cuenta, se generó un código de
            recuperación.
          </Notice>
          {result.resetToken && (
            <>
              <p>
                En esta versión académica el código se muestra acá para
                completar el flujo localmente.
              </p>
              <label htmlFor="reset-code">Código de recuperación</label>
              <textarea
                id="reset-code"
                readOnly
                value={result.resetToken}
                rows={3}
              />
              <ButtonLink
                to="/restablecer-contrasena"
                state={{ token: result.resetToken }}
              >
                Elegir nueva contraseña
                <KeyRound size={17} />
              </ButtonLink>
            </>
          )}
          <Link to="/restablecer-contrasena" className={s.inlineLink}>
            Ya tengo un código
          </Link>
        </div>
      ) : (
        <Form
          initialValues={{ email: "" }}
          schema={rules.forgot}
          pending={mutation.pending}
          error={mutation.error}
          submitLabel="Generar código"
          onSubmit={(values) =>
            mutation.run(async () => {
              const response = await api("/auth/forgot-password", {
                method: "POST",
                body: { email: values.email.toLowerCase() },
              });
              setResult(response.data);
            })
          }
        >
          {({ field }) =>
            field("email", "Correo electrónico", {
              type: "email",
              autoComplete: "email",
            })
          }
        </Form>
      )}
      <Link to="/ingresar" className={s.inlineLink}>
        Volver a iniciar sesión
      </Link>
    </AuthFrame>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const auth = useAuth();
  const mutation = useMutation();
  const [done, setDone] = useState(false);
  return (
    <AuthFrame
      title="Una nueva contraseña."
      description="El código es de un solo uso y tiene vencimiento."
    >
      {done ? (
        <>
          <Notice tone="success">
            Contraseña actualizada. Tus sesiones anteriores se cerraron.
          </Notice>
          <ButtonLink to="/ingresar">Iniciar sesión</ButtonLink>
        </>
      ) : (
        <Form
          initialValues={{
            token: location.state?.token || params.get("token") || "",
            password: "",
            confirmPassword: "",
          }}
          schema={rules.reset}
          pending={mutation.pending}
          error={mutation.error}
          submitLabel="Actualizar contraseña"
          onSubmit={(values) =>
            mutation.run(async () => {
              await api("/auth/reset-password", {
                method: "POST",
                body: { token: values.token, password: values.password },
              });
              auth.clear();
              setDone(true);
            })
          }
        >
          {({ field }) => (
            <>
              {field("token", "Código de recuperación", {
                autoComplete: "off",
                spellCheck: false,
              })}
              {field("password", "Nueva contraseña", {
                type: "password",
                autoComplete: "new-password",
                hint: "Entre 8 y 72 caracteres.",
              })}
              {field("confirmPassword", "Repetí la contraseña", {
                type: "password",
                autoComplete: "new-password",
              })}
            </>
          )}
        </Form>
      )}
      <Link to="/recuperar-contrasena" className={s.inlineLink}>
        Necesito un código nuevo
      </Link>
    </AuthFrame>
  );
}
