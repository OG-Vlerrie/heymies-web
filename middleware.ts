import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};


export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER || "";
  const pass = process.env.ADMIN_PASS || "";

  // If creds not set, block access (safer default)
  if (!user || !pass) {
    return new NextResponse("Admin credentials not configured", { status: 500 });
  }

  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Basic ")) {
    return unauthorized();
  }

  const base64 = auth.split(" ")[1] || "";
  let decoded = "";
  try {
    decoded = Buffer.from(base64, "base64").toString("utf8");
  } catch {
    return unauthorized();
  }

  const [u, p] = decoded.split(":");

  if (u !== user || p !== pass) {
    return unauthorized();
  }

  return NextResponse.next();
}

function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="HeyMies Admin"',
    },
  });
}
