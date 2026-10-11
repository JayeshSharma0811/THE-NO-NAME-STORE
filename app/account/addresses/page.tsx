"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";

type Address = {
  id: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

type FormData = {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
};

const emptyForm: FormData = {
  full_name: "",
  phone: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/account";
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading addresses:", error);
      setMessage(error.message);
      setAddresses([]);
    } else {
      setAddresses(data || []);
    }

    setLoading(false);
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(address: Address) {
    setEditingId(address.id);

    setForm({
      full_name: address.full_name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });

    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  function updateField(field: keyof FormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");

    if (
      !form.full_name.trim() ||
      !form.phone.trim() ||
      !form.address_line.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setMessage("Please enter a valid 6-digit pincode.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/account";
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("addresses")
        .update({
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          address_line: form.address_line.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        })
        .eq("id", editingId)
        .eq("user_id", user.id);

      if (error) {
        setMessage(error.message);
      } else {
        closeForm();
        await loadAddresses();
      }
    } else {
      const shouldBeDefault = addresses.length === 0;

      const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address_line: form.address_line.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        is_default: shouldBeDefault,
      });

      if (error) {
        setMessage(error.message);
      } else {
        closeForm();
        await loadAddresses();
      }
    }

    setSaving(false);
  }

  async function deleteAddress(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadAddresses();
  }

  async function setDefaultAddress(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/account";
      return;
    }

    const { error: resetError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    if (resetError) {
      setMessage(resetError.message);
      return;
    }

    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadAddresses();
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#f7f7f5] px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm text-gray-500">
              Loading addresses...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f5] px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">

          {/* Back */}
          <Link
            href="/account"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            ← Back to Account
          </Link>

          {/* Header */}
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                Account
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black">
                Saved Addresses
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Manage your delivery addresses.
              </p>
            </div>

            {!showForm && (
              <button
                onClick={openAddForm}
                className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                + Add Address
              </button>
            )}
          </div>

          {/* Message */}
          {message && !showForm && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {message}
            </div>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-black">
                    {editingId ? "Edit Address" : "Add New Address"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter your delivery details.
                  </p>
                </div>

                <button
                  onClick={closeForm}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  Cancel
                </button>
              </div>

              <form
                onSubmit={saveAddress}
                className="grid gap-5 sm:grid-cols-2"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) =>
                      updateField("full_name", e.target.value)
                    }
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Address
                  </label>

                  <textarea
                    rows={3}
                    value={form.address_line}
                    onChange={(e) =>
                      updateField("address_line", e.target.value)
                    }
                    placeholder="House / Flat / Street / Area"
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    City
                  </label>

                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      updateField("city", e.target.value)
                    }
                    placeholder="City"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    State
                  </label>

                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) =>
                      updateField("state", e.target.value)
                    }
                    placeholder="State"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Pincode
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) =>
                      updateField(
                        "pincode",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="6-digit pincode"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>

                {message && (
                  <div className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {message}
                  </div>
                )}

                <div className="flex gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Address"
                      : "Save Address"}
                  </button>

                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-black transition hover:border-black"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Empty State */}
          {!showForm && addresses.length === 0 && (
            <div className="mt-8 rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                📍
              </div>

              <h2 className="mt-5 text-lg font-semibold text-black">
                No saved addresses
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Add your delivery address so you can check out faster next
                time.
              </p>

              <button
                onClick={openAddForm}
                className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Add Address
              </button>
            </div>
          )}

          {/* Address List */}
          {!showForm && addresses.length > 0 && (
            <div className="mt-8 space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-black">
                          {address.full_name}
                        </h2>

                        {address.is_default && (
                          <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-gray-600">
                        {address.phone}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {address.address_line}
                        <br />
                        {address.city}, {address.state} -{" "}
                        {address.pincode}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!address.is_default && (
                        <button
                          onClick={() =>
                            setDefaultAddress(address.id)
                          }
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-black hover:border-black"
                        >
                          Set Default
                        </button>
                      )}

                      <button
                        onClick={() => openEditForm(address)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-black hover:border-black"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteAddress(address.id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:border-red-500"
                      >
                        Delete
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  );
}