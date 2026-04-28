import { BottomNav } from "@/components/layout/BottomNav";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-md flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
