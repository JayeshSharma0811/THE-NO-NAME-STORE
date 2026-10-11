import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";
import { supabase } from "../../lib/supabase";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !product) {
    console.error("Product page error:", error);
    notFound();
  }

  return <ProductDetails product={product} />;
}
