"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SignupAccountType = "personal" | "negocio" | "";

export interface SignupState {
  account_type: SignupAccountType;
  phone: string;
  code: string;
  name: string;
  cedula: string;
  cedula_front_url: string | null;
  cedula_back_url: string | null;
  selfieDataUrl: string | null;
  pin: string;
}

const initialState: SignupState = {
  account_type: "",
  phone: "",
  code: "",
  name: "",
  cedula: "",
  cedula_front_url: null,
  cedula_back_url: null,
  selfieDataUrl: null,
  pin: "",
};

const STORAGE_KEY = "nic-wallet:signup";

interface SignupContextValue {
  state: SignupState;
  update: (patch: Partial<SignupState>) => void;
  reset: () => void;
  hydrated: boolean;
}

const SignupContext = createContext<SignupContextValue | null>(null);

export function SignupProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SignupState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as Partial<SignupState>) });
    } catch {
      // ignore parse errors — start fresh
    }
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<SignupState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // sessionStorage may be unavailable (private mode etc.)
        }
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  const value = useMemo(
    () => ({ state, update, reset, hydrated }),
    [state, update, reset, hydrated],
  );

  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>;
}

export function useSignup() {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error("useSignup must be used within SignupProvider");
  return ctx;
}
