"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  total: number | string;
  status: string;
  created_at: string;
};

type Customer = {
  key: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  orders: number;
  spent: number;
  lastOrder: string;
  lastOrderNumber: string;
  status: string;
};

export default function CustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          customer_name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          total,
          status,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Customers orders error:", error);
        setError(error.message);
        setOrders([]);
      } else {
        setOrders((data ?? []) as Order[]);
      }

      setLoading(false);
    }

    loadOrders();
  }, []);

  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      const email = order.email?.trim().toLowerCase();

      const key =
        email ||
        `${order.customer_name.trim().toLowerCase()}-${order.phone || ""}`;

      const existing = customerMap.get(key);

      if (existing) {
        existing.orders += 1;
        existing.spent += Number(order.total || 0);

        // Orders are already newest first.
        // Therefore existing lastOrder remains the newest.
      } else {
        customerMap.set(key, {
          key,
          name: order.customer_name || "Unknown Customer",
          email: order.email || "—",
          phone: order.phone || "—",
          address: [
            order.address,
            order.city,
            order.state,
            order.pincode,
          ]
            .filter(Boolean)
            .join(", ") || "—",
          orders: 1,
          spent: Number(order.total || 0),
          lastOrder: order.created_at,
          lastOrderNumber: order.order_number,
          status: order.status || "Pending",
        });
      }
    });

    return Array.from(customerMap.values());
  }, [orders]);

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
        {/* TITLE */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">
            NO NAME
          </p>

          <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Customers
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-black/60">
            View customers, contact information, orders, addresses,
            and total spending.
          </p>
        </div>

        {/* SUMMARY */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Customers
            </p>

            <p className="mt-3 text-3xl font-medium">
              {loading ? "..." : customers.length}
            </p>

            <p className="mt-2 text-xs text-black/40">
              Unique customers
            </p>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Orders
            </p>

            <p className="mt-3 text-3xl font-medium">
              {loading ? "..." : orders.length}
            </p>

            <p className="mt-2 text-xs text-black/40">
              Total orders
            </p>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Revenue
            </p>

            <p className="mt-3 text-3xl font-medium">
              {loading
                ? "..."
                : `₹${orders
                    .reduce(
                      (sum, order) =>
                        sum + Number(order.total || 0),
                      0
                    )
                    .toLocaleString("en-IN")}`}
            </p>

            <p className="mt-2 text-xs text-black/40">
              Total customer spending
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-8 border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-medium">
              Could not load customers
            </p>

            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* CUSTOMER TABLE */}
        <div className="mt-10 overflow-hidden border border-black/10 bg-white">
          <div className="border-b border-black/10 px-6 py-5">
            <h2 className="text-lg font-medium">
              Customer List
            </h2>

            <p className="mt-1 text-sm text-black/50">
              Customers are automatically created from successful
              orders.
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-black/50">
              Loading customers...
            </div>
          ) : customers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-medium">
                No customers yet
              </p>

              <p className="mt-2 text-sm text-black/50">
                Customers will appear here after their first order.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead>
                  <tr className="border-b border-black/10 bg-[#fafafa] text-xs uppercase tracking-[0.12em] text-black/40">
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4">Orders</th>
                    <th className="px-6 py-4">Total Spent</th>
                    <th className="px-6 py-4">Last Order</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.key}
                      className="border-b border-black/10 last:border-0"
                    >
                      {/* CUSTOMER */}
                      <td className="px-6 py-5 align-top">
                        <p className="font-medium">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {customer.lastOrderNumber}
                        </p>
                      </td>

                      {/* CONTACT */}
                      <td className="px-6 py-5 align-top">
                        <p className="text-sm">
                          {customer.email}
                        </p>

                        <p className="mt-1 text-sm text-black/50">
                          {customer.phone}
                        </p>
                      </td>

                      {/* ADDRESS */}
                      <td className="max-w-[260px] px-6 py-5 align-top">
                        <p className="text-sm leading-6 text-black/60">
                          {customer.address}
                        </p>
                      </td>

                      {/* ORDERS */}
                      <td className="px-6 py-5 align-top">
                        <span className="inline-flex min-w-8 items-center justify-center border border-black/10 px-2 py-1 text-sm">
                          {customer.orders}
                        </span>
                      </td>

                      {/* SPENT */}
                      <td className="px-6 py-5 align-top">
                        <p className="font-medium">
                          ₹
                          {customer.spent.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </td>

                      {/* LAST ORDER */}
                      <td className="px-6 py-5 align-top">
                        <p className="text-sm">
                          {new Date(
                            customer.lastOrder
                          ).toLocaleDateString("en-IN")}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5 align-top">
                        <span className="inline-flex border border-black/10 px-3 py-1 text-xs">
                          {customer.status}
                        </span>
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
