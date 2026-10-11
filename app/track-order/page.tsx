"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

type Order = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
};

const statuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function trackOrder(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setOrder(null);

    if (!orderNumber.trim()) {
      setMessage("Please enter your order number.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/account";
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, created_at, status, payment_status, total"
      )
      .eq("user_id", user.id)
      .eq("order_number", orderNumber.trim())
      .maybeSingle();

    if (error) {
      console.error("Track order error:", error);
      setMessage(error.message);
    } else if (!data) {
      setMessage(
        "Order not found. Please check your order number."
      );
    } else {
      setOrder(data);
    }

    setLoading(false);
  }

  function getStatusIndex(status: string) {
    const normalized = status.toLowerCase();

    if (normalized === "pending") return 0;
    if (normalized === "processing") return 1;
    if (normalized === "shipped") return 2;
    if (normalized === "delivered" || normalized === "completed") {
      return 3;
    }

    return 0;
  }

  const currentStatus = order
    ? getStatusIndex(order.status)
    : -1;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f5] px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl">

          <Link
            href="/account"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            ← Back to Account
          </Link>

          {/* Header */}
          <div className="mt-7">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              Orders
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black">
              Track Order
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Enter your order number to check the latest status.
            </p>
          </div>

          {/* Search */}
          <form
            onSubmit={trackOrder}
            className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Order Number
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. NN-20260925-6324"
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm uppercase outline-none transition focus:border-black"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Checking..." : "Track Order"}
              </button>
            </div>

            {message && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {message}
              </div>
            )}
          </form>

          {/* Order Result */}
          {order && (
            <div className="mt-6 space-y-5">

              {/* Summary */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      Order
                    </p>

                    <h2 className="mt-1 text-xl font-semibold text-black">
                      {order.order_number}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs text-gray-400">
                      Total
                    </p>

                    <p className="mt-1 text-xl font-semibold text-black">
                      ₹{Number(order.total).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-black">
                  Order Status
                </h2>

                <div className="mt-8 space-y-6">
                  {statuses.map((status, index) => {
                    const completed = index <= currentStatus;
                    const active = index === currentStatus;

                    return (
                      <div
                        key={status}
                        className="flex items-start gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                              completed
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {completed ? "✓" : index + 1}
                          </div>

                          {index < statuses.length - 1 && (
                            <div
                              className={`mt-2 h-8 w-px ${
                                index < currentStatus
                                  ? "bg-black"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="pt-1">
                          <p
                            className={`text-sm font-medium ${
                              active
                                ? "text-black"
                                : completed
                                ? "text-gray-700"
                                : "text-gray-400"
                            }`}
                          >
                            {status}
                          </p>

                          {active && (
                            <p className="mt-1 text-xs text-gray-500">
                              Current order status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-black">
                  Payment
                </h2>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Payment Status
                  </span>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {order.payment_status || "Pending"}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* Help */}
          {!order && !message && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                You can find your order number in your order confirmation
                or My Orders.
              </p>

              <Link
                href="/orders"
                className="mt-3 inline-block text-sm font-medium text-black underline underline-offset-4"
              >
                View My Orders
              </Link>
            </div>
          )}

        </div>
      </main>
    </>
  );
}