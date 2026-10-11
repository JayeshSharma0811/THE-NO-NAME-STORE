"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/account";
      return;
    }

    setEmail(user.email || "");
    setName(user.user_metadata?.full_name || "");

    setLoading(false);
  }

  async function saveProfile() {
    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: name.trim(),
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile updated successfully.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#f7f7f5] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-gray-500">
              Loading profile...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f5] px-6 py-12">
        <div className="mx-auto max-w-3xl">

          {/* Back */}
          <Link
            href="/account"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            ← Back to Account
          </Link>

          {/* Heading */}
          <div className="mt-6 mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              Account
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your personal information.
            </p>
          </div>

          {/* Profile Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

            {/* Avatar */}
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-semibold text-white">
                {name
                  ? name.charAt(0).toUpperCase()
                  : "N"}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-black">
                  {name || "NO NAME Customer"}
                </h2>

                <p className="text-sm text-gray-500">
                  Customer account
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setMessage("");
                  }}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Your email address cannot be changed here.
                </p>
              </div>

              {/* Save */}
              <button
                onClick={saveProfile}
                disabled={saving}
                className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              {/* Message */}
              {message && (
                <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <Link
              href="/orders"
              className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-black"
            >
              <p className="font-medium text-black">
                My Orders
              </p>

              <p className="mt-1 text-sm text-gray-500">
                View your order history
              </p>
            </Link>

            <Link
              href="/account/addresses"
              className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-black"
            >
              <p className="font-medium text-black">
                Saved Addresses
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Manage your delivery addresses
              </p>
            </Link>

          </div>

        </div>
      </main>
    </>
  );
}