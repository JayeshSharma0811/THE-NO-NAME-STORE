
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  price: number;
  original_price: number | null;
  description: string | null;
  image: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  is_new: boolean | null;
  in_stock: boolean | null;
  collection_id: string | null;
};

export default function SearchPage() {
  const { addToCart } = useCart();

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          category,
          price,
          original_price,
          description,
          image,
          images,
          sizes,
          colors,
          is_new,
          in_stock,
          collection_id
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Search products error:", error);
        setProducts([]);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    loadProducts();
  }, []);

  const searchResults = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    // Nothing typed:
    // show only a small selection from Admin products
    if (!searchTerm) {
      return products.slice(0, 6);
    }

    // Search Admin products automatically
    return products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const category = product.category?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";

      return (
        name.includes(searchTerm) ||
        category.includes(searchTerm) ||
        description.includes(searchTerm)
      );
    });
  }, [query, products]);

  const handleAddToBag = (
    product: Product,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (product.in_stock === false) return;

    addToCart(product.id, {
      size: product.sizes?.[0] || undefined,
      color: product.colors?.[0] || undefined,
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <Navbar />

      {/* =========================
          SEARCH HEADER
      ========================= */}

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-8 sm:pt-16">
        <p className="text-[10px] uppercase tracking-[0.25em] text-black/40">
          Search
        </p>

        <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          Find something different.
        </h1>

        {/* SEARCH BOX */}

        <div className="mt-10 flex items-center border-b border-black">
          <span className="mr-4 text-lg text-black/40">
            ⌕
          </span>

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent py-4 text-lg outline-none placeholder:text-black/30"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="ml-4 whitespace-nowrap text-[10px] uppercase tracking-[0.15em] text-black/50 transition hover:text-black"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* =========================
          RESULTS
      ========================= */}

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              {query.trim()
                ? "Search Results"
                : "Featured Products"}
            </p>

            {!loading && (
              <p className="mt-2 text-xs text-black/45">
                {searchResults.length}{" "}
                {searchResults.length === 1
                  ? "product"
                  : "products"}
              </p>
            )}
          </div>

          {query.trim() && (
            <p className="text-xs text-black/40">
              Results for "{query}"
            </p>
          )}
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item}>
                <div className="aspect-[3/4] animate-pulse bg-[#e8e7e2]" />

                <div className="mt-4 h-3 w-20 animate-pulse bg-black/10" />

                <div className="mt-3 h-4 w-40 animate-pulse bg-black/10" />

                <div className="mt-5 h-12 animate-pulse bg-black/10" />
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          /* =========================
             PRODUCT GRID
          ========================= */

          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((product) => {
              const productImage =
                product.images?.[0] ||
                product.image ||
                "/placeholder-product.jpg";

              const discount =
                product.original_price &&
                product.original_price > product.price
                  ? Math.round(
                      ((product.original_price -
                        product.price) /
                        product.original_price) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={product.id}
                  className="group"
                >
                  {/* IMAGE */}

                  <Link
                    href={`/products/${product.slug}`}
                    className="block"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#e8e7e2]">
                      <img
                        src={productImage}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />

                      {/* NEW */}

                      {product.is_new && (
                        <span className="absolute left-3 top-3 bg-white px-3 py-2 text-[9px] uppercase tracking-[0.15em]">
                          New
                        </span>
                      )}

                      {/* DISCOUNT */}

                      {discount > 0 && (
                        <span className="absolute right-3 top-3 bg-black px-3 py-2 text-[9px] uppercase tracking-[0.15em] !text-white">
                          -{discount}%
                        </span>
                      )}

                      {/* SOLD OUT */}

                      {product.in_stock === false && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                          <span className="bg-black px-4 py-2 text-[9px] uppercase tracking-[0.15em] !text-white">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* PRODUCT INFO */}

                  <div className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.18em] text-black/40">
                          {product.category || "Collection"}
                        </p>

                        <Link
                          href={`/products/${product.slug}`}
                          className="mt-2 block text-sm font-medium transition hover:opacity-50"
                        >
                          {product.name}
                        </Link>
                      </div>

                      <div className="text-right">
                        <p className="text-sm">
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString("en-IN")}
                        </p>

                        {product.original_price &&
                          product.original_price >
                            product.price && (
                            <p className="mt-1 text-xs text-black/35 line-through">
                              ₹
                              {Number(
                                product.original_price
                              ).toLocaleString("en-IN")}
                            </p>
                          )}
                      </div>
                    </div>

                    {/* ADD TO BAG */}

                    <button
                      type="button"
                      disabled={product.in_stock === false}
                      onClick={(event) =>
                        handleAddToBag(product, event)
                      }
                      className="mt-5 flex h-12 w-full items-center justify-center border border-black bg-black px-4 text-[10px] uppercase tracking-[0.18em] !text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:border-black/20 disabled:bg-black/20"
                    >
                      {product.in_stock === false
                        ? "Sold Out"
                        : "Add to Bag"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================
             NO RESULTS
          ========================= */

          <div className="border-y border-black/10 py-24 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">
              No products found
            </p>

            <h2 className="mt-4 text-3xl tracking-[-0.04em]">
              Nothing matched your search.
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/45">
              Try another product name or category.
            </p>
          </div>
        )}
      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="border-t border-black/10 bg-[#f7f7f5]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.04em]">
              NO NAME
            </h3>

            <p className="mt-4 max-w-xs text-sm leading-6 text-black/50">
              Nothing ordinary. Everything considered.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em]">
              Explore
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-black/60">
              <Link href="/" className="transition hover:text-black">
                Home
              </Link>

              <Link href="/shop" className="transition hover:text-black">
                Shop
              </Link>

              <Link href="/search" className="transition hover:text-black">
                Search
              </Link>

              <Link href="/account" className="transition hover:text-black">
                Account
              </Link>

              <Link href="/cart" className="transition hover:text-black">
                Cart
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em]">
              Information
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-black/60">
              <Link href="#" className="transition hover:text-black">
                Shipping
              </Link>

              <Link href="#" className="transition hover:text-black">
                Returns
              </Link>

              <Link href="#" className="transition hover:text-black">
                Privacy
              </Link>

              <Link href="#" className="transition hover:text-black">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-black/10 px-5 py-6 text-center text-[10px] uppercase tracking-[0.2em] text-black/40 sm:px-8">
          © 2026 NO NAME. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

