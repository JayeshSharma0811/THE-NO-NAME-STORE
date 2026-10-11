"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  price: number | string;
  original_price: number | string | null;
  description: string | null;
  image: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  featured: boolean | null;
  is_new: boolean | null;
  in_stock: boolean | null;
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("SHOP PRODUCTS:", data);
    console.log("SHOP ERROR:", error);

    if (error) {
      console.error("Error loading shop products:", error);
      setProducts([]);
    } else {
      setProducts((data || []) as Product[]);
    }

    setLoading(false);
  }

  function getProductImage(product: Product) {
    // First priority: image column
    if (product.image && product.image.trim() !== "") {
      return product.image;
    }

    // Second priority: first image from images array
    if (
      Array.isArray(product.images) &&
      product.images.length > 0 &&
      product.images[0]
    ) {
      return product.images[0];
    }

    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <Navbar />

      {/* HEADER */}
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
        <p className="text-xs uppercase tracking-[0.2em] text-black/40">
          NO NAME
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
              Shop
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-black/60">
              Explore our curated collection of refined essentials,
              everyday pieces, and modern accessories.
            </p>
          </div>

          <p className="text-sm text-black/50">
            {loading ? "Loading..." : `${products.length} Products`}
          </p>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        {/* LOADING */}
        {loading && (
          <div className="py-20 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">
              Loading products...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && products.length === 0 && (
          <div className="border border-black/10 py-20 text-center">
            <p className="text-sm text-black/50">
              No products available.
            </p>
          </div>
        )}

        {/* PRODUCTS */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-14 lg:grid-cols-4">
            {products.map((product) => {
              const imageUrl = getProductImage(product);

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#eeeeeb]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        onError={(event) => {
                          console.error(
                            "PRODUCT IMAGE FAILED:",
                            imageUrl
                          );

                          event.currentTarget.style.display = "none";

                          const parent =
                            event.currentTarget.parentElement;

                          if (parent) {
                            const errorBox =
                              document.createElement("div");

                            errorBox.className =
                              "absolute inset-0 flex items-center justify-center";

                            errorBox.innerHTML = `
                              <span class="px-4 text-center text-[10px] uppercase tracking-[0.15em] text-black/30">
                                Image unavailable
                              </span>
                            `;

                            parent.appendChild(errorBox);
                          }
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-black/30">
                          No Image
                        </span>
                      </div>
                    )}

                    {/* NEW BADGE */}
                    {product.is_new && (
                      <span className="absolute left-3 top-3 bg-[#f7f7f5] px-2.5 py-1 text-[10px] uppercase tracking-[0.15em]">
                        New
                      </span>
                    )}

                    {/* OUT OF STOCK */}
                    {!product.in_stock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="bg-white px-4 py-2 text-xs uppercase tracking-[0.15em]">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="mt-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-sm font-medium leading-5 sm:text-base">
                        {product.name}
                      </h2>

                      <span className="shrink-0 text-xs text-black/40 sm:text-sm">
                        {product.category || ""}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-sm">
                        ₹
                        {Number(product.price).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      {product.original_price &&
                        Number(product.original_price) >
                          Number(product.price) && (
                          <p className="text-sm text-black/35 line-through">
                            ₹
                            {Number(
                              product.original_price
                            ).toLocaleString("en-IN")}
                          </p>
                        )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

