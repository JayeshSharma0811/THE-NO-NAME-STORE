"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";
import { supabase } from "./lib/supabase";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  collection_id: string | null;
  price: number;
  original_price: number | null;
  description: string | null;
  image: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  featured: boolean | null;
  is_new: boolean | null;
  in_stock: boolean | null;
};

type Collection = {
  id: string;
  name: string;
  slug: string;
};

type Category = {
  key: string;
  name: string;
  type: "all" | "new" | "collection";
  collectionId?: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    loadHomeData();
  }, []);

  async function loadHomeData() {
    setLoading(true);

    const [productsResult, collectionsResult] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("collections")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);

    if (productsResult.error) {
      console.error("Error loading products:", productsResult.error);
      setProducts([]);
    } else {
      setProducts((productsResult.data as Product[]) || []);
    }

    if (collectionsResult.error) {
      console.error(
        "Error loading collections:",
        collectionsResult.error
      );
      setCollections([]);
    } else {
      setCollections((collectionsResult.data as Collection[]) || []);
    }

    setLoading(false);
  }

  const categories = useMemo<Category[]>(() => {
    const baseCategories: Category[] = [
      {
        key: "all",
        name: "All",
        type: "all",
      },
      {
        key: "new",
        name: "New Arrivals",
        type: "new",
      },
    ];

    const collectionCategories: Category[] = collections.map(
      (collection) => ({
        key: `collection-${collection.id}`,
        name: collection.name,
        type: "collection",
        collectionId: collection.id,
      })
    );

    return [...baseCategories, ...collectionCategories];
  }, [collections]);

  const activeCategoryName = useMemo(() => {
    const category = categories.find(
      (item) => item.key === activeCategory
    );

    return category?.name || "All";
  }, [categories, activeCategory]);

  const filteredProducts = useMemo(() => {
    const selectedCategory = categories.find(
      (category) => category.key === activeCategory
    );

    if (!selectedCategory || selectedCategory.type === "all") {
      return products;
    }

    if (selectedCategory.type === "new") {
      return products.filter(
        (product) => product.is_new === true
      );
    }

    if (
      selectedCategory.type === "collection" &&
      selectedCategory.collectionId
    ) {
      const collection = collections.find(
        (item) => item.id === selectedCategory.collectionId
      );

      if (!collection) {
        return [];
      }

      return products.filter((product) => {
        const belongsToCollection =
          product.collection_id === collection.id;

        const matchesOldCategory =
          product.category?.trim().toLowerCase() ===
          collection.name.trim().toLowerCase();

        return belongsToCollection || matchesOldCategory;
      });
    }

    return [];
  }, [
    products,
    collections,
    categories,
    activeCategory,
  ]);

  const featuredProducts = useMemo(() => {
    const featured = filteredProducts.filter(
      (product) => product.featured === true
    );

    if (featured.length > 0) {
      return featured.slice(0, 8);
    }

    return filteredProducts.slice(0, 8);
  }, [filteredProducts]);

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111]">

      {/* ANNOUNCEMENT */}

      <div className="bg-[#111] px-4 py-2.5 text-center text-[9px] font-medium uppercase tracking-[0.22em] text-white sm:text-[10px]">
        FREE SHIPPING ALL OVER INDIA
      </div>

      {/* NAVBAR */}

      <Navbar />

      {/* HERO */}

      <section className="border-b border-black/10 bg-[#f7f7f5]">

        <div className="mx-auto grid max-w-[1600px] md:grid-cols-[0.9fr_1.1fr]">

          <div className="flex min-h-[570px] flex-col justify-between px-6 py-10 text-[#111] sm:px-10 sm:py-14 lg:min-h-[720px] lg:px-16 lg:py-16">

            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-black/40 sm:text-[10px]">
                द NO NAME / 2026
              </p>
            </div>

            <div>

              <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.28em] text-black/45">
                Nothing Ordinary.
              </p>

              <h1 className="max-w-[700px] text-[58px] font-medium leading-[0.86] tracking-[-0.07em] text-[#111] sm:text-[76px] lg:text-[100px]">
                Discover
                <br />
                what&apos;s
                <br />
                different.
              </h1>

              <p className="mt-8 max-w-md text-sm leading-6 text-black/50 sm:text-base sm:leading-7">
                Curated products. Refined choices. Made for modern living.
              </p>

              <Link
                href="/shop"
                className="group mt-9 inline-flex items-center gap-5 bg-[#111] px-7 py-4 text-[9px] font-medium uppercase tracking-[0.22em] !text-white no-underline transition-all duration-300 hover:bg-black hover:!text-white"
              >
                <span className="!text-white">
                  Shop Collection
                </span>

                <span className="text-base leading-none !text-white transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

            </div>

            <div className="hidden text-[9px] uppercase tracking-[0.2em] text-black/30 sm:block">
              Scroll to explore
            </div>

          </div>

          {/* HERO IMAGE */}

          <div className="relative min-h-[480px] overflow-hidden bg-[#deddd8] sm:min-h-[600px] lg:min-h-[720px]">

            <Image
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=90"
              alt="NO NAME collection"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-[1500ms] hover:scale-[1.025]"
            />

            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between sm:inset-x-7 sm:bottom-7">

              <div className="bg-white/95 px-5 py-4 backdrop-blur-md">

                <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-black/40">
                  Collection 01
                </p>

                <p className="mt-1 text-sm text-black">
                  The Everyday Edit
                </p>

              </div>

              <span className="hidden bg-black/90 px-4 py-3 text-[8px] uppercase tracking-[0.2em] text-white sm:block">
                Explore
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* DYNAMIC COLLECTION BAR */}

      <section className="sticky top-[72px] z-30 border-b border-black/10 bg-[#f7f7f5]/95 backdrop-blur-md sm:top-20">

        <div className="mx-auto flex max-w-7xl gap-7 overflow-x-auto px-5 pb-4 pt-7">

          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveCategory(category.key)}
              className={`relative shrink-0 pb-1 text-[9px] font-medium uppercase tracking-[0.2em] transition-colors sm:text-[10px] ${activeCategory === category.key
                  ? "text-black"
                  : "text-black/35 hover:text-black"
                }`}
            >
              {category.name}

              {activeCategory === category.key && (
                <span className="absolute bottom-0 left-0 h-px w-full bg-black" />
              )}
            </button>
          ))}

        </div>

      </section>

      {/* PRODUCT SECTION */}

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:py-32">

        <div className="mb-10 flex items-end justify-between sm:mb-14">

          <div>

            <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.28em] text-black/35">
              NO NAME COLLECTION
            </p>

            <h2 className="text-4xl font-medium tracking-[-0.06em] sm:text-5xl lg:text-6xl">
              {activeCategoryName}
            </h2>

          </div>

          <Link
            href="/shop"
            className="hidden text-[9px] font-medium uppercase tracking-[0.2em] text-black underline underline-offset-[6px] transition-opacity hover:opacity-50 sm:block"
          >
            View all
          </Link>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-4 sm:gap-x-5">

            {[1, 2, 3, 4].map((item) => (
              <div key={item}>

                <div className="aspect-[3/4] animate-pulse bg-black/5" />

                <div className="mt-4 h-2.5 w-16 animate-pulse bg-black/5" />

                <div className="mt-3 h-4 w-28 animate-pulse bg-black/5" />

              </div>
            ))}

          </div>
        )}

        {/* EMPTY DATABASE */}

        {!loading && products.length === 0 && (
          <div className="border border-black/10 px-6 py-28 text-center">

            <p className="text-[9px] uppercase tracking-[0.2em] text-black/35">
              No products found
            </p>

            <p className="mt-3 text-sm text-black/45">
              Add products to your Supabase products table.
            </p>

          </div>
        )}

        {/* CATEGORY EMPTY */}

        {!loading &&
          products.length > 0 &&
          featuredProducts.length === 0 && (
            <div className="border border-black/10 px-6 py-28 text-center">

              <p className="text-[9px] uppercase tracking-[0.2em] text-black/35">
                Nothing here yet
              </p>

              <p className="mt-3 text-sm text-black/45">
                Add products to this collection from the Admin Panel.
              </p>

              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="mt-6 bg-[#111] px-6 py-3 text-[9px] uppercase tracking-[0.2em] !text-white transition hover:bg-black"
              >
                View all products
              </button>

            </div>
          )}

        {/* PRODUCT GRID */}

        {!loading && featuredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 lg:grid-cols-4">

            {featuredProducts.map((product) => {

              const hasDiscount =
                product.original_price &&
                Number(product.original_price) > Number(product.price);

              const discount = hasDiscount
                ? Math.round(
                  ((Number(product.original_price) -
                    Number(product.price)) /
                    Number(product.original_price)) *
                  100
                )
                : 0;

              return (
                <Link
                  href={`/products/${product.slug}`}
                  key={product.id}
                  className="group block text-[#111] no-underline"
                >

                  {/* PRODUCT IMAGE */}

                  <div className="relative aspect-[3/4] overflow-hidden bg-[#e8e7e2]">

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-[8px] uppercase tracking-[0.18em] text-black/25">
                          No Image
                        </span>
                      </div>
                    )}

                    {product.is_new && (
                      <div className="absolute left-3 top-3 bg-white px-2.5 py-1.5">
                        <span className="text-[8px] font-medium uppercase tracking-[0.16em] text-black">
                          New
                        </span>
                      </div>
                    )}

                    {discount > 0 && (
                      <div className="absolute right-3 top-3 bg-[#111] px-2.5 py-1.5 !text-white">
                        <span className="text-[8px] font-medium uppercase tracking-[0.16em] !text-white">
                          -{discount}%
                        </span>
                      </div>
                    )}

                  </div>

                  {/* PRODUCT INFO */}

                  <div className="pt-4">

                    <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-black/35">
                      {product.category || "Collection"}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-sm leading-5 text-black">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">

                      <span className="text-sm font-medium text-black">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>

                      {hasDiscount && (
                        <span className="text-xs text-black/30 line-through">
                          ₹
                          {Number(product.original_price).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}

                    </div>

                  </div>

                </Link>
              );
            })}

          </div>
        )}

        {/* MOBILE VIEW ALL */}

        {!loading && featuredProducts.length > 0 && (
          <div className="mt-14 text-center sm:hidden">

            <Link
              href="/shop"
              className="group inline-flex items-center gap-4 border border-black bg-transparent px-7 py-3 text-[9px] font-medium uppercase tracking-[0.2em] !text-black no-underline transition-all duration-300 hover:bg-black hover:!text-white"
            >
              <span className="!text-black group-hover:!text-white">
                View all products
              </span>

              <span className="!text-black transition-transform duration-300 group-hover:translate-x-1 group-hover:!text-white">
                →
              </span>
            </Link>

          </div>
        )}

      </section>

      {/* EDITORIAL BANNER */}

      <section className="border-y border-black/10 bg-[#e8e7e2]">

        <div className="mx-auto grid max-w-[1600px] md:grid-cols-2">

          <div className="relative min-h-[420px] overflow-hidden sm:min-h-[550px]">

            <Image
              src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85"
              alt="NO NAME editorial"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-[1200ms] hover:scale-[1.025]"
            />

          </div>

          <div className="flex min-h-[420px] flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">

            <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-black/40">
              The NO NAME edit
            </p>

            <h2 className="mt-5 max-w-lg text-5xl font-medium leading-[0.9] tracking-[-0.065em] text-black sm:text-6xl lg:text-7xl">
              Less noise.
              <br />
              More choice.
            </h2>

            <p className="mt-7 max-w-md text-sm leading-6 text-black/50">
              We search for pieces worth keeping — products chosen for
              quality, usefulness and everyday appeal.
            </p>

            <Link
              href="/shop"
              className="group mt-9 inline-flex w-fit items-center gap-4 border border-black bg-transparent px-7 py-3 text-[9px] font-medium uppercase tracking-[0.2em] !text-black no-underline transition-all duration-300 hover:bg-black hover:!text-white"
            >
              <span className="!text-black group-hover:!text-white">
                Explore the edit
              </span>

              <span className="!text-black transition-transform duration-300 group-hover:translate-x-1 group-hover:!text-white">
                →
              </span>
            </Link>

          </div>

        </div>

      </section>

      {/* BRAND STATEMENT */}

      <section className="bg-[#111] px-6 py-24 text-white sm:px-10 lg:py-36">

        <div className="mx-auto max-w-7xl">

          <p className="mb-8 text-[9px] font-medium uppercase tracking-[0.3em] !text-white/40">
            द NO NAME
          </p>

          <h2 className="max-w-6xl text-5xl font-medium leading-[0.9] tracking-[-0.065em] !text-white sm:text-6xl lg:text-[92px]">
            Nothing ordinary.
            <br />
            Everything considered.
          </h2>

          <div className="mt-10 flex flex-col justify-between gap-8 sm:flex-row sm:items-end">

            <p className="max-w-lg text-sm leading-7 !text-white/60 sm:text-base">
              Great products don&apos;t need to shout. They simply need to be
              thoughtfully chosen.
            </p>

            <Link
              href="/about"
              className="group inline-flex w-fit items-center gap-4 border border-white/30 bg-transparent px-7 py-3 text-[9px] font-medium uppercase tracking-[0.2em] !text-white no-underline transition-all duration-300 hover:bg-white hover:!text-black"
            >
              <span className="!text-white group-hover:!text-black">
                About NO NAME
              </span>

              <span className="!text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:!text-black">
                →
              </span>
            </Link>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="bg-[#f7f7f5]">

        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-3 lg:py-20">

          <div>

            <h3 className="text-2xl font-semibold tracking-[-0.05em] text-black">
              द NO NAME
            </h3>

            <p className="mt-4 max-w-xs text-sm leading-6 text-black/45">
              Curated products. Refined choices. Made for modern living.
            </p>

          </div>

          <div>

            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-black">
              Explore
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-black/50">

              <Link
                href="/shop"
                className="transition-colors hover:text-black"
              >
                Shop
              </Link>

              <Link
                href="/products"
                className="transition-colors hover:text-black"
              >
                Products
              </Link>

              <Link
                href="/account"
                className="transition-colors hover:text-black"
              >
                Account
              </Link>

              <Link
                href="/cart"
                className="transition-colors hover:text-black"
              >
                Cart
              </Link>

            </div>

          </div>

          <div>

            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-black">
              Information
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-black/50">

              <Link
                href="/about"
                className="transition-colors hover:text-black"
              >
                About
              </Link>

              <Link
                href="#"
                className="transition-colors hover:text-black"
              >
                Shipping
              </Link>

              <Link
                href="#"
                className="transition-colors hover:text-black"
              >
                Returns
              </Link>

              <Link
                href="/contact"
                className="transition-opacity hover:opacity-50"
              >
                Contact
              </Link>

            </div>

          </div>

        </div>

        <div className="border-t border-black/10 px-5 py-6 text-center text-[8px] uppercase tracking-[0.2em] text-black/30 sm:px-8">
          © 2026 NO NAME. All rights reserved.
        </div>

      </footer>

    </main>
  );
}