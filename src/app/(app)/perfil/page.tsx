import { Header } from "@/components/layout/Header";

export default function PerfilPage() {
  return (
    <>
      <Header title="Perfil" />
      <div className="px-4 py-5">
        <p className="text-sm text-muted-foreground">
          Phase 12 — settings, PIN change, language, dark mode.
        </p>
      </div>
    </>
  );
}
