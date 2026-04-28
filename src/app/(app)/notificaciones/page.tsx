import { Header } from "@/components/layout/Header";

export default function NotificacionesPage() {
  return (
    <>
      <Header title="Notificaciones" />
      <div className="px-4 py-5">
        <p className="text-sm text-muted-foreground">
          Phase 13 — lista de notificaciones, marcar como leído.
        </p>
      </div>
    </>
  );
}
