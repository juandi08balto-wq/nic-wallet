"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { formatNicaraguanPhone } from "@/lib/auth";
import type { SendContact } from "./SendFlow";

export interface SendContactStepProps {
  contacts: SendContact[];
  onSelect: (contact: SendContact) => void;
}

export function SendContactStep({
  contacts,
  onSelect,
}: SendContactStepProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    const digits = q.replace(/\D/g, "");
    return contacts.filter((c) => {
      const name = c.name.toLowerCase();
      const tag = c.wallet_tag?.toLowerCase() ?? "";
      const phone = c.phone.toLowerCase();
      return (
        name.includes(q) ||
        tag.includes(q) ||
        (digits.length > 0 && phone.includes(digits))
      );
    });
  }, [contacts, query]);

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
        <h1 className="text-base font-semibold">Mandar</h1>
      </header>

      <div className="px-4 pt-2">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nombre, número o @usuario"
            className="pl-10"
            autoFocus
          />
        </div>
      </div>

      <ul className="flex-1 px-2 pt-3 pb-6">
        {filtered.length === 0 ? (
          <li className="py-12 text-center text-sm text-muted-foreground">
            No encontramos contactos
          </li>
        ) : (
          filtered.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c)}
                className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-surface-muted"
              >
                <div
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-700 text-base font-bold text-gold ring-1 ring-primary-800"
                >
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatNicaraguanPhone(c.phone)}
                    {c.wallet_tag ? ` · @${c.wallet_tag}` : ""}
                  </p>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
