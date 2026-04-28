// Will be replaced by `supabase gen types typescript` output once migrations
// are in place. Kept as a permissive scaffold so Phase 1+ build clean.

export type Currency = "USD" | "NIO";
export type TransactionType =
  | "send"
  | "receive"
  | "merchant"
  | "bill"
  | "topup"
  | "deposit"
  | "withdraw"
  | "remittance"
  | "convert";
export type TransactionStatus = "pending" | "completed" | "failed" | "canceled";

export type AccountType = "personal" | "negocio";

export interface Profile {
  id: string;
  name: string;
  phone: string;
  cedula: string | null;
  avatar_url: string | null;
  pin: string;
  wallet_tag: string | null;
  selfie_url: string | null;
  low_data_mode: boolean;
  account_type: AccountType;
  cedula_front_url: string | null;
  cedula_back_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Balance {
  id: string;
  user_id: string;
  currency: Currency;
  amount: number;
}

export interface Transaction {
  id: string;
  sender_id: string | null;
  recipient_id: string | null;
  merchant_name: string | null;
  type: TransactionType;
  amount: number;
  currency: Currency;
  message: string | null;
  status: TransactionStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface LinkedCard {
  id: string;
  user_id: string;
  last_four: string;
  card_type: "visa" | "mastercard" | "amex" | "other";
  nickname: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface PartySummary {
  name: string;
  wallet_tag: string | null;
  avatar_url?: string | null;
}

export type TransactionWithParties = Transaction & {
  sender: PartySummary | null;
  recipient: PartySummary | null;
};

type ProfileInsert = {
  id: string;
  name: string;
  phone: string;
  pin: string;
  cedula?: string | null;
  avatar_url?: string | null;
  wallet_tag?: string | null;
  selfie_url?: string | null;
  low_data_mode?: boolean;
  created_at?: string;
  updated_at?: string;
};

type BalanceInsert = {
  id?: string;
  user_id: string;
  currency: Currency;
  amount?: number;
};

type TransactionInsert = {
  id?: string;
  sender_id?: string | null;
  recipient_id?: string | null;
  merchant_name?: string | null;
  type: TransactionType;
  amount: number;
  currency: Currency;
  message?: string | null;
  status?: TransactionStatus;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
};

type LinkedCardInsert = {
  id?: string;
  user_id: string;
  last_four: string;
  card_type: "visa" | "mastercard" | "amex" | "other";
  nickname?: string | null;
  is_default?: boolean;
  created_at?: string;
};

type NotificationInsert = {
  id?: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read?: boolean;
  created_at?: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
        Relationships: [];
      };
      balances: {
        Row: Balance;
        Insert: BalanceInsert;
        Update: Partial<BalanceInsert>;
        Relationships: [];
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: Partial<TransactionInsert>;
        Relationships: [];
      };
      linked_cards: {
        Row: LinkedCard;
        Insert: LinkedCardInsert;
        Update: Partial<LinkedCardInsert>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: Partial<NotificationInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
