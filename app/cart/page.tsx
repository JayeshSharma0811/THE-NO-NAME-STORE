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
  category: string;
  price: number;
  original_price: number | null;
  description: string | null;
  image: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  in_stock: boolean;
};

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCartProducts() {
      if (cartItems.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const productIds = [
        ...new Set(cartItems.map((item) => item.productId)),
      ];

      console.log("Cart product IDs:", productIds);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      console.log("Cart products:", data);
      console.log("Cart products error:", error);

      if (error) {
        console.error("Failed to load cart products:", error);
        setProducts([]);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    }

    loadCartProducts();
  }, [cartItems]);

  const cartProducts = useMemo(() => {
    return cartItems
      .map((item) => {
        const product = products.find(
          (product) => product.id === item.productId
        );

        if (!product) return null;

        return {
          ...item,
          product,
        };
      })
      .filter(
        (
          item
        ): item is typeof item & { product: Product } =>
          item !== null
      );
  }, [cartItems, products]);

  const subtotal = cartProducts.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  const shipping = 0;

  const total = subtotal + shipping;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-[#111]">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />

            <p className="text-xs tracking-[0.2em] text-gray-500 uppercase">
              Loading your bag
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111]">
      {/* SHIPPING BAR */}
      <div className="bg-black px-4 py-2 text-center text-[10px] tracking-[0.18em] text-white sm:text-xs">
        FREE SHIPPING ALL OVER INDIA
      </div>

      <Navbar />

      {/* HEADER */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-black/40">
            Your selection
          </p>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-6xl font-medium tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                Your Bag
              </h1>

              <p className="mt-5 text-sm text-black/50">
                {cartItems.reduce(
                  (total, item) => total + item.quantity,
                  0
                )}{" "}
                {cartItems.reduce(
                  (total, item) => total + item.quantity,
                  0
                ) === 1
                  ? "item"
                  : "items"}{" "}
                in your bag
              </p>
            </div>

            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="w-fit text-[10px] uppercase tracking-[0.18em] text-black/40 underline underline-offset-4 transition hover:text-black"
              >
                Clear Bag
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CART */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        {cartItems.length === 0 ? (
          <div className="flex min-h-[500px] flex-col items-center justify-center border-y border-black/10 px-6 text-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-black/10 bg-white text-3xl">
              ◇
            </div>

            <p className="text-xs uppercase tracking-[0.25em] text-black/40">
              Your bag is empty
            </p>

            <h2 className="mt-5 text-4xl tracking-[-0.05em] sm:text-5xl">
              Nothing here yet.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-6 text-black/50">
              Discover something different from our carefully
              curated collection.
            </p>

            <Link
              href="/shop"
              className="mt-9 bg-white px-10 py-4 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-light gray-800"
            >
              Start Shopping
            </Link>
          </div>
        ) : cartProducts.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center text-center">
            <div>
              <p className="text-sm text-gray-500">
                Loading product information...
              </p>

              <button
                onClick={clearCart}
                className="mt-5 bg-black px-6 py-3 text-xs tracking-[0.15em] text-white"
              >
                CLEAR BAG
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px] lg:gap-20">
            {/* PRODUCTS */}
            <div>
              <div className="border-t border-black/10">
                {cartProducts.map((item) => {
                  const product = item.product;

                  return (
                    <div
                      key={`${item.productId}-${item.size || ""}-${item.color || ""}`}
                      className="grid grid-cols-[100px_1fr] gap-5 border-b border-black/10 py-7 sm:grid-cols-[170px_1fr] sm:gap-8"
                    >
                      {/* IMAGE */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="group relative aspect-[3/4] overflow-hidden bg-[#e8e7e2]"
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-black/30">
                            NO IMAGE
                          </div>
                        )}
                      </Link>

                      {/* DETAILS */}
                      <div className="flex min-w-0 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[9px] uppercase tracking-[0.18em] text-black/40">
                                {product.category}
                              </p>

                              <Link
                                href={`/products/${product.slug}`}
                                className="mt-2 block text-lg leading-6 transition hover:opacity-50 sm:text-xl"
                              >
                                {product.name}
                              </Link>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-sm font-medium sm:text-base">
                                ₹
                                {(
                                  product.price *
                                  item.quantity
                                ).toLocaleString("en-IN")}
                              </p>

                              {item.quantity > 1 && (
                                <p className="mt-1 text-[10px] text-black/35">
                                  ₹
                                  {product.price.toLocaleString(
                                    "en-IN"
                                  )}{" "}
                                  each
                                </p>
                              )}
                            </div>
                          </div>

                          {/* OPTIONS */}
                          {(item.size || item.color) && (
                            <div className="mt-5 space-y-2 text-xs text-black/50">
                              {item.size && (
                                <p>
                                  Size:{" "}
                                  <span className="text-black">
                                    {item.size}
                                  </span>
                                </p>
                              )}

                              {item.color && (
                                <p>
                                  Color:{" "}
                                  <span className="text-black">
                                    {item.color}
                                  </span>
                                </p>
                              )}
                            </div>
                          )}

                          {/* STOCK */}
                          <div className="mt-4 flex items-center gap-2 text-[10px]">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${product.in_stock
                                ? "bg-green-500"
                                : "bg-red-500"
                                }`}
                            />

                            <span className="text-black/45">
                              {product.in_stock
                                ? "In stock"
                                : "Unavailable"}
                            </span>
                          </div>
                        </div>

                        {/* CONTROLS */}
                        <div className="mt-7 flex items-center justify-between">
                          <div className="flex items-center border border-black/15 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                  item.size,
                                  item.color
                                )
                              }
                              className="flex h-10 w-10 items-center justify-center text-lg transition hover:bg-black hover:text-white"
                            >
                              −
                            </button>

                            <span className="flex h-10 w-12 items-center justify-center border-x border-black/15 text-xs">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                  item.size,
                                  item.color
                                )
                              }
                              className="flex h-10 w-10 items-center justify-center text-lg transition hover:bg-black hover:text-white"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                item.productId,
                                item.size,
                                item.color
                              )
                            }
                            className="text-[10px] uppercase tracking-[0.15em] text-black/40 underline underline-offset-4 transition hover:text-black"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/shop"
                className="mt-8 inline-flex items-center justify-center bg-black px-8 py-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800"
              >
                Continue Shopping →
              </Link>
            </div>

            {/* SUMMARY */}
            <aside className="lg:sticky lg:top-8 lg:self-start">
              <div className="border border-black/10 bg-white p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                  Order summary
                </p>

                <h2 className="mt-3 text-2xl tracking-[-0.03em]">
                  Your order
                </h2>

                <div className="mt-8 space-y-5 border-b border-black/10 pb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/50">
                      Subtotal
                    </span>

                    <span>
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-black/50">
                      Shipping
                    </span>

                    <span>
                      {shipping === 0
                        ? "FREE"
                        : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-6">
                  <span className="text-sm uppercase tracking-[0.12em]">
                    Total
                  </span>

                  <span className="text-xl font-medium">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                {subtotal > 0 && subtotal < 999 && (
                  <div className="mb-5 bg-[#eeeee9] px-4 py-3 text-xs leading-5 text-black/55">
                    Add ₹
                    {(999 - subtotal).toLocaleString(
                      "en-IN"
                    )}{" "}
                    more for free shipping.
                  </div>
                )}

                {subtotal >= 999 && (
                  <div className="mb-5 bg-[#eeeee9] px-4 py-3 text-xs leading-5 text-black/55">
                    ✓ You&apos;ve unlocked free shipping.
                  </div>
                )}

                <Link
                  href="/checkout"
                  className="block w-full rounded-full bg-white px-6 py-4 text-center text-sm font-medium text-black ring-1 ring-black transition hover:bg-neutral-100"
                >
                  Proceed to Checkout →
                </Link>

                <div className="mt-6 grid grid-cols-3 border-t border-black/10 pt-6 text-center">
                  <div>
                    <p className="text-sm">✓</p>
                    <p className="mt-2 text-[8px] uppercase tracking-[0.12em] text-black/40">
                      Secure
                    </p>
                  </div>

                  <div className="border-x border-black/10">
                    <p className="text-sm">↗</p>
                    <p className="mt-2 text-[8px] uppercase tracking-[0.12em] text-black/40">
                      Fast
                    </p>
                  </div>

                  <div>
                    <p className="text-sm">○</p>
                    <p className="mt-2 text-[8px] uppercase tracking-[0.12em] text-black/40">
                      Easy Returns
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* BRAND SECTION */}
      <section className="bg-black px-6 py-24 text-white sm:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="mb-7 text-xs uppercase tracking-[0.3em] text-white/40">
            NO NAME
          </p>

          <h2 className="max-w-5xl text-5xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-8xl">
            Nothing ordinary.
            <br />
            Everything considered.
          </h2>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#f7f7f5]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.04em]">
              NO NAME
            </h3>

            <p className="mt-4 max-w-xs text-sm leading-6 text-black/50">
              Curated products. Refined choices. Made for
              modern living.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em]">
              Explore
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-black/60">
              <Link href="/">Home</Link>
              <Link href="/shop">Shop</Link>
              <Link href="/account">Account</Link>
              <Link href="/cart">Cart</Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em]">
              Information
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-black/60">
              <Link href="#">Shipping</Link>
              <Link href="#">Returns</Link>
              <Link href="#">Privacy</Link>
              <Link href="#">Contact</Link>
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