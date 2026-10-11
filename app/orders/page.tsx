  "use client";

  import { useEffect, useState } from "react";
  import Link from "next/link";
  import { supabase } from "../lib/supabase";
  import Navbar from "../components/Navbar";

  type Order = {
    id: string | number;
    order_number?: string | null;
    customer_name?: string | null;
    email?: string | null;
    total?: number | string | null;
    amount?: number | string | null;
    status?: string | null;
    payment_status?: string | null;
    created_at?: string | null;
  };

  export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
      loadOrders();
    }, []);

    async function loadOrders() {
      setLoading(true);
      setErrorMessage("");

      try {
        // Get the currently logged-in customer
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Auth error:", userError);
          setErrorMessage("Unable to verify your account.");
          setLoading(false);
          return;
        }

        if (!user) {
          setErrorMessage("Please login to view your orders.");
          setLoading(false);
          return;
        }

        console.log("Logged-in customer:", user.id);

        // Load ONLY this customer's orders
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          console.error("Orders error:", error);
          setErrorMessage(error.message);
          setOrders([]);
          setLoading(false);
          return;
        }

        console.log("Customer orders:", data);

        setOrders((data || []) as Order[]);
      } catch (error) {
        console.error("Unexpected orders error:", error);
        setErrorMessage("Something went wrong while loading your orders.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    function getOrderNumber(order: Order) {
      return order.order_number || `#${order.id}`;
    }

    function getTotal(order: Order) {
      const value = Number(order.total ?? order.amount ?? 0);

      if (Number.isNaN(value)) {
        return "₹0";
      }

      return `₹${value.toLocaleString("en-IN")}`;
    }

    function getStatus(order: Order) {
      return order.status || "Pending";
    }

    function getStatusClasses(status: string) {
      const normalized = status.toLowerCase();

      if (
        normalized === "completed" ||
        normalized === "delivered" ||
        normalized === "paid"
      ) {
        return "bg-green-100 text-green-700";
      }

      if (
        normalized === "cancelled" ||
        normalized === "canceled" ||
        normalized === "failed"
      ) {
        return "bg-red-100 text-red-700";
      }

      if (
        normalized === "shipped" ||
        normalized === "processing"
      ) {
        return "bg-blue-100 text-blue-700";
      }

      return "bg-yellow-100 text-yellow-700";
    }

    function formatDate(date?: string | null) {
      if (!date) {
        return "-";
      }

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return date;
      }

      return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    if (loading) {
      return (
        <main className="min-h-screen bg-[#f7f7f5] text-[#111]">
          <Navbar />

          <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
            <p className="text-sm text-black/50">
              Loading your orders...
            </p>
          </section>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-[#f7f7f5] text-[#111]">
        <Navbar />

        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">

          {/* HEADER */}
          <div className="mb-10">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-black/45">
              Account
            </p>

            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-3 text-sm text-black/55">
              View your NO NAME order history.
            </p>
          </div>

          {/* ERROR */}
          {errorMessage && (
            <div className="border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-600">
                {errorMessage}
              </p>

              <Link
                href="/account"
                className="mt-5 inline-block border border-black bg-black px-6 py-3 text-sm text-white transition hover:bg-white hover:text-black"
              >
                Back to Account
              </Link>
            </div>
          )}

          {/* NO ORDERS */}
          {!errorMessage && orders.length === 0 && (
            <div className="border border-black/10 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl text-white">
                NN
              </div>

              <h2 className="mt-6 text-xl font-medium">
                No orders yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm text-black/50">
                You haven't placed an order yet. Your orders will appear here
                after checkout.
              </p>

              <Link
                href="/"
                className="mt-7 inline-block border border-black bg-white px-7 py-3 text-sm text-white transition hover:bg-white hover:text-white"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {/* ORDERS */}
          {!errorMessage && orders.length > 0 && (
            <div className="space-y-4">

              {orders.map((order) => {
                const status = getStatus(order);

                return (
                  <div
                    key={order.id}
                    className="border border-black/10 bg-white p-6 sm:p-7"
                  >
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                      {/* ORDER INFO */}
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                          Order
                        </p>

                        <p className="mt-2 text-sm font-medium">
                          {getOrderNumber(order)}
                        </p>

                        <p className="mt-2 text-sm text-black/50">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      {/* STATUS */}
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                          Status
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      {/* PAYMENT */}
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                          Payment
                        </p>

                        <p className="mt-2 text-sm">
                          {order.payment_status || "Pending"}
                        </p>
                      </div>

                      {/* TOTAL */}
                      <div className="sm:text-right">
                        <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                          Total
                        </p>

                        <p className="mt-2 text-lg font-medium">
                          {getTotal(order)}
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BACK */}
          <div className="mt-10">
            <Link
              href="/account"
              className="text-sm underline underline-offset-4"
            >
              ← Back to Account
            </Link>
          </div>

        </section>
      </main>
    );
  }

