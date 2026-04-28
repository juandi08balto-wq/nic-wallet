"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          theme="system"
          toastOptions={{
            classNames: {
              toast:
                "rounded-2xl border border-border bg-surface text-foreground shadow-lg",
            },
          }}
        />
      </I18nProvider>
    </NextThemesProvider>
  );
}
