export const es = {
  "brand.name": "Nic Wallet",
  "brand.tagline": "Mandá. Recibí. Pagá.",

  "nav.inicio": "Inicio",
  "nav.pagos": "Pagos",
  "nav.tarjeta": "Tarjeta",
  "nav.actividad": "Actividad",
  "nav.perfil": "Perfil",

  "splash.cta_signIn": "Iniciar sesión",
  "splash.cta_signUp": "Crear cuenta",
  "splash.subtitle": "La billetera de Nicaragua",

  "auth.signIn.title": "Bienvenido de vuelta",
  "auth.signIn.phoneLabel": "Número de celular",
  "auth.signIn.pinLabel": "PIN de 4 dígitos",
  "auth.signIn.submit": "Entrar",
  "auth.signUp.title": "Crear tu cuenta",

  "home.greeting": "Hola",
  "home.balance.usd": "Dólares",
  "home.balance.nio": "Córdobas",
  "home.actions.send": "Mandar",
  "home.actions.receive": "Recibir",
  "home.actions.pay": "Pagar",
  "home.actions.topup": "Recargar",
  "home.recent": "Movimientos recientes",
  "home.empty": "Aún no hay movimientos",
  "home.demoSeed": "Recibir saldo de prueba",

  "common.continue": "Continuar",
  "common.cancel": "Cancelar",
  "common.confirm": "Confirmar",
  "common.back": "Atrás",
  "common.next": "Siguiente",
  "common.done": "Listo",
  "common.loading": "Cargando…",
  "common.error": "Algo salió mal",
  "common.success": "Operación exitosa",

  "lowData.title": "Modo bajo consumo",
  "lowData.body":
    "Sin datos? Mandá saldo por SMS al +505 0092 5538. Ej.: ENVIAR 500 88123456",

  "send.title": "Mandar dinero",
  "receive.title": "Recibir",
  "pay.title": "Pagar",
  "pay.scan": "Escanear QR",
  "pay.show": "Mostrar QR",
  "bills.title": "Facturas",
  "topup.title": "Recargar celular",
  "deposit.title": "Depositar efectivo",
  "withdraw.title": "Retirar efectivo",
  "convert.title": "Convertir USD ↔ C$",

  "card.title": "Tu tarjeta",
  "card.freeze": "Congelar",
  "card.unfreeze": "Activar",
  "card.linkExternal": "Vincular tarjeta externa",

  "activity.title": "Actividad",
  "activity.filter.all": "Todas",
  "activity.filter.sent": "Enviadas",
  "activity.filter.received": "Recibidas",

  "profile.title": "Perfil",
  "profile.changePin": "Cambiar PIN",
  "profile.language": "Idioma",
  "profile.darkMode": "Modo oscuro",
  "profile.lowDataToggle": "Modo bajo consumo",
  "profile.signOut": "Cerrar sesión",
} as const;

export type DictKey = keyof typeof es;
