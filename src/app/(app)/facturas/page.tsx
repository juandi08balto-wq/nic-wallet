import { Header } from "@/components/layout/Header";

export default function FacturasPage() {
  return (
    <>
      <Header title="Facturas" />
      <div className="px-4 py-5">
        <p className="text-sm text-muted-foreground">
          Phase 7 — pagar Disnorte, ENACAL, Claro, Tigo, Cablenet, IBW.
          Recargas también van acá.
        </p>
      </div>
    </>
  );
}
