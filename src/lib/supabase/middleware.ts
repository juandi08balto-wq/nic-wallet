import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/splash", "/ingresar", "/registrarse", "/sender", "/sms"];
// Paths that signed-in users should be bounced away from. /sender and /sms
// are public utilities and stay accessible to authenticated users too.
const AUTH_REDIRECT_PATHS = ["/splash", "/ingresar", "/registrarse"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Phase 1: env may not be configured yet. Bail out cleanly.
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthRedirect = AUTH_REDIRECT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!user && !isPublic && pathname !== "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/ingresar";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (pathname === "/" || isAuthRedirect)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/inicio";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
