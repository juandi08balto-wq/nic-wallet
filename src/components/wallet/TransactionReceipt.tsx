"use client";

import { toast } from "sonner";
import { formatMoney } from "@/lib/currency";
import { formatTxDate, formatTxTime } from "@/lib/datetime";
import type { TransactionType, TransactionWithParties } from "@/types/db";

const TYPE_LABEL: Record<TransactionType, string> = {
  send: "Transferencia",
  receive: "Transferencia recibida",
  merchant: "Compra",
  bill: "Pago de factura",
  topup: "Recarga celular",
  deposit: "Depósito en efectivo",
  withdraw: "Retiro en efectivo",
  remittance: "Remesa",
  convert: "Conversión",
  card_deposit: "Depósito con tarjeta",
  card_withdraw: "Retiro a tarjeta",
};

export interface TransactionReceiptProps {
  tx: TransactionWithParties;
  userId: string;
}

export function TransactionReceipt({ tx, userId }: TransactionReceiptProps) {
  const isSender = tx.sender_id === userId;
  const counterparty =
    tx.merchant_name ??
    (isSender ? tx.recipient?.name : tx.sender?.name) ??
    "—";
  const sign = isSender ? "−" : "+";
  const isCardTx = tx.type === "card_deposit" || tx.type === "card_withdraw";
  const isRemittance = tx.type === "remittance";
  const isStoreTx =
    !isCardTx &&
    !isRemittance &&
    (tx.type === "merchant" ||
      tx.type === "deposit" ||
      tx.type === "withdraw" ||
      tx.type === "bill" ||
      tx.type === "topup") &&
    !!tx.merchant_name;
  const counterpartyLabel = isCardTx
    ? "Tarjeta"
    : isRemittance
      ? "Remitente"
      : isStoreTx
        ? "Comercio"
        : isSender
          ? "Para"
          : "De";
  const headerLabel =
    tx.type === "card_deposit"
      ? "Depósito con tarjeta"
      : tx.type === "card_withdraw"
        ? "Retiro a tarjeta"
        : tx.type === "remittance" && tx.merchant_name
          ? `Recibiste una remesa de ${tx.merchant_name} 🇺🇸`
          : tx.type === "deposit" && tx.merchant_name
            ? `Depositaste en ${tx.merchant_name}`
            : tx.type === "withdraw" && tx.merchant_name
              ? `Retiraste de ${tx.merchant_name}`
              : tx.type === "merchant" && tx.merchant_name
                ? `Pagaste a ${tx.merchant_name}`
                : tx.type === "bill" && tx.merchant_name
                  ? `Pagaste tu factura de ${tx.merchant_name}`
                  : tx.type === "topup" && tx.merchant_name
                    ? `Recargaste con ${tx.merchant_name}`
                    : isSender
                      ? "Mandaste"
                      : "Recibiste";

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-border">
      <div className="border-b border-border pb-3 text-center">
        <p className="break-words px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {headerLabel}
        </p>
        <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-gold-dark dark:text-gold">
          {sign}
          {formatMoney(Number(tx.amount), tx.currency)}
        </p>
      </div>

      <ReceiptRow label="Estado">
        <span className="inline-flex items-center gap-1.5 text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          {tx.status === "completed"
            ? "Completado"
            : tx.status === "pending"
              ? "Pendiente"
              : tx.status === "failed"
                ? "Fallido"
                : "Cancelado"}
        </span>
      </ReceiptRow>
      <ReceiptRow label={counterpartyLabel}>{counterparty}</ReceiptRow>
      <ReceiptRow label="Tipo">{TYPE_LABEL[tx.type]}</ReceiptRow>
      {tx.message && <ReceiptRow label="Mensaje">{tx.message}</ReceiptRow>}
      <ReceiptRow label="Fecha">
        {formatTxDate(tx.created_at)} · {formatTxTime(tx.created_at)}
      </ReceiptRow>
      <ReceiptRow label="ID">
        <span className="font-mono text-[11px] text-muted-foreground">
          {tx.id.slice(0, 8).toUpperCase()}
        </span>
      </ReceiptRow>
    </div>
  );
}

function ReceiptRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{children}</span>
    </div>
  );
}

export async function copyReceipt(tx: TransactionWithParties, userId: string) {
  const isSender = tx.sender_id === userId;
  const counterpart =
    tx.merchant_name ??
    (isSender ? tx.recipient?.name : tx.sender?.name) ??
    "—";
  const lines = [
    "Recibo Nic Wallet",
    `${isSender ? "Mandaste" : "Recibiste"} ${formatMoney(Number(tx.amount), tx.currency)}`,
    `${isSender ? "Para" : "De"}: ${counterpart}`,
    tx.message ? `Mensaje: ${tx.message}` : null,
    `Estado: ${tx.status === "completed" ? "Completado" : tx.status}`,
    `Fecha: ${formatTxDate(tx.created_at)} ${formatTxTime(tx.created_at)}`,
    `ID: ${tx.id}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(lines);
      toast.success("Recibo copiado");
    } else {
      throw new Error("no clipboard");
    }
  } catch {
    toast.error("No se pudo copiar el recibo");
  }
}
