import { NextResponse } from "next/server";
import { applyClearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  return applyClearAuthCookies(NextResponse.json({ ok: true }));
}
