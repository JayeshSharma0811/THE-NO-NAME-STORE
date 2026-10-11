import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number | null;
  image?: string | null;
  is_new?: boolean | null;
  in_stock?: boolean | null;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;

  // Find collection
  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id, name, slug, description, image")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (collectionError || !collection) {
    notFound();
  }

  // Find products belonging to this collection
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, name, slug, price, original_price, image, is_new, in_stock"
    )
    .eq("collection_id", collection.id)
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("Collection products error:", productsError);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5]">

      {/* Header */}
      <section className="border-b border-black/10 px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">

          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-black/40 transition-colors hover:text-black"
          >
            <span>←</span>
            All Collections
          </Link>

          <div className="mt-10">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">
              Collection
            </p>

            <h1 className="text-5xl font-medium tracking-[-0.06em] sm:text-7xl">
              {collection.name}
            </h1>

            {collection.description && (
              <p className="mt-5 max-w-2xl text-sm leading-6 text-black/50 sm:text-base">
                {collection.description}
              </p>
            )}
          </div>

        </div>
      </section>

      {/* Products */}
      <section className="px-5 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                Collection Products
              </p>

              <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">
                {products?.length || 0}{" "}
                {products?.length === 1 ? "product" : "products"}
              </h2>
            </div>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">

              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-white">

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#e9e9e5]">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-black/30">
                          No Image
                        </span>
                      </div>
                    )}

                    {/* New Badge */}
                    {product.is_new && (
                      <span className="absolute left-3 top-3 bg-black px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-white">
                        New
                      </span>
                    )}

                    {/* Out of stock */}
                    {product.in_stock === false && (
                      <span className="absolute bottom-3 left-3 bg-white px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-black">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="pt-4">

                    <h3 className="text-sm font-medium tracking-[-0.01em] sm:text-base">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>

                      {product.original_price &&
                        Number(product.original_price) >
                          Number(product.price) && (
                          <span className="text-xs text-black/35 line-through">
                            ₹
                            {Number(product.original_price).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        )}
                    </div>

                  </div>
                </Link>
              ))}

            </div>
          ) : (
            <div className="border border-black/10 bg-white px-6 py-20 text-center">

              <h2 className="text-2xl font-medium tracking-[-0.04em]">
                No products yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50">
                Products assigned to the {collection.name} collection will
                appear here.
              </p>

              <Link
                href="/shop"
                className="mt-8 inline-flex bg-black px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-80"
              >
                Shop All Products
              </Link>

            </div>
          )}

        </div>
      </section>

      {/* Bottom */}
      <section className="border-t border-black/10 px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-3xl tracking-[-0.04em] sm:text-5xl">
            Nothing ordinary.
            <br />
            <span className="text-black/30">
              Everything considered.
            </span>
          </p>
        </div>
      </section>

    </main>
  );
}