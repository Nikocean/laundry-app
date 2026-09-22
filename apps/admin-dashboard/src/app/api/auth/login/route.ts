import { NextResponse } from "next/server";
import { backendLogin } from "@/lib/auth/backend";
import { applyAuthCookies, applyClearAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  let email = "";
  let password = "";

  try {
    const body = (await request.json()) as { email?: string; password?: string };
    email = body.email?.trim() ?? "";
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json(
      { message: "email and password are required" },
      { status: 400 }
    );
  }

  const result = await backendLogin(email, password);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  if (result.data.user.role !== "admin") {
    return applyClearAuthCookies(
      NextResponse.json({ message: "Admin role required" }, { status: 403 })
    );
  }

  return applyAuthCookies(
    NextResponse.json({ user: result.data.user }),
    result.data.accessToken,
    result.data.refreshToken
  );
}
