"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";

type Product = {
  id: number;
  name: string;
  slug: string;
  category?: string | null;
  price: number;
  original_price?: number | null;
  description?: string | null;
  image?: string | null;
  images?: string[] | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  featured?: boolean | null;
  is_new?: boolean | null;
  in_stock?: boolean | null;
};

type ProductDetailsProps = {
  product: Product;
};

export default function ProductDetails({
  product,
}: ProductDetailsProps) {
  const router = useRouter();

  const { addToCart } = useCart();

  // =====================================================
  // PRODUCT IMAGES
  // =====================================================

  const images = useMemo(() => {
    const allImages = [
      ...(product.image ? [product.image] : []),
      ...(product.images || []),
    ];

    return [...new Set(allImages)].filter(Boolean);
  }, [product.image, product.images]);

  const [selectedImage, setSelectedImage] = useState(0);

  // =====================================================
  // PRODUCT OPTIONS
  // =====================================================

  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || ""
  );

  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || ""
  );

  // =====================================================
  // QUANTITY
  // =====================================================

  const [quantity, setQuantity] = useState(1);

  // =====================================================
  // BUTTON STATES
  // =====================================================

  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);

  // =====================================================
  // STOCK
  // =====================================================

  const isOutOfStock = product.in_stock === false;

  // =====================================================
  // DISCOUNT
  // =====================================================

  const hasDiscount =
    product.original_price != null &&
    Number(product.original_price) > Number(product.price);

  const discount = hasDiscount
    ? Math.round(
        ((Number(product.original_price) -
          Number(product.price)) /
          Number(product.original_price)) *
          100
      )
    : 0;

  // =====================================================
  // CURRENT IMAGE
  // =====================================================

  const currentImage =
    images[selectedImage] || images[0] || null;

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product.id, {
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
    }

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  // =====================================================
  // BUY NOW
  // =====================================================

  const handleBuyNow = () => {
    if (isOutOfStock) {
      return;
    }

    if (buying) {
      return;
    }

    setBuying(true);

    // Add selected product and quantity to cart
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id, {
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
    }

    /*
      IMPORTANT:

      Buy Now does NOT check whether the customer
      is logged in.

      Guest customers can directly open Checkout.

      Account creation will happen AFTER the customer
      completes the order.
    */

    setTimeout(() => {
      router.push("/checkout");
    }, 150);
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(10, current + 1)
    );
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111]">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar />

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 sm:pt-8">

        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-black/40">

          <Link
            href="/"
            className="transition hover:text-black"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/shop"
            className="transition hover:text-black"
          >
            Shop
          </Link>

          <span>/</span>

          <span className="max-w-[180px] truncate text-black/70">
            {product.name}
          </span>

        </div>

      </div>

      {/* =================================================
          PRODUCT SECTION
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-14">

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">

          {/* =================================================
              IMAGE GALLERY
          ================================================= */}

          <div>

            {/* MAIN IMAGE */}

            <div className="relative aspect-[4/5] overflow-hidden bg-[#e8e7e2]">

              {currentImage ? (

                <img
                  src={currentImage}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                />

              ) : (

                <div className="flex h-full items-center justify-center">

                  <span className="text-[9px] uppercase tracking-[0.2em] text-black/30">
                    No Image
                  </span>

                </div>

              )}

              {/* NEW BADGE */}

              {product.is_new && (

                <div className="absolute left-4 top-4 bg-white px-3 py-2">

                  <span className="text-[8px] font-medium uppercase tracking-[0.18em]">
                    New
                  </span>

                </div>

              )}

              {/* DISCOUNT BADGE */}

              {discount > 0 && (

                <div className="absolute right-4 top-4 bg-black px-3 py-2 text-white">

                  <span className="text-[8px] font-medium uppercase tracking-[0.18em]">
                    -{discount}%
                  </span>

                </div>

              )}

              {/* OUT OF STOCK */}

              {isOutOfStock && (

                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">

                  <span className="bg-black px-5 py-3 text-[9px] font-medium uppercase tracking-[0.2em] text-white">
                    Out of Stock
                  </span>

                </div>

              )}

            </div>

            {/* =================================================
                THUMBNAILS
            ================================================= */}

            {images.length > 1 && (

              <div className="mt-4 grid grid-cols-5 gap-3">

                {images.slice(0, 5).map(
                  (image, index) => (

                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(index)
                      }
                      className={`relative aspect-square overflow-hidden bg-[#e8e7e2] ${
                        selectedImage === index
                          ? "ring-1 ring-black"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >

                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                    </button>

                  )
                )}

              </div>

            )}

          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <div className="lg:sticky lg:top-28 lg:h-fit">

            {/* CATEGORY */}

            <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-black/35">
              {product.category ||
                "NO NAME COLLECTION"}
            </p>

            {/* PRODUCT NAME */}

            <h1 className="mt-4 max-w-xl text-4xl font-medium leading-[0.95] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            {/* PRICE */}

            <div className="mt-7 flex items-center gap-3">

              <span className="text-xl font-medium">
                ₹
                {Number(
                  product.price
                ).toLocaleString("en-IN")}
              </span>

              {hasDiscount && (

                <>
                  <span className="text-sm text-black/30 line-through">
                    ₹
                    {Number(
                      product.original_price
                    ).toLocaleString("en-IN")}
                  </span>

                  <span className="text-xs font-medium text-black/50">
                    {discount}% OFF
                  </span>
                </>

              )}

            </div>

            <div className="my-8 h-px bg-black/10" />

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div>

              <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.25em] text-black/35">
                Description
              </p>

              <p className="max-w-xl text-sm leading-7 text-black/55">
                {product.description ||
                  "Carefully selected by NO NAME for quality, design and everyday functionality."}
              </p>

            </div>

            {/* =================================================
                COLOR
            ================================================= */}

            {product.colors &&
              product.colors.length > 0 && (

                <div className="mt-8">

                  <div className="mb-3 flex items-center justify-between">

                    <p className="text-[9px] font-medium uppercase tracking-[0.22em]">
                      Color
                    </p>

                    <span className="text-xs text-black/40">
                      {selectedColor}
                    </span>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    {product.colors.map(
                      (color) => (

                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setSelectedColor(
                              color
                            )
                          }
                          className={`border px-4 py-3 text-xs transition ${
                            selectedColor ===
                            color
                              ? "border-black bg-black text-white"
                              : "border-black/15 bg-white hover:border-black"
                          }`}
                        >
                          {color}
                        </button>

                      )
                    )}

                  </div>

                </div>

              )}

            {/* =================================================
                SIZE
            ================================================= */}

            {product.sizes &&
              product.sizes.length > 0 && (

                <div className="mt-8">

                  <div className="mb-3 flex items-center justify-between">

                    <p className="text-[9px] font-medium uppercase tracking-[0.22em]">
                      Size
                    </p>

                    <span className="text-xs text-black/40">
                      {selectedSize}
                    </span>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    {product.sizes.map(
                      (size) => (

                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            setSelectedSize(
                              size
                            )
                          }
                          className={`min-w-14 border px-4 py-3 text-xs transition ${
                            selectedSize ===
                            size
                              ? "border-black bg-black text-white"
                              : "border-black/15 bg-white hover:border-black"
                          }`}
                        >
                          {size}
                        </button>

                      )
                    )}

                  </div>

                </div>

              )}

            {/* =================================================
                QUANTITY
            ================================================= */}

            <div className="mt-8">

              <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.22em]">
                Quantity
              </p>

              <div className="flex h-12 w-36 items-center border border-black/15 bg-white">

                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="flex h-full w-12 items-center justify-center text-lg transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>

                <span className="flex flex-1 justify-center text-sm">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= 10}
                  className="flex h-full w-12 items-center justify-center text-lg transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>

              </div>

              <p className="mt-2 text-[10px] text-black/35">
                Maximum quantity: 10
              </p>

            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="mt-8 space-y-3">

              {/* ADD TO BAG */}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex h-14 w-full items-center justify-center bg-[#111] text-[9px] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/25"
              >

                {isOutOfStock
                  ? "Out of Stock"
                  : added
                    ? "Added to Bag ✓"
                    : "Add to Bag"}

              </button>

              {/* BUY NOW */}

              {!isOutOfStock && (

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={buying}
                  className="flex h-14 w-full items-center justify-center border border-black bg-white text-[9px] font-medium uppercase tracking-[0.22em] transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {buying
                    ? "Opening..."
                    : "Buy Now"}

                </button>

              )}

              {/* VIEW BAG */}

              {added && (

                <Link
                  href="/cart"
                  className="flex h-12 items-center justify-center text-[9px] font-medium uppercase tracking-[0.2em] underline underline-offset-4"
                >
                  View Your Bag
                </Link>

              )}

            </div>

            {/* =================================================
                DELIVERY INFORMATION
            ================================================= */}

            <div className="mt-10 border-y border-black/10">

              {/* FREE SHIPPING */}

              <div className="flex gap-4 border-b border-black/10 py-5">

                <span className="text-sm">
                  ↗
                </span>

                <div>

                  <p className="text-xs font-medium">
                    Free shipping
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/45">
                    Free shipping on Your orders.
                  </p>

                </div>

              </div>

              {/* SECURE CHECKOUT */}

              <div className="flex gap-4 py-5">

                <span className="text-sm">
                  ✓
                </span>

                <div>

                  <p className="text-xs font-medium">
                    Secure checkout
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/45">
                    Securely process your order through NO NAME.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                PRODUCT DETAILS
            ================================================= */}

            <div className="mt-8">

              <details className="group border-t border-black/10">

                <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[9px] font-medium uppercase tracking-[0.2em]">

                  Product Details

                  <span className="text-lg font-light transition group-open:rotate-45">
                    +
                  </span>

                </summary>

                <div className="pb-5 text-xs leading-6 text-black/50">
                  {product.description ||
                    "This product has been carefully selected by NO NAME for its quality, design and everyday functionality."}
                </div>

              </details>

              {/* SHIPPING & RETURNS */}

              <details className="group border-t border-black/10">

                <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[9px] font-medium uppercase tracking-[0.2em]">

                  Shipping & Returns

                  <span className="text-lg font-light transition group-open:rotate-45">
                    +
                  </span>

                </summary>

                <div className="pb-5 text-xs leading-6 text-black/50">
                  Shipping availability and return eligibility are
                  determined by your order and delivery location.
                </div>

              </details>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          BRAND STATEMENT
      ================================================= */}

      <section className="bg-[#111] px-5 py-20 text-white sm:px-8 sm:py-28">

        <div className="mx-auto max-w-7xl">

          <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">
            NO NAME
          </p>

          <h2 className="mt-6 max-w-4xl text-4xl font-medium leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            Nothing ordinary.
            <br />
            Everything considered.
          </h2>

          <Link
            href="/shop"
            className="mt-10 inline-flex border border-white/25 px-7 py-3 text-[9px] uppercase tracking-[0.2em] transition hover:bg-white hover:text-black"
          >
            Continue Shopping
          </Link>

        </div>

      </section>

    </main>
  );
}

