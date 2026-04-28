import type { DictKey } from "./es";

// Spanish is the source of truth. English fills in for high-visibility
// surfaces only — translations in progress for everything else.
export const en: Partial<Record<DictKey, string>> = {
  "brand.name": "Nic Wallet",
  "brand.tagline": "Send. Receive. Pay.",

  "nav.inicio": "Home",
  "nav.servicios": "Services",
  "nav.tarjeta": "Card",
  "nav.actividad": "Activity",
  "nav.perfil": "Profile",

  "splash.cta_signIn": "Sign in",
  "splash.cta_signUp": "Create account",
  "splash.subtitle": "Nicaragua's wallet",

  "home.greeting": "Hi",
  "home.balance.usd": "Dollars",
  "home.balance.nio": "Córdobas",
  "home.actions.send": "Send",
  "home.actions.receive": "Receive",
  "home.actions.pay": "Pay",
  "home.actions.topup": "Top up",
  "home.recent": "Recent activity",
  "home.empty": "No activity yet",
  "home.demoSeed": "Get demo balance",

  "common.continue": "Continue",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.back": "Back",
  "common.next": "Next",
  "common.done": "Done",
  "common.loading": "Loading…",
  "common.error": "Something went wrong",
  "common.success": "Success",

  "profile.title": "Profile",
  "profile.changePin": "Change PIN",
  "profile.language": "Language",
  "profile.darkMode": "Dark mode",
  "profile.signOut": "Sign out",
};
