
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseKey);
}

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function formatReview(row: {
  id: string | number;
  product_id: string | number;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}) {
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    customer_name: row.customer_name,
    rating: Number(row.rating),
    review: row.review_text,
    review_text: row.review_text,
    created_at: row.created_at,
  };
}

// GET: Load reviews for a product
export async function GET(request: NextRequest) {
  try {
    const productId =
      request.nextUrl.searchParams.get("productId") ||
      request.nextUrl.searchParams.get("product_id");

    if (!productId || productId.length > 200) {
      return errorResponse("A valid product ID is required.", 400);
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("product_reviews")
      .select(
        "id, product_id, customer_name, rating, review_text, created_at"
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Review fetch failed:", error.message);
      return errorResponse("Unable to load reviews. Check the server logs.");
    }

    return NextResponse.json({
      reviews: (data ?? []).map((row) => formatReview(row)),
    });
  } catch (error) {
    console.error("Reviews GET failed:", error);
    return errorResponse("Unable to load reviews. Check the server logs.");
  }
}

// POST: Save a customer review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Accept both camelCase and database-style field names.
    const rawProductId = body.productId ?? body.product_id;
    const rawCustomerName = body.customerName ?? body.customer_name;
    const rawReviewText =
      body.review ?? body.review_text;

    const productId =
      typeof rawProductId === "string" ||
      typeof rawProductId === "number"
        ? String(rawProductId).trim()
        : "";

    const customerName =
      typeof rawCustomerName === "string"
        ? rawCustomerName.trim()
        : "";

    const reviewText =
      typeof rawReviewText === "string"
        ? rawReviewText.trim()
        : "";

    const rating = Number(body.rating);

    if (
      !productId ||
      productId.length > 200 ||
      !customerName ||
      customerName.length > 80 ||
      !reviewText ||
      reviewText.length > 1500 ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return errorResponse(
        "Enter your name, a review, and a rating from 1 to 5.",
        400
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("product_reviews")
      .insert({
        product_id: productId,
        customer_name: customerName,
        rating,
        review_text: reviewText,
      })
      .select(
        "id, product_id, customer_name, rating, review_text, created_at"
      )
      .single();

    if (error) {
      console.error("Review insert failed:", error.message);
      return errorResponse(
        "Unable to save the review. Check Supabase permissions and server logs."
      );
    }

    return NextResponse.json(
      { review: formatReview(data) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review POST failed:", error);
    return errorResponse(
      "Unable to process the review. Check the server logs."
    );
  }
}
