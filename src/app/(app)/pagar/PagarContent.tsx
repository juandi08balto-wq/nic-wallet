"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ScanMode } from "@/components/wallet/ScanMode";
import { ShowCodeMode } from "@/components/wallet/ShowCodeMode";
import { MerchantPayFlow } from "@/components/wallet/MerchantPayFlow";
import { cn } from "@/lib/utils";
import type { Balance, Profile } from "@/types/db";
import type { DemoMerchant } from "@/lib/demo/merchants";

export interface PagarContentProps {
  profile: Profile;
  balances: Balance[];
}

type Tab = "scan" | "show";

export function PagarContent({ profile, balances }: PagarContentProps) {
  const [tab, setTab] = useState<Tab>("scan");
  const [merchant, setMerchant] = useState<DemoMerchant | null>(null);

  if (merchant) {
    return (
      <MerchantPayFlow
        merchant={merchant}
        balances={balances}
        userId={profile.id}
        onClose={() => setMerchant(null)}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 px-3 py-3">
        <Link
          href="/inicio"
          aria-label="Volver"
          className="rounded-full p-2 text-foreground hover:bg-surface-muted"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-base font-semibold">Pagar</h1>
      </header>

      <div className="px-4 pt-1 pb-2">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-surface-muted p-1 ring-1 ring-border">
          <TabButton active={tab === "scan"} onClick={() => setTab("scan")}>
            Escanear
          </TabButton>
          <TabButton active={tab === "show"} onClick={() => setTab("show")}>
            Mostrar mi código
          </TabButton>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "scan" ? (
          <ScanMode key="scan" onMerchantSelect={setMerchant} />
        ) : (
          <ShowCodeMode key="show" profile={profile} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-xl py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-primary-700 text-white shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
