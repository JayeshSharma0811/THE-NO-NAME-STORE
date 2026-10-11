"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Order = {
  id: string | number;
  order_number?: string | null;
  customer_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  total?: number | string | null;
  amount?: number | string | null;
  status?: string | null;
  payment_status?: string | null;
  created_at?: string | null;
};

type FilterType =
  | "all"
  | "pending"
  | "completed";

type SupabaseErrorLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

function getErrorMessage(error: unknown) {
  if (!error) {
    return "Unknown Supabase error";
  }

  if (typeof error === "string") {
    return error;
  }

  const supabaseError =
    error as SupabaseErrorLike;

  const parts = [
    supabaseError.message,
    supabaseError.details,
    supabaseError.hint,
    supabaseError.code
      ? `Code: ${supabaseError.code}`
      : "",
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(" | ")
    : JSON.stringify(error);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | number | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<FilterType>("all");

  const [selectedDate, setSelectedDate] =
    useState("");

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  async function loadOrders() {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      console.log(
        "Admin Orders data:",
        data
      );

      console.log(
        "Admin Orders error:",
        error
      );

      if (error) {
        console.error(
          "Failed to load orders:",
          error
        );

        setErrorMessage(
          getErrorMessage(error)
        );

        setOrders([]);
      } else {
        setOrders(
          (data || []) as Order[]
        );
      }
    } catch (error) {
      console.error(
        "Unexpected orders loading error:",
        error
      );

      setErrorMessage(
        getErrorMessage(error)
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // =====================================================
  // CUSTOMER NAME
  // =====================================================

  function getCustomerName(
    order: Order
  ) {
    return (
      order.customer_name ||
      order.name ||
      order.email ||
      "Guest Customer"
    );
  }

  // =====================================================
  // ORDER NUMBER
  // =====================================================

  function getOrderNumber(
    order: Order
  ) {
    return (
      order.order_number ||
      `#${order.id}`
    );
  }

  // =====================================================
  // TOTAL
  // =====================================================

  function getTotalValue(
    order: Order
  ) {
    const value = Number(
      order.total ??
        order.amount ??
        0
    );

    if (Number.isNaN(value)) {
      return 0;
    }

    return value;
  }

  function getTotal(
    order: Order
  ) {
    return `₹${getTotalValue(
      order
    ).toLocaleString("en-IN")}`;
  }

  // =====================================================
  // STATUS
  // =====================================================

  function getStatus(
    order: Order
  ) {
    return (
      order.status ||
      "Pending"
    );
  }

  function isCompleted(
    order: Order
  ) {
    const status =
      getStatus(order)
        .toLowerCase();

    return (
      status === "completed" ||
      status === "delivered" ||
      status === "paid"
    );
  }

  function isPending(
    order: Order
  ) {
    const status =
      getStatus(order)
        .toLowerCase();

    return (
      status === "pending" ||
      status === "processing" ||
      status === "confirmed"
    );
  }

  // =====================================================
  // STATUS COLORS
  // =====================================================

  function getStatusClasses(
    status: string
  ) {
    const normalized =
      status.toLowerCase();

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

  // =====================================================
  // PAYMENT COLORS
  // =====================================================

  function getPaymentClasses(
    paymentStatus: string
  ) {
    const normalized =
      paymentStatus
        .trim()
        .toLowerCase();

    if (normalized === "paid") {
      return "bg-green-100 text-green-700";
    }

    if (
      normalized === "failed" ||
      normalized === "refunded"
    ) {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    date:
      | string
      | null
      | undefined
  ) {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // =====================================================
  // DATE FILTER
  // =====================================================

  function getDateValue(
    date:
      | string
      | null
      | undefined
  ) {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    const year =
      parsedDate.getFullYear();

    const month = String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      parsedDate.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  async function updateOrderStatus(
    order: Order,
    newStatus: string
  ) {
    const currentStatus =
      getStatus(order);

    if (
      currentStatus.toLowerCase() ===
      newStatus.toLowerCase()
    ) {
      return;
    }

    setUpdatingOrderId(
      order.id
    );

    setErrorMessage("");

    try {
      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .update({
          status: newStatus,
        })
        .eq("id", order.id)
        .select()
        .single();

      if (error) {
        console.error(
          "Status update error:",
          error
        );

        setErrorMessage(
          `Could not update order status: ${getErrorMessage(
            error
          )}`
        );

        return;
      }

      console.log(
        "Order status updated:",
        data
      );

      setOrders(
        (currentOrders) =>
          currentOrders.map(
            (currentOrder) =>
              currentOrder.id ===
              order.id
                ? {
                    ...currentOrder,
                    status: newStatus,
                  }
                : currentOrder
          )
      );
    } catch (error) {
      console.error(
        "Unexpected status update error:",
        error
      );

      setErrorMessage(
        `Could not update order status: ${getErrorMessage(
          error
        )}`
      );
    } finally {
      setUpdatingOrderId(
        null
      );
    }
  }

  // =====================================================
  // UPDATE PAYMENT STATUS
  // =====================================================

  async function updatePaymentStatus(
    order: Order,
    newPaymentStatus: string
  ) {
    const currentPayment =
      order.payment_status ||
      "Pending";

    if (
      currentPayment.toLowerCase() ===
      newPaymentStatus.toLowerCase()
    ) {
      return;
    }

    setUpdatingOrderId(
      order.id
    );

    setErrorMessage("");

    try {
      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .update({
          payment_status:
            newPaymentStatus,
        })
        .eq("id", order.id)
        .select()
        .single();

      if (error) {
        console.error(
          "Payment update error:",
          error
        );

        setErrorMessage(
          `Could not update payment status: ${getErrorMessage(
            error
          )}`
        );

        return;
      }

      console.log(
        "Payment status updated:",
        data
      );

      setOrders(
        (currentOrders) =>
          currentOrders.map(
            (currentOrder) =>
              currentOrder.id ===
              order.id
                ? {
                    ...currentOrder,
                    payment_status:
                      newPaymentStatus,
                  }
                : currentOrder
          )
      );
    } catch (error) {
      console.error(
        "Unexpected payment update error:",
        error
      );

      setErrorMessage(
        `Could not update payment status: ${getErrorMessage(
          error
        )}`
      );
    } finally {
      setUpdatingOrderId(
        null
      );
    }
  }

  // =====================================================
  // FILTER ORDERS
  // =====================================================

  const filteredOrders =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          if (searchText) {
            const searchableText = [
              getCustomerName(
                order
              ),
              order.email || "",
              order.phone || "",
              getOrderNumber(
                order
              ),
              order.id.toString(),
            ]
              .join(" ")
              .toLowerCase();

            if (
              !searchableText.includes(
                searchText
              )
            ) {
              return false;
            }
          }

          if (
            statusFilter ===
            "pending"
          ) {
            if (
              !isPending(order)
            ) {
              return false;
            }
          }

          if (
            statusFilter ===
            "completed"
          ) {
            if (
              !isCompleted(order)
            ) {
              return false;
            }
          }

          if (selectedDate) {
            if (
              getDateValue(
                order.created_at
              ) !==
              selectedDate
            ) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      orders,
      search,
      statusFilter,
      selectedDate,
    ]);

  // =====================================================
  // STATS
  // =====================================================

  const totalOrders =
    filteredOrders.length;

  const pendingOrders =
    filteredOrders.filter(
      (order) =>
        isPending(order)
    ).length;

  const completedOrders =
    filteredOrders.filter(
      (order) =>
        isCompleted(order)
    ).length;

  const filteredRevenue =
    filteredOrders.reduce(
      (sum, order) =>
        sum +
        getTotalValue(order),
      0
    );

  // =====================================================
  // RESET FILTERS
  // =====================================================

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setSelectedDate("");
  }

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    selectedDate !== "";

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111]">

      {/* HEADER */}

      <header className="border-b border-black/10 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>

            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-500">
              NO NAME
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Orders
            </h1>

          </div>

          <div className="flex items-center gap-3">

            <Link
              href="/admin"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm transition hover:border-black/30"
            >
              Dashboard
            </Link>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="rounded-full bg-black px-4 py-2 text-sm text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-6 py-8">

        {/* ERROR */}

        {errorMessage && (
          <div className="mb-8 border border-red-200 bg-red-50 p-5">

            <p className="font-semibold text-red-700">
              Orders Error
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-red-600">
              {errorMessage}
            </p>

          </div>
        )}

        {/* FILTER BOX */}

        <div className="mb-8 rounded-2xl border border-black/10 bg-white p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

            <div className="flex-1">

              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Name, email, phone or order number..."
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />

            </div>

            <div>

              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                Order Date
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value
                  )
                }
                className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />

            </div>

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm transition hover:border-black hover:bg-gray-50"
            >
              Reset Filters
            </button>

          </div>

          {/* STATUS FILTERS */}

          <div className="mt-5 flex flex-wrap items-center gap-2">

            <p className="mr-2 text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
              Status
            </p>

            <button
              type="button"
              onClick={() =>
                setStatusFilter(
                  "all"
                )
              }
              className={`rounded-full px-4 py-2 text-sm transition ${
                statusFilter ===
                "all"
                  ? "bg-black text-white"
                  : "border border-black/10 bg-white hover:border-black/30"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() =>
                setStatusFilter(
                  "pending"
                )
              }
              className={`rounded-full px-4 py-2 text-sm transition ${
                statusFilter ===
                "pending"
                  ? "bg-yellow-500 text-white"
                  : "border border-black/10 bg-white hover:border-yellow-400"
              }`}
            >
              Pending
            </button>

            <button
              type="button"
              onClick={() =>
                setStatusFilter(
                  "completed"
                )
              }
              className={`rounded-full px-4 py-2 text-sm transition ${
                statusFilter ===
                "completed"
                  ? "bg-green-600 text-white"
                  : "border border-black/10 bg-white hover:border-green-400"
              }`}
            >
              Completed
            </button>

            {hasFilters && (
              <span className="ml-auto text-xs text-gray-500">
                Showing{" "}
                {
                  filteredOrders.length
                }{" "}
                of{" "}
                {orders.length}{" "}
                orders
              </span>
            )}

          </div>

        </div>

        {/* STATS */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-black/10 bg-white p-5">

            <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {totalOrders}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Based on current filters
            </p>

          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">

            <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {pendingOrders}
            </p>

            <p className="mt-1 text-xs text-yellow-600">
              Waiting to complete
            </p>

          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">

            <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {completedOrders}
            </p>

            <p className="mt-1 text-xs text-green-600">
              Completed orders
            </p>

          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">

            <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
              Revenue
            </p>

            <p className="mt-2 text-3xl font-semibold">
              ₹
              {filteredRevenue.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Based on current filters
            </p>

          </div>

        </div>

        {/* ORDERS TABLE */}

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">

          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold">

                {selectedDate
                  ? `Orders on ${new Date(
                      `${selectedDate}T00:00:00`
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}`
                  : statusFilter ===
                    "pending"
                  ? "Pending Orders"
                  : statusFilter ===
                    "completed"
                  ? "Completed Orders"
                  : "All Orders"}

              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Customer orders from
                Supabase.
              </p>

            </div>

            {selectedDate && (
              <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
                Date Filter Active
              </span>
            )}

          </div>

          {loading ? (

            <div className="flex min-h-[300px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />

                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Loading orders
                </p>

              </div>

            </div>

          ) : filteredOrders.length ===
            0 ? (

            <div className="flex min-h-[300px] items-center justify-center px-6">

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl">
                  🛍️
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No matching orders
                </h3>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                  {errorMessage
                    ? "Orders could not be loaded from Supabase."
                    : "No orders match the current search, status or date filter."}
                </p>

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="mt-5 rounded-full bg-black px-5 py-2.5 text-sm text-white transition hover:bg-black/80"
                >
                  Reset Filters
                </button>

              </div>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1150px]">

                <thead>

                  <tr className="border-b border-black/10 bg-gray-50 text-left">

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Order
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.map(
                    (order) => {

                      const status =
                        getStatus(
                          order
                        );

                      const normalizedStatus =
                        status
                          .trim()
                          .toLowerCase();

                      const updating =
                        updatingOrderId ===
                        order.id;

                      return (
                        <tr
                          key={
                            order.id
                          }
                          className="border-b border-black/5 transition hover:bg-gray-50"
                        >

                          {/* ORDER */}

                          <td className="px-6 py-5">

                            <p className="font-medium">
                              {getOrderNumber(
                                order
                              )}
                            </p>

                            <p className="mt-1 font-mono text-xs text-gray-400">
                              ID:{" "}
                              {
                                order.id
                              }
                            </p>

                          </td>

                          {/* CUSTOMER */}

                          <td className="px-6 py-5">

                            <p className="font-medium">
                              {getCustomerName(
                                order
                              )}
                            </p>

                            {order.email && (
                              <p className="mt-1 text-xs text-gray-500">
                                {
                                  order.email
                                }
                              </p>
                            )}

                            {order.phone && (
                              <p className="mt-1 text-xs text-gray-500">
                                {
                                  order.phone
                                }
                              </p>
                            )}

                            {order.city && (
                              <p className="mt-1 text-xs text-gray-400">
                                {
                                  order.city
                                }

                                {order.state
                                  ? `, ${order.state}`
                                  : ""}
                              </p>
                            )}

                          </td>

                          {/* TOTAL */}

                          <td className="px-6 py-5 font-medium">
                            {getTotal(
                              order
                            )}
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">

                            <select
                              value={
                                status
                              }
                              disabled={
                                updating
                              }
                              onChange={(
                                e
                              ) =>
                                updateOrderStatus(
                                  order,
                                  e.target.value
                                )
                              }
                              className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-black/20 ${getStatusClasses(
                                status
                              )}`}
                            >

                              <option value="Pending">
                                Pending
                              </option>

                              <option value="Processing">
                                Processing
                              </option>

                              <option value="Shipped">
                                Shipped
                              </option>

                              <option value="Delivered">
                                Delivered
                              </option>

                              <option value="Cancelled">
                                Cancelled
                              </option>

                            </select>

                            {updating && (
                              <p className="mt-1 text-[10px] text-gray-400">
                                Updating...
                              </p>
                            )}

                          </td>

                          {/* PAYMENT */}

                          <td className="px-6 py-5">

                            <select
                              value={
                                order.payment_status ||
                                "Pending"
                              }
                              disabled={
                                updating
                              }
                              onChange={(
                                e
                              ) =>
                                updatePaymentStatus(
                                  order,
                                  e.target.value
                                )
                              }
                              className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-black/20 ${getPaymentClasses(
                                order.payment_status ||
                                  "Pending"
                              )}`}
                            >

                              <option value="Pending">
                                Pending
                              </option>

                              <option value="Paid">
                                Paid
                              </option>

                              <option value="Failed">
                                Failed
                              </option>

                              <option value="Refunded">
                                Refunded
                              </option>

                            </select>

                          </td>

                          {/* DATE */}

                          <td className="px-6 py-5 text-sm text-gray-600">
                            {formatDate(
                              order.created_at
                            )}
                          </td>

                          {/* ACTION */}

                          <td className="px-6 py-5">

                            {normalizedStatus ===
                              "delivered" ||
                            normalizedStatus ===
                              "completed" ? (

                              <span className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">
                                ✓ Completed
                              </span>

                            ) : normalizedStatus ===
                              "cancelled" ? (

                              <span className="inline-flex rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700">
                                Cancelled
                              </span>

                            ) : (

                              <span className="text-xs text-gray-400">
                                Use status above
                              </span>

                            )}

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}