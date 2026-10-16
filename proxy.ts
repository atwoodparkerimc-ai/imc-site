import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPER_ADMIN_EMAIL = "atwoodparkerimc@gmail.com";

// Explicit paths that are ALWAYS private and require active employee login
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/safety",
  "/daily-jobs",
  "/reporting",
  "/catalog",
  "/manager",
  "/profile",
  "/subcontractor",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // 1. Allow static assets, images, Next internals, and API routes through immediately
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. AUTH REDIRECT GUARD: If the user IS logged in and tries to access /login, redirect straight to their dashboard
  if (user && pathname === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role?.toString().trim().toLowerCase() || "employee";
    if (role === "subcontractor") {
      return NextResponse.redirect(new URL("/subcontractor", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. PUBLIC PAGES: If path is NOT in protected prefixes, allow public access
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) {
    return response;
  }

  // 4. UNPROTECTED ACCESS ATTEMPT: User is not logged in and trying to access a protected route
  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 5. Retrieve user role from profiles for role-based route guards
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role?.toString().trim().toLowerCase() || "employee";
  const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  // 6. Subcontractor Isolation: Restrict subcontractors strictly to /subcontractor
  if (role === "subcontractor" && !pathname.startsWith("/subcontractor")) {
    return NextResponse.redirect(new URL("/subcontractor", request.url));
  }

  // 7. Prevent internal staff from stumbling into the isolated subcontractor route
  if (role !== "subcontractor" && pathname.startsWith("/subcontractor")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 8. Manager / Operations Portal Gate: Allow Managers, Admins, Superadmins, AND Foremen
  if (pathname.startsWith("/manager")) {
    const allowedPortalRoles = ["manager", "admin", "superadmin", "foreman"];
    const hasPortalAccess = isSuperAdmin || allowedPortalRoles.includes(role);

    if (!hasPortalAccess) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};