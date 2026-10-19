import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "../services/api";
import { login, miPerfil } from "../services/authService";
import { getItem, removeItem, setItem } from "../storage/secureStorage";
import { Session, Usuario } from "../types/auth";

// Firma del contexto: lo que consumen los componentes vía useAuth()
type AuthContextType = {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithToken: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const SESSION_KEY = "session"; // clave usada en el almacenamiento seguro

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await getItem(SESSION_KEY);
        if (!raw) return;

        const guardada: Session = JSON.parse(raw);
        if (!guardada.token || !guardada.usuario) throw new Error("Sesion invalida");

        try {
          const usuario = await miPerfil(guardada.token);
          setSession({ token: guardada.token, usuario }); // token válido
        } catch (e) {
          const vencida = e instanceof ApiError && (e.status === 401 || e.status === 404);
          if (vencida) await removeItem(SESSION_KEY);
          else setSession(guardada);
        }
      } catch {
        await removeItem(SESSION_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const nueva = await login(email, password);
    await setItem(SESSION_KEY, JSON.stringify(nueva));
    setSession(nueva);
  }, []);

  // Login por token (usado por OAuth): valida token y carga usuario
  const signInWithToken = useCallback(async (token: string) => {
    const usuario = await miPerfil(token);
    const nueva: Session = { token, usuario };
    await setItem(SESSION_KEY, JSON.stringify(nueva));
    setSession(nueva);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!session) return;
    const usuario = await miPerfil(session.token);
    const nueva: Session = { token: session.token, usuario };
    await setItem(SESSION_KEY, JSON.stringify(nueva));
    setSession(nueva);
  }, [session]);

  // Logout: limpia storage y estado
  const signOut = useCallback(async () => {
    await removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  // Memoiza el valor para evitar renders innecesarios en consumers
  const value = useMemo(
    () => ({
      user: session?.usuario ?? null,
      token: session?.token ?? null,
      loading,
      signIn,
      signInWithToken,
      refreshUser,
      signOut,
    }),
    [session, loading, signIn, signInWithToken, refreshUser, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}