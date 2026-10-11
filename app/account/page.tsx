"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

type UserData = {
  id: string;
  email?: string;
  name?: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isRegistering, setIsRegistering] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">(
    "error"
  );

  // Get a safe internal redirect path.
  // Example:
  // /account?redirect=/checkout
  function getRedirectPath() {
    if (typeof window === "undefined") {
      return null;
    }

    const redirect = new URLSearchParams(window.location.search).get(
      "redirect"
    );

    // Only allow internal paths.
    if (
      !redirect ||
      !redirect.startsWith("/") ||
      redirect.startsWith("//")
    ) {
      return null;
    }

    return redirect;
  }

  // Redirect after successful authentication.
  function continueAfterAuth() {
    const redirectPath = getRedirectPath();

    if (redirectPath) {
      router.replace(redirectPath);
    } else {
      router.replace("/account");
    }
  }

  useEffect(() => {
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const loggedInUser = {
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            "",
        };

        setUser(loggedInUser);

        // If the customer came from Buy Now,
        // continue directly to checkout.
        const redirectPath = getRedirectPath();

        if (redirectPath) {
          setTimeout(() => {
            router.replace(redirectPath);
          }, 100);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const loggedInUser = {
        id: user.id,
        email: user.email,
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "",
      };

      setUser(loggedInUser);

      // If already logged in and user opens:
      // /account?redirect=/checkout
      // send them directly to checkout.
      const redirectPath = getRedirectPath();

      if (redirectPath) {
        router.replace(redirectPath);
        return;
      }
    }

    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoginLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setLoginLoading(false);
      return;
    }

    setMessage("Login successful.");
    setMessageType("success");

    setEmail("");
    setPassword("");

    // Continue to checkout if Buy Now brought the customer here.
    // Otherwise go to normal Account page.
    setTimeout(() => {
      continueAfterAuth();
    }, 150);

    setLoginLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setRegisterLoading(true);
    setMessage("");

    if (!name.trim()) {
      setMessage("Please enter your name.");
      setMessageType("error");
      setRegisterLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      setRegisterLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      setRegisterLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setRegisterLoading(false);
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    /*
      Email confirmation is disabled in your Supabase setup,
      so normally a session will be created immediately.
    */

    if (data.session) {
      setMessage("Account created successfully. You are now logged in.");
      setMessageType("success");

      setTimeout(() => {
        continueAfterAuth();
      }, 150);
    } else {
      /*
        If Supabase ever requires email confirmation,
        don't send the customer to checkout before authentication.
      */
      setMessage(
        "Account created. Please check your email and confirm your account before logging in."
      );
      setMessageType("success");

      setIsRegistering(false);
    }

    setRegisterLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    setUser(null);
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setMessage("");

    router.replace("/account");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-[#111]">
        <Navbar />

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <p className="text-sm text-black/50">Loading account...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        {!user ? (
          <div className="mx-auto max-w-md">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-black text-2xl font-medium text-white">
                NN
              </div>

              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-black/45">
                Account
              </p>

              <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
                {isRegistering
                  ? "Create your account"
                  : "Welcome to NO NAME"}
              </h1>

              <p className="mt-3 text-sm text-black/55">
                {isRegistering
                  ? "Create an account to manage your orders."
                  : "Sign in to your account"}
              </p>
            </div>

            {!isRegistering ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    className="w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password is your Mobile No."
                    required
                    autoComplete="current-password"
                    className="w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {message && (
                  <p
                    className={`text-sm ${
                      messageType === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full border border-black bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:opacity-50"
                >
                  {loginLoading ? "LOGGING IN..." : "LOGIN"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                    className="w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    className="w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    autoComplete="new-password"
                    className="w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  />

                  <p className="mt-2 text-xs text-black/40">
                    Minimum 6 characters.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                    className="w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {message && (
                  <p
                    className={`text-sm ${
                      messageType === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full border border-black bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:opacity-50"
                >
                  {registerLoading
                    ? "CREATING ACCOUNT..."
                    : "CREATE ACCOUNT"}
                </button>
              </form>
            )}

            <div className="mt-8 text-center text-sm text-black/55">
              {!isRegistering ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setMessage("");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="font-medium text-black underline underline-offset-4"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      setMessage("");
                      setName("");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="font-medium text-black underline underline-offset-4"
                  >
                    Login
                  </button>
                </>
              )}
            </div>

            <div className="mt-10 flex justify-center gap-5 text-sm">
              <Link href="/" className="underline underline-offset-4">
                Continue Shopping
              </Link>

              <Link href="/cart" className="underline underline-offset-4">
                View Bag
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            {/* ACCOUNT HEADER */}
            <div className="mb-12 text-center">
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-black text-2xl font-medium text-white">
                {user.name
                  ? user.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "NN"}
              </div>

              <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                My Account
              </p>

              <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
                {user.name || "NO NAME Customer"}
              </h1>

              <p className="mt-2 text-sm text-black/50">
                {user.email}
              </p>
            </div>

            {/* ACCOUNT MENU */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/orders"
                className="group border border-black/10 bg-white p-6 transition hover:border-black"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                      Orders
                    </p>

                    <h2 className="mt-3 text-lg font-medium">
                      My Orders
                    </h2>

                    <p className="mt-2 text-sm text-black/50">
                      View your order history and payment status.
                    </p>
                  </div>

                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/account/profile"
                className="group border border-black/10 bg-white p-6 transition hover:border-black"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                      Personal
                    </p>

                    <h2 className="mt-3 text-lg font-medium">
                      My Profile
                    </h2>

                    <p className="mt-2 text-sm text-black/50">
                      Manage your name and account information.
                    </p>
                  </div>

                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/account/addresses"
                className="group border border-black/10 bg-white p-6 transition hover:border-black"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                      Delivery
                    </p>

                    <h2 className="mt-3 text-lg font-medium">
                      Saved Addresses
                    </h2>

                    <p className="mt-2 text-sm text-black/50">
                      Save and manage your delivery addresses.
                    </p>
                  </div>

                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/track-order"
                className="group border border-black/10 bg-white p-6 transition hover:border-black"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                      Delivery
                    </p>

                    <h2 className="mt-3 text-lg font-medium">
                      Track Order
                    </h2>

                    <p className="mt-2 text-sm text-black/50">
                      Check the current status of your order.
                    </p>
                  </div>

                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            </div>

            {/* LOGOUT */}
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleLogout}
                className="border border-black px-10 py-3 text-sm transition hover:bg-black hover:text-white"
              >
                LOGOUT
              </button>
            </div>

            {/* FOOTER */}
            <div className="mt-10 flex justify-center gap-6 text-sm">
              <Link href="/" className="underline underline-offset-4">
                Continue Shopping
              </Link>

              <Link href="/cart" className="underline underline-offset-4">
                View Bag
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}