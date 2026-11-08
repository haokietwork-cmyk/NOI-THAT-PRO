import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Danh sách các route yêu cầu xác thực bắt buộc trên Cloud
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/projects",
  "/quoting",
  "/materials",
  "/settings",
  "/my-assets",
];

// Danh sách các route dành cho khách vãng lai (nếu đã đăng nhập thì tự vào dashboard)
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Nếu chưa cấu hình Supabase (Chế độ Demo / Offline), cho phép truy cập cục bộ
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "your_supabase_project_url_here"
  ) {
    if (isProtected) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Tự động làm mới session
  const { data: { user } } = await supabase.auth.getUser();

  // Đọc cookie phiên cục bộ (hỗ trợ đăng nhập SĐT xưởng mộc)
  const localSessionCookie = request.cookies.get("noithat_pro_session")?.value;
  let localUser = null;
  if (localSessionCookie) {
    try {
      localUser = JSON.parse(decodeURIComponent(localSessionCookie));
    } catch {
      localUser = null;
    }
  }

  const effectiveUser = user || localUser;

  const origin = request.nextUrl.origin;

  // 1. Kiểm tra Route bảo vệ (Protected Route)
  // Ngoại lệ: Cho phép dùng thử bóc tách (?demo=true) và khảo sát thư viện vật tư (?demo=true) mà không cần đăng nhập
  const isDemoQuoting = pathname === "/quoting" && request.nextUrl.searchParams.get("demo") === "true";
  const isDemoMaterials = pathname === "/materials" && request.nextUrl.searchParams.get("demo") === "true";
  const isDemoAllowed = isDemoQuoting || isDemoMaterials;
  if (isProtected && !effectiveUser && !isDemoAllowed) {
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("redirectTo", pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return redirectResponse;
  }

  // 2. Nếu đã đăng nhập mà truy cập trang đăng nhập/đăng ký -> chuyển sang Dashboard
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && effectiveUser) {
    return NextResponse.redirect(new URL("/dashboard", origin));
  }

  // 3. Chặn crawler/bot quét hoặc lưu cache các trang nội bộ xưởng
  if (isProtected) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
