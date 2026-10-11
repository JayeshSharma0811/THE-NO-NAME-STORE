
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isValidAdminSession(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in again." },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const slug =
      typeof body.slug === "string" ? body.slug.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";
    const price = Number(body.price);

    if (!id || !name || !slug || !category || !Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "Please provide a valid product ID, name, slug, category and price." },
        { status: 400 }
      );
    }

    const originalPrice =
      body.original_price === null ||
      body.original_price === "" ||
      body.original_price === undefined
        ? null
        : Number(body.original_price);

    if (
      originalPrice !== null &&
      (!Number.isFinite(originalPrice) || originalPrice < 0)
    ) {
      return NextResponse.json(
        { error: "Original price must be a valid non-negative number." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({
        name,
        slug,
        category,
        price,
        original_price: originalPrice,
        description:
          typeof body.description === "string" && body.description.trim()
            ? body.description.trim()
            : null,
        image: typeof body.image === "string" ? body.image : null,
        images: Array.isArray(body.images) ? body.images : [],
        sizes: Array.isArray(body.sizes) ? body.sizes : [],
        colors: Array.isArray(body.colors) ? body.colors : [],
        featured: body.featured === true,
        is_new: body.is_new === true,
        in_stock: body.in_stock === true,
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Product update failed:", error.message);

      return NextResponse.json(
        { error: "Unable to update product. Check the product data and database configuration." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Product not found. No product was updated." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid product update request." },
      { status: 400 }
    );
  }
}