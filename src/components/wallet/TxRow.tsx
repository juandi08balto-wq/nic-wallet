import {
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  Receipt,
  Smartphone,
  Banknote,
  Globe,
  Repeat,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { formatTxDate } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type {
  TransactionType,
  TransactionWithParties,
} from "@/types/db";

const ICONS: Record<TransactionType, LucideIcon> = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  merchant: ShoppingBag,
  bill: Receipt,
  topup: Smartphone,
  deposit: Banknote,
  withdraw: Banknote,
  remittance: Globe,
  convert: Repeat,
  card_deposit: CreditCard,
  card_withdraw: CreditCard,
};

const TYPE_COLORS: Record<TransactionType, string> = {
  send: "bg-coral/15 text-coral-dark",
  receive: "bg-success/15 text-success",
  merchant: "bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold",
  bill: "bg-warning/15 text-warning",
  topup: "bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold",
  deposit: "bg-success/15 text-success",
  withdraw: "bg-coral/15 text-coral-dark",
  remittance: "bg-gold/20 text-gold-dark dark:text-gold",
  convert: "bg-gold/20 text-gold-dark dark:text-gold",
  card_deposit: "bg-success/15 text-success",
  card_withdraw: "bg-coral/15 text-coral-dark",
};

export interface TxRowProps {
  tx: TransactionWithParties;
  userId: string;
}

export function TxRow({ tx, userId }: TxRowProps) {
  const isSender = tx.sender_id === userId;
  const Icon = ICONS[tx.type];
  const counterparty =
    tx.type === "remittance" && tx.merchant_name
      ? `Remesa · ${tx.merchant_name}`
      : (tx.merchant_name ??
        (isSender ? tx.recipient?.name : tx.sender?.name) ??
        "—");
  const sign = isSender ? "−" : "+";
  const amountColor = isSender ? "text-foreground" : "text-success";

  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          TYPE_COLORS[tx.type],
        )}
        aria-hidden
      >
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{counterparty}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatTxDate(tx.created_at)}
          {tx.message ? ` · ${tx.message}` : ""}
        </p>
      </div>
      <p
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          amountColor,
        )}
      >
        {sign}
        {formatMoney(Number(tx.amount), tx.currency)}
      </p>
    </div>
  );
}
