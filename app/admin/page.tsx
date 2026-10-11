"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Order = {
  id: number;
  customer_name: string;
  email: string | null;
  total: number | string;
  created_at: string;
};

export default function AdminPage() {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      try {
        // PRODUCTS
        const { count: productsCount, error: productsError } =
          await supabase
            .from("products")
            .select("*", { count: "exact", head: true });

        if (productsError) {
          console.error("Products error:", productsError);
        }

        setProductCount(productsCount ?? 0);

        // ORDERS
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("id, customer_name, email, total, created_at")
          .order("created_at", { ascending: false });

        if (ordersError) {
          console.error("Orders error:", ordersError);
          setOrderCount(0);
          setCustomerCount(0);
          setRevenue(0);
          return;
        }

        const orderList = (orders ?? []) as Order[];

        setOrderCount(orderList.length);

        // UNIQUE CUSTOMERS
        const uniqueCustomers = new Set<string>();

        orderList.forEach((order) => {
          const email = order.email?.trim().toLowerCase();

          if (email) {
            uniqueCustomers.add(email);
          } else {
            uniqueCustomers.add(
              order.customer_name.trim().toLowerCase()
            );
          }
        });

        setCustomerCount(uniqueCustomers.size);

        // REVENUE
        const totalRevenue = orderList.reduce((sum, order) => {
          return sum + Number(order.total || 0);
        }, 0);

        setRevenue(totalRevenue);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-[-0.04em]"
          >
            NO NAME
          </Link>

          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/"
              className="text-black/50 transition hover:text-black"
            >
              View Store
            </Link>

            <span className="border-l border-black/10 pl-5">
              Admin
            </span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">
            NO NAME
          </p>

          <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Dashboard
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-black/60">
            Manage your products, orders, customers, and store
            operations from one place.
          </p>
        </div>

        {/* STATS */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* PRODUCTS */}
          <div className="border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Products
            </p>

            <p className="mt-4 text-4xl font-medium">
              {loading ? "..." : productCount}
            </p>

            <p className="mt-2 text-xs text-black/40">
              Total products
            </p>
          </div>

          {/* ORDERS */}
          <div className="border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Orders
            </p>

            <p className="mt-4 text-4xl font-medium">
              {loading ? "..." : orderCount}
            </p>

            <p className="mt-2 text-xs text-black/40">
              Total orders
            </p>
          </div>

          {/* CUSTOMERS */}
          <div className="border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Customers
            </p>

            <p className="mt-4 text-4xl font-medium">
              {loading ? "..." : customerCount}
            </p>

            <p className="mt-2 text-xs text-black/40">
              Unique customers
            </p>
          </div>

          {/* REVENUE */}
          <div className="border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Revenue
            </p>

            <p className="mt-4 text-4xl font-medium">
              {loading
                ? "..."
                : `₹${revenue.toLocaleString("en-IN")}`}
            </p>

            <p className="mt-2 text-xs text-black/40">
              Total order revenue
            </p>
          </div>
        </div>

        {/* MANAGEMENT */}
        <div className="mt-12">
          <h2 className="text-xl font-medium">
            Store Management
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* PRODUCTS */}
            <Link
              href="/admin/products"
              className="group border border-black/10 bg-white p-7 transition hover:border-black"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                Catalog
              </p>

              <h3 className="mt-4 text-2xl font-medium">
                Products
              </h3>

              <p className="mt-3 text-sm leading-6 text-black/50">
                Add, edit, delete and manage your store products.
              </p>

              <p className="mt-6 text-sm transition-transform group-hover:translate-x-1">
                Manage Products →
              </p>
            </Link>

            {/* ORDERS */}
            <Link
              href="/admin/orders"
              className="group border border-black/10 bg-white p-7 transition hover:border-black"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                Sales
              </p>

              <h3 className="mt-4 text-2xl font-medium">
                Orders
              </h3>

              <p className="mt-3 text-sm leading-6 text-black/50">
                View and manage customer orders and order status.
              </p>

              <p className="mt-6 text-sm transition-transform group-hover:translate-x-1">
                Manage Orders →
              </p>
            </Link>

            {/* CUSTOMERS */}
            <Link
              href="/admin/customers"
              className="group border border-black/10 bg-white p-7 transition hover:border-black"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                Users
              </p>

              <h3 className="mt-4 text-2xl font-medium">
                Customers
              </h3>

              <p className="mt-3 text-sm leading-6 text-black/50">
                View customers and their complete order history.
              </p>

              <p className="mt-6 text-sm transition-transform group-hover:translate-x-1">
                View Customers →
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

