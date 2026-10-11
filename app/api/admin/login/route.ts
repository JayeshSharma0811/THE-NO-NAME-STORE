import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
try {
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
const secret = process.env.ADMIN_SESSION_SECRET;


if (!username || !password || !secret) {
  console.error("Admin login environment variables are missing.");
  return NextResponse.json(
    { error: "Admin login is not configured on the server." },
    { status: 500 }
  );
}

const body = await request.json();
const submittedUsername =
  typeof body.username === "string" ? body.username : "";
const submittedPassword =
  typeof body.password === "string" ? body.password : "";

if (
  submittedUsername !== username ||
  submittedPassword !== password
) {
  return NextResponse.json(
    { error: "Invalid username or password." },
    { status: 401 }
  );
}

const expires = Date.now() + 24 * 60 * 60 * 1000;
const signature = createHmac("sha256", secret)
  .update(`admin:${expires}`)
  .digest("hex");

const response = NextResponse.json({ success: true });

response.cookies.set(
  "no-name-admin-session",
  `admin:${expires}:${signature}`,
  {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  }
);

return response;


} catch {
return NextResponse.json(
{ error: "Invalid login request." },
{ status: 400 }
);
}
}
