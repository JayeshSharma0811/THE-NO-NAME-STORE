
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function isValidAdminSession(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = request.cookies.get("no-name-admin-session")?.value;

  if (!secret || !token) return false;

  const parts = token.split(":");
  if (parts.length !== 3 || parts[0] !== "admin") return false;

  const expires = Number(parts[1]);
  if (!Number.isSafeInteger(expires) || expires <= Date.now()) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`admin:${expires}`)
    .digest("hex");

  const actualBuffer = Buffer.from(parts[2], "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in again." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Adjust these fields if your collections table uses different names.
    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const slug =
      typeof body.slug === "string" ? body.slug.trim() : "";

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Collection name and slug are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("collections")
      .insert([{ name, slug }])
      .select()
      .single();

    if (error) {
      console.error("Admin collection insert failed:", error.message);

      return NextResponse.json(
        { error: "Unable to create collection. Check the table fields and database configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, collection: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}