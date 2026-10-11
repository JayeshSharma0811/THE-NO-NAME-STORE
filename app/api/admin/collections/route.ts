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

export async function GET(request: NextRequest) {
if (!isValidAdminSession(request)) {
return NextResponse.json(
{ error: "Unauthorized. Please log in again." },
{ status: 401 }
);
}

const { data, error } = await supabaseAdmin
.from("collections")
.select("*")
.order("name", { ascending: true });

if (error) {
console.error("Collections fetch failed:", error.message);

return NextResponse.json(
  { error: "Unable to load collections." },
  { status: 500 }
);


}

return NextResponse.json({ collections: data ?? [] });
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

const name = typeof body.name === "string" ? body.name.trim() : "";
const slug = typeof body.slug === "string" ? body.slug.trim() : "";
const description =
  typeof body.description === "string" && body.description.trim()
    ? body.description.trim()
    : null;
const is_active = body.is_active !== false;

if (!name || !slug) {
  return NextResponse.json(
    { error: "Collection name and slug are required." },
    { status: 400 }
  );
}

const { data, error } = await supabaseAdmin
  .from("collections")
  .insert([{ name, slug, description, is_active }])
  .select()
  .single();

if (error) {
  console.error("Collection creation failed:", error.message);

  return NextResponse.json(
    { error: "Unable to create collection. Check the database fields and configuration." },
    { status: 500 }
  );
}

return NextResponse.json({ success: true, collection: data });

} catch {
return NextResponse.json(
{ error: "Invalid request body." },
{ status: 400 }
);
}
}


export async function DELETE(request: NextRequest) {
  if (!isValidAdminSession(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in again." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const id = body.id;

    if (
      (typeof id !== "number" && typeof id !== "string") ||
      String(id).trim() === ""
    ) {
      return NextResponse.json(
        { error: "Valid collection ID is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("collections")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Delete collection failed:", error.message);

      return NextResponse.json(
        { error: "Unable to delete collection. Check whether products are linked to it." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Collection not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid delete request." },
      { status: 400 }
    );
  }
}
