"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { getCartCount } = useCart();

  const cartCount = getCartCount();

  // Close menu when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Prevent page scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f7f7f5]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8">

          {/* Left - Menu */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="group flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] transition-opacity hover:opacity-50"
            aria-label="Open menu"
          >
            <span className="relative flex h-4 w-5 flex-col justify-center gap-[5px]">
              <span className="block h-px w-5 bg-black transition-all duration-300" />
              <span className="block h-px w-3 bg-black transition-all duration-300 group-hover:w-5" />
            </span>

            <span className="hidden sm:inline">Menu</span>
          </button>

          {/* Center - Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="absolute left-1/2 -translate-x-1/2 text-[21px] font-semibold tracking-[-0.06em] sm:text-3xl"
            aria-label="NO NAME Home"
          >
            NO NAME
          </Link>

          {/* Right */}
          <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.12em] sm:gap-6">

            {/* Search */}
            <Link
              href="/search"
              onClick={closeMenu}
              className="hidden transition-opacity hover:opacity-50 sm:block"
            >
              Search
            </Link>

            {/* Account */}
            <Link
              href="/account"
              onClick={closeMenu}
              className="hidden transition-opacity hover:opacity-50 sm:block"
            >
              Account
            </Link>

            {/* Bag */}
            <Link
              href="/cart"
              onClick={closeMenu}
              className="transition-opacity hover:opacity-50"
            >
              Bag ({cartCount})
            </Link>
          </div>
        </div>
      </header>

      {/* Dark Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
          }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Slide-out Menu */}
      <aside
        className={`fixed left-0 top-0 z-[70] flex h-full w-[86%] max-w-[380px] flex-col bg-[#f7f7f5] shadow-2xl transition-transform duration-300 ease-out ${menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        aria-hidden={!menuOpen}
      >

        {/* Drawer Header */}
        <div className="flex h-[72px] items-center justify-between border-b border-black/10 px-5 sm:h-20 sm:px-8">

          <Link
            href="/"
            onClick={closeMenu}
            className="text-xl font-semibold tracking-[-0.06em]"
          >
            NO NAME
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            className="flex h-10 w-10 items-center justify-center text-2xl font-light transition-opacity hover:opacity-50"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col px-5 py-8 sm:px-8">

          <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">
            Explore
          </p>

          <Link
            href="/shop"
            onClick={closeMenu}
            className="border-b border-black/10 py-4 text-2xl tracking-[-0.03em] transition-opacity hover:opacity-50"
          >
            Shop
          </Link>

          <Link
            href="/products"
            onClick={closeMenu}
            className="border-b border-black/10 py-4 text-2xl tracking-[-0.03em] transition-opacity hover:opacity-50"
          >
            Products
          </Link>

          {/* Collections */}
          <Link
            href="/collections"
            onClick={closeMenu}
            className="flex items-center justify-between border-b border-black/10 py-4 text-2xl tracking-[-0.03em] transition-opacity hover:opacity-50"
          >
            <span>Collections</span>

            <span className="text-lg text-black/30">
              →
            </span>
          </Link>

          <Link
            href="/search"
            onClick={closeMenu}
            className="border-b border-black/10 py-4 text-2xl tracking-[-0.03em] transition-opacity hover:opacity-50"
          >
            Search
          </Link>

          <Link
            href="/account"
            onClick={closeMenu}
            className="border-b border-black/10 py-4 text-2xl tracking-[-0.03em] transition-opacity hover:opacity-50"
          >
            Account
          </Link>

          <Link
            href="/cart"
            onClick={closeMenu}
            className="border-b border-black/10 py-4 text-2xl tracking-[-0.03em] transition-opacity hover:opacity-50"
          >
            Bag
            <span className="ml-2 text-base text-black/50">
              ({cartCount})
            </span>
          </Link>

          <Link
            href="/contact"
            onClick={closeMenu}
            className="border-b border-black/10 py-4 text-2xl tracking-[-0.03em] transition-opacity hover:opacity-50"
          >
            Contact
          </Link>

          {/* Bottom */}
          <div className="mt-auto pt-8">
            <p className="text-xs leading-5 text-black/40">
              Nothing ordinary.
              <br />
              Everything considered.
            </p>
          </div>
        </nav>
      </aside>
    </>
  );
}