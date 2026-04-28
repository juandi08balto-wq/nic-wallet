import { SignupProvider } from "@/components/onboarding/SignupProvider";

export default function RegistrarseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SignupProvider>{children}</SignupProvider>;
}
