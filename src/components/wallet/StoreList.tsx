"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PARTNER_STORES, type PartnerStore } from "@/lib/demo/stores";

export interface StoreListProps {
  onSelect: (store: PartnerStore) => void;
  selectedId?: string | null;
}

export function StoreList({ onSelect, selectedId }: StoreListProps) {
  return (
    <motion.ul
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-2"
    >
      {PARTNER_STORES.map((store) => {
        const Icon = store.icon;
        const selected = store.id === selectedId;
        return (
          <li key={store.id}>
            <button
              type="button"
              onClick={() => onSelect(store)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left transition-all",
                selected
                  ? "ring-2 ring-primary-700"
                  : "ring-1 ring-border hover:ring-primary-300 active:scale-[0.99]",
              )}
            >
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold"
              >
                <Icon size={20} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{store.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {store.area}
                </p>
              </div>
              <ChevronRight
                size={18}
                className="shrink-0 text-muted-foreground"
                aria-hidden
              />
            </button>
          </li>
        );
      })}
    </motion.ul>
  );
}
