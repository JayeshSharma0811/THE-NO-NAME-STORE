"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadProducts() {
    setLoading(true);
    setErrorMessage("");

    console.log("Loading products from Supabase...");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Supabase data:", data);
    console.log("Supabase error:", error);

    if (error) {
      console.error("Failed to load products:", error);
      setErrorMessage(error.message);
      setProducts([]);
      setLoading(false);
      return;
    }

    if (data) {
      setProducts(data as Product[]);
    } else {
      setProducts([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function deleteProduct(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      alert(`Failed to delete product: ${error.message}`);
      setDeletingId(null);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id)
    );

    setDeletingId(null);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/admin"
            className="text-2xl font-semibold tracking-[-0.04em]"
          >
            NO NAME
          </Link>

          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/admin"
              className="text-black/50 transition hover:text-black"
            >
              Dashboard
            </Link>

            <Link
              href="/"
              className="text-black/50 transition hover:text-black"
            >
              Store
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {/* TITLE */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">
              Catalog
            </p>

            <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
              Products
            </h1>

            <p className="mt-4 text-sm text-black/50">
              {products.length} product
              {products.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadProducts}
              disabled={loading}
              className="border border-black/20 bg-white px-5 py-3 text-sm transition hover:border-black disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <Link
              href="/admin/products/new"
              className="w-fit border border-black bg-white px-6 py-3 text-sm font-medium !text-black transition hover:bg-black hover:!text-white"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mt-8 border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              Could not load products
            </p>

            <p className="mt-2 text-sm text-red-600">
              {errorMessage}
            </p>
          </div>
        )}

        {/* PRODUCT LIST */}
        <div className="mt-10">
          {loading ? (
            <div className="border border-black/10 bg-white p-10 text-center">
              <p className="text-sm text-black/50">
                Loading products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="border border-black/10 bg-white p-12 text-center">
              <p className="text-xl font-medium">
                No products yet
              </p>

              <p className="mt-3 text-sm text-black/50">
                Add your first dropshipping product to your store.
              </p>

              <Link
                href="/admin/products/new"
                className="mt-6 inline-block bg-[#111111] px-6 py-3 text-sm text-white transition hover:opacity-80"
              >
                Add First Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto border border-black/10 bg-white">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-black/10 text-left">
                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-black/40">
                      Product
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-black/40">
                      Category
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-black/40">
                      Price
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-black/40">
                      Stock
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-black/40">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-black/40">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-black/10 last:border-b-0"
                    >
                      {/* PRODUCT */}
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden bg-[#eeeeeb]">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-black/30">
                                No image
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-medium">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-black/40">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="px-5 py-5 text-sm text-black/60">
                        {product.category || "—"}
                      </td>

                      {/* PRICE */}
                      <td className="px-5 py-5">
                        <p className="text-sm">
                          ₹
                          {Number(product.price).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        {product.original_price !== null && (
                          <p className="mt-1 text-xs text-black/35 line-through">
                            ₹
                            {Number(
                              product.original_price
                            ).toLocaleString("en-IN")}
                          </p>
                        )}
                      </td>

                      {/* STOCK */}
                      <td className="px-5 py-5">
                        {product.in_stock ? (
                          <span className="text-sm text-green-700">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-sm text-red-600">
                            Sold Out
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-5">
                        <div className="flex flex-wrap gap-2">
                          {product.featured && (
                            <span className="bg-black px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-white">
                              Featured
                            </span>
                          )}

                          {product.is_new && (
                            <span className="border border-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.1em]">
                              New
                            </span>
                          )}

                          {!product.featured && !product.is_new && (
                            <span className="text-xs text-black/30">
                              —
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="border border-black/20 px-4 py-2 text-xs transition hover:border-black"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              deleteProduct(product.id)
                            }
                            disabled={
                              deletingId === product.id
                            }
                            className="border border-red-200 px-4 py-2 text-xs text-red-600 transition hover:border-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === product.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}