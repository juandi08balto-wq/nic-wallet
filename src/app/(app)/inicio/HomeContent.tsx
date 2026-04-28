"use client";

import { HomeHeader } from "@/components/layout/HomeHeader";
import { LowDataBanner } from "@/components/layout/LowDataBanner";
import { BalanceCards } from "@/components/wallet/BalanceCards";
import { QuickActions } from "@/components/wallet/QuickActions";
import { RecentTransactions } from "@/components/wallet/RecentTransactions";
import { DemoSeedCard } from "@/components/wallet/DemoSeedCard";
import type { Profile, Balance, TransactionWithParties } from "@/types/db";

export interface HomeContentProps {
  userId: string;
  profile: Profile;
  balances: Balance[];
  transactions: TransactionWithParties[];
  unreadCount: number;
}

export function HomeContent({
  userId,
  profile,
  balances,
  transactions,
  unreadCount,
}: HomeContentProps) {
  const total = balances.reduce((sum, b) => sum + Number(b.amount), 0);
  const isEmpty = total === 0;

  return (
    <div className="flex flex-col">
      <HomeHeader name={profile.name} unreadCount={unreadCount} />
      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        {profile.low_data_mode && <LowDataBanner />}
        <BalanceCards balances={balances} />
        {isEmpty && <DemoSeedCard />}
        <QuickActions />
        <RecentTransactions transactions={transactions} userId={userId} />
      </div>
    </div>
  );
}
