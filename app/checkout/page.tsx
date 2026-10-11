"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  price: number;
  original_price: number | null;
  description: string | null;
  image: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  featured: boolean | null;
  is_new: boolean | null;
  in_stock: boolean;
};

type CartProduct = {
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
  product: Product;
};

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
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const emptyForm: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const { cartItems, getCartCount, clearCart } = useCart();

  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // =====================================================
  // ADDRESSES
  // =====================================================

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const [showNewAddress, setShowNewAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // =====================================================
  // ORDER
  // =====================================================

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // IMPORTANT:
  // Store the total BEFORE clearCart().
  // Otherwise total becomes 0 after the cart is cleared.
  const [confirmedOrderTotal, setConfirmedOrderTotal] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // ERROR
  // =====================================================

  const [errorMessage, setErrorMessage] = useState("");

  // =====================================================
  // FORM
  // =====================================================

  const [formData, setFormData] = useState<FormData>(emptyForm);

  // =====================================================
  // GUEST CHECKOUT
  // =====================================================

  const [guestCheckout, setGuestCheckout] = useState(false);

  // =====================================================
  // LOAD CHECKOUT DATA
  // =====================================================

  useEffect(() => {
    async function loadCheckoutData() {
      setLoadingAddresses(true);

      // ---------------------------------------------------
      // GET CURRENT USER
      // ---------------------------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ---------------------------------------------------
      // LOAD PRODUCTS
      // ---------------------------------------------------

      if (cartItems.length === 0) {
        setProducts([]);
        setLoadingProducts(false);
      } else {
        const productIds = [
          ...new Set(cartItems.map((item) => item.productId)),
        ];

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);

        if (error) {
          console.error("Failed to load checkout products:", error);
          setProducts([]);
        } else {
          setProducts(data || []);
        }

        setLoadingProducts(false);
      }

      // ---------------------------------------------------
      // LOGGED-IN CUSTOMER
      // ---------------------------------------------------

      if (user) {
        setGuestCheckout(false);

        setFormData((current) => ({
          ...current,
          email: user.email || "",
        }));

        const {
          data: savedAddresses,
          error: addressError,
        } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (addressError) {
          console.error("Failed to load addresses:", addressError);
          setAddresses([]);
          setShowNewAddress(true);
        } else {
          const loadedAddresses = savedAddresses || [];

          setAddresses(loadedAddresses);

          const defaultAddress =
            loadedAddresses.find((address) => address.is_default) ||
            loadedAddresses[0];

          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setShowNewAddress(false);

            fillFormFromAddress(defaultAddress);
          } else {
            setShowNewAddress(true);
          }
        }
      }

      // ---------------------------------------------------
      // GUEST CUSTOMER
      // ---------------------------------------------------

      else {
        setAddresses([]);
        setSelectedAddressId(null);
        setShowNewAddress(true);
        setGuestCheckout(false);
        setFormData(emptyForm);
      }

      setLoadingAddresses(false);
    }

    loadCheckoutData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  // =====================================================
  // FILL FORM FROM SAVED ADDRESS
  // =====================================================

  function fillFormFromAddress(address: Address) {
    const nameParts = address.full_name.trim().split(/\s+/);

    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ");

    setFormData((current) => ({
      ...current,
      firstName,
      lastName,
      phone: address.phone,
      address: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }));
  }

  // =====================================================
  // SELECT SAVED ADDRESS
  // =====================================================

  function handleAddressSelect(address: Address) {
    setSelectedAddressId(address.id);
    setShowNewAddress(false);
    setErrorMessage("");

    fillFormFromAddress(address);
  }

  // =====================================================
  // START NEW ADDRESS
  // =====================================================

  function handleNewAddress() {
    setSelectedAddressId(null);
    setShowNewAddress(true);
    setErrorMessage("");

    setFormData((current) => ({
      ...current,
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    }));
  }

  // =====================================================
  // MERGE CART PRODUCTS
  // =====================================================

  const cartProducts: CartProduct[] = cartItems
    .map((item) => {
      const product = products.find(
        (product) => product.id === item.productId
      );

      if (!product) {
        return null;
      }

      return {
        ...item,
        product,
      };
    })
    .filter((item): item is CartProduct => item !== null);

  // =====================================================
  // PRICE CALCULATION
  // =====================================================

  const subtotal = cartProducts.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0
  );

const shipping: number = 0;

const total = subtotal + shipping;

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =====================================================
  // GENERATE ORDER NUMBER
  // =====================================================

  function generateOrderNumber() {
    const now = new Date();

    const datePart =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    const randomPart = Math.floor(1000 + Math.random() * 9000);

    return `NN-${datePart}-${randomPart}`;
  }

  // =====================================================
  // GENERATE TEMPORARY PASSWORD
  // =====================================================

  function generateTemporaryPassword() {
    const randomPart =
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2);

    return `NN-${randomPart}-9A!`;
  }

  // =====================================================
  // SAVE NEW ADDRESS
  // =====================================================

  async function saveNewAddress(userId: string) {
    // ---------------------------------------------------
    // VALIDATE ADDRESS FIELDS
    // ---------------------------------------------------

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      setErrorMessage("Please fill in all address fields.");
      return false;
    }

    // ---------------------------------------------------
    // VALIDATE PHONE
    // ---------------------------------------------------

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setErrorMessage(
        "Please enter a valid 10-digit phone number."
      );

      return false;
    }

    // ---------------------------------------------------
    // VALIDATE PINCODE
    // ---------------------------------------------------

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setErrorMessage(
        "Please enter a valid 6-digit pincode."
      );

      return false;
    }

    setSavingAddress(true);
    setErrorMessage("");

    // ---------------------------------------------------
    // FIRST ADDRESS BECOMES DEFAULT
    // ---------------------------------------------------

    const shouldBeDefault = addresses.length === 0;

    const fullName =
      `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

    // ---------------------------------------------------
    // INSERT ADDRESS
    // ---------------------------------------------------

    const {
      data,
      error,
    } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        full_name: fullName,
        phone: formData.phone.trim(),
        address_line: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        is_default: shouldBeDefault,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save address:", error);

      setErrorMessage(
        error.message || "Unable to save this address."
      );

      setSavingAddress(false);

      return false;
    }

    // ---------------------------------------------------
    // UPDATE LOCAL ADDRESSES
    // ---------------------------------------------------

    setAddresses((current) => [data, ...current]);

    setSelectedAddressId(data.id);
    setShowNewAddress(false);

    setSavingAddress(false);

    return true;
  }

  // =====================================================
  // CREATE CUSTOMER ACCOUNT
  // =====================================================

  async function createCustomerAccount() {
    const email = formData.email.trim().toLowerCase();

    // ---------------------------------------------------
    // EMAIL REQUIRED
    // ---------------------------------------------------

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return null;
    }

    // ---------------------------------------------------
    // CHECK CURRENT USER
    // ---------------------------------------------------

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (currentUser) {
      setGuestCheckout(false);
      return currentUser;
    }

    // ---------------------------------------------------
    // GENERATE TEMPORARY PASSWORD
    // ---------------------------------------------------

    const customerPassword = formData.phone.trim();

    // ---------------------------------------------------
    // CREATE ACCOUNT
    // ---------------------------------------------------

    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email,
      password: customerPassword,
      options: {
        data: {
          full_name:
            `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
          phone: formData.phone.trim(),
        },
      },
    });

    // ---------------------------------------------------
    // ACCOUNT CREATION ERROR
    // ---------------------------------------------------

    if (error) {
      console.error("Account creation result:", error);

      const errorText = error.message.toLowerCase();

      // -------------------------------------------------
      // EXISTING EMAIL
      // -------------------------------------------------

      if (
        errorText.includes("already registered") ||
        errorText.includes("already exists") ||
        errorText.includes("user already registered")
      ) {
        console.log(
          "Existing customer account detected. Continuing as guest."
        );

        setGuestCheckout(true);
        setErrorMessage("");

        return null;
      }

      // -------------------------------------------------
      // ALTERNATIVE SUPABASE ERROR
      // -------------------------------------------------

      if (
        errorText.includes("email") &&
        errorText.includes("registered")
      ) {
        console.log(
          "Existing customer email detected. Continuing as guest."
        );

        setGuestCheckout(true);
        setErrorMessage("");

        return null;
      }

      // -------------------------------------------------
      // ACTUAL ACCOUNT CREATION ERROR
      // -------------------------------------------------

      setErrorMessage(
        error.message ||
        "Unable to create your customer account."
      );

      return null;
    }

    // ---------------------------------------------------
    // NO USER RETURNED
    // ---------------------------------------------------

    if (!data.user) {
      setErrorMessage(
        "Your account could not be created. Please try again."
      );

      return null;
    }

    // ---------------------------------------------------
    // NEW ACCOUNT CREATED
    // ---------------------------------------------------

    setGuestCheckout(false);

    return data.user;
  }

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // ---------------------------------------------------
    // CHECK CART
    // ---------------------------------------------------

    if (cartProducts.length === 0) {
      setErrorMessage(
        "Your cart is empty or the products could not be loaded."
      );

      return;
    }

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!formData.firstName.trim()) {
      setErrorMessage("Please enter your first name.");
      return;
    }

    if (!formData.lastName.trim()) {
      setErrorMessage("Please enter your last name.");
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    // FIXED EMAIL REGEX
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      setErrorMessage(
        "Please enter a valid email address."
      );

      return;
    }

    // ---------------------------------------------------
    // PHONE VALIDATION
    // ---------------------------------------------------

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setErrorMessage(
        "Please enter a valid 10-digit phone number."
      );

      return;
    }

    // ---------------------------------------------------
    // ADDRESS VALIDATION
    // ---------------------------------------------------

    if (!formData.address.trim()) {
      setErrorMessage(
        "Please enter your delivery address."
      );

      return;
    }

    if (!formData.city.trim()) {
      setErrorMessage("Please enter your city.");
      return;
    }

    if (!formData.state.trim()) {
      setErrorMessage("Please enter your state.");
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setErrorMessage(
        "Please enter a valid 6-digit pincode."
      );

      return;
    }

    // ---------------------------------------------------
    // START SUBMITTING
    // ---------------------------------------------------

    setSubmitting(true);
    setErrorMessage("");

    try {
      // -------------------------------------------------
      // STEP 1 — CHECK CURRENT USER
      // -------------------------------------------------

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      let user = currentUser;

      if (userError) {
        console.log(
          "No authenticated user. Guest checkout allowed."
        );
      }

      // -------------------------------------------------
      // STEP 2 — CREATE ACCOUNT FOR NEW CUSTOMER
      // -------------------------------------------------

      if (!user) {
        const createdUser =
          await createCustomerAccount();

        if (createdUser) {
          user = createdUser;
        }
      }

      // -------------------------------------------------
      // STEP 3 — SAVE ADDRESS
      // -------------------------------------------------

      if (showNewAddress && user) {
        const saved = await saveNewAddress(user.id);

        if (!saved) {
          return;
        }
      }

      // -------------------------------------------------
      // IMPORTANT:
      // CAPTURE TOTAL BEFORE CART IS CLEARED.
      // -------------------------------------------------

      const finalOrderTotal = total;
      const finalSubtotal = subtotal;
      const finalShipping = shipping;

      // -------------------------------------------------
      // STEP 4 — GENERATE ORDER NUMBER
      // -------------------------------------------------

      const newOrderNumber =
        generateOrderNumber();

      // -------------------------------------------------
      // STEP 5 — PREPARE ORDER ITEMS
      // -------------------------------------------------

      const orderItems = cartProducts.map(
        (item) => ({
          product_id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: Number(item.product.price),
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
          image: item.product.image || null,
        })
      );

      // -------------------------------------------------
      // STEP 6 — CUSTOMER NAME
      // -------------------------------------------------

      const customerName =
        `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

      // -------------------------------------------------
      // STEP 7 — CREATE ORDER
      // -------------------------------------------------

      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,

          order_number: newOrderNumber,

          customer_name: customerName,

          email:
            formData.email.trim().toLowerCase(),

          phone: formData.phone.trim(),

          address: formData.address.trim(),

          city: formData.city.trim(),

          state: formData.state.trim(),

          pincode: formData.pincode.trim(),

          items: orderItems,

          subtotal: finalSubtotal,

          shipping: finalShipping,

          total: finalOrderTotal,

          status: "Pending",

          payment_status: "Pending",
        })
        .select()
        .single();

      console.log("Created order:", data);
      console.log("Create order error:", error);

      // -------------------------------------------------
      // ORDER ERROR
      // -------------------------------------------------

      if (error) {
        console.error(
          "Failed to create order:",
          error
        );

        setErrorMessage(
          error.message ||
          "Unable to place your order."
        );

        return;
      }

      // -------------------------------------------------
      // STEP 8 — SAVE ORDER NUMBER
      // -------------------------------------------------

      setOrderNumber(newOrderNumber);

      // -------------------------------------------------
      // STEP 9 — SAVE ORDER TOTAL
      //
      // IMPORTANT:
      // Do this BEFORE clearCart().
      // -------------------------------------------------

      setConfirmedOrderTotal(finalOrderTotal);

      // -------------------------------------------------
      // STEP 10 — CLEAR CART
      // -------------------------------------------------

      clearCart();

      // -------------------------------------------------
      // STEP 11 — SHOW CONFIRMATION
      // -------------------------------------------------

      setOrderPlaced(true);
    } catch (error) {
      console.error(
        "Unexpected checkout error:",
        error
      );

      setErrorMessage(
        "Something went wrong while placing your order."
      );
    } finally {
      setSubmitting(false);
      setSavingAddress(false);
    }
  };

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (
    cartItems.length === 0 &&
    !orderPlaced
  ) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
        <Navbar />

        <section className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-5 text-center sm:px-8">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-black/40">
            Checkout
          </p>

          <h1 className="mb-5 text-4xl tracking-[-0.04em] sm:text-6xl">
            Your bag is empty.
          </h1>

          <p className="mb-8 max-w-md text-sm leading-6 text-black/50">
            Add something to your bag before proceeding
            to checkout.
          </p>

          <Link
  href="/shop"
  className="mt-8 inline-flex items-center justify-center bg-white px-8 py-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white"
>
  Continue Shopping →
</Link>
        </section>
      </main>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (
    (loadingProducts || loadingAddresses) &&
    !orderPlaced
  ) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
        <Navbar />

        <section className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />

            <p className="text-xs uppercase tracking-[0.2em] text-black/40">
              Loading checkout
            </p>
          </div>
        </section>
      </main>
    );
  }

  // =====================================================
  // ORDER CONFIRMATION
  // =====================================================

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
        <Navbar />

        <section className="mx-auto flex min-h-[75vh] max-w-3xl flex-col items-center justify-center px-5 text-center sm:px-8">

          {/* SUCCESS ICON */}

          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-black/15 text-2xl text-black">
            ✓
          </div>

          {/* STATUS */}

          <p className="mt-8 text-xs uppercase tracking-[0.25em] text-black/40">
            Order Confirmed
          </p>

          {/* TITLE */}

          <h1 className="mt-4 text-5xl tracking-[-0.05em] sm:text-7xl">
            Thank you.
          </h1>

          {/* MESSAGE */}

          <p className="mt-6 max-w-lg text-sm leading-7 text-black/50">
            Your order has been successfully placed.
            We&apos;ll process your order and send
            further updates to your email address.
          </p>

          {/* ORDER DETAILS */}

          <div className="mt-8 border border-black/10 bg-white px-10 py-6">

            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              Order Number
            </p>

            <p className="mt-2 text-xl font-medium text-black">
              {orderNumber}
            </p>

            <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-black/40">
              Order Total
            </p>

            {/* IMPORTANT:
                Use confirmedOrderTotal instead of total.
            */}

            <p className="mt-2 text-2xl font-medium text-black">
              ₹
              {confirmedOrderTotal.toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

          {/* ACTION BUTTONS */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            {/* VIEW ORDERS */}

            <Link
              href="/orders"
              className="inline-flex items-center justify-center border border-black bg-white px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:bg-black hover:text-white"
            >
              View My Orders
            </Link>

            {/* TRACK ORDER */}

            <Link
              href={`/track-order?order=${encodeURIComponent(orderNumber)}`}
              className="inline-flex items-center justify-center border border-black bg-white px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-white"
            >
              Track Order
            </Link>
          </div>

          {/* CONTINUE SHOPPING */}

          <Link
            href="/shop"
            className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-/60 underline underline-offset-4 transition hover:text-white"
          >
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  // =====================================================
  // CHECKOUT PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">

      {/* =================================================
          ANNOUNCEMENT
      ================================================= */}

      <div className="bg-black px-4 py-2 text-center text-[10px] tracking-[0.18em] text-white sm:text-xs">
        FREE SHIPPING ALL OVER INDIA
      </div>

      <Navbar />

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-black/10">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">

          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-black/40">
            NO NAME
          </p>

          <h1 className="text-5xl font-medium tracking-[-0.06em] sm:text-7xl">
            Checkout
          </h1>

          <p className="mt-5 text-sm text-black/50">
            Complete your order securely.
          </p>
        </div>
      </section>

      {/* =================================================
          MAIN CHECKOUT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px] lg:gap-20">

          {/* =================================================
              LEFT
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-12"
          >

            {/* =================================================
                CONTACT INFORMATION
            ================================================= */}

            <section>
              <div className="mb-6 border-b border-black/10 pb-4">

                <h2 className="text-xl tracking-[-0.02em]">
                  Contact Information
                </h2>

                <p className="mt-1 text-xs text-black/40">
                  Enter your contact details for your order.
                </p>
              </div>

              <div className="space-y-5">

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      phone: event.target.value.replace(
                        /\D/g,
                        ""
                      ),
                    }))
                  }
                  required
                />
              </div>
            </section>

            {/* =================================================
                SAVED ADDRESSES
            ================================================= */}

            {addresses.length > 0 && (
              <section>

                <div className="mb-6 flex items-end justify-between border-b border-black/10 pb-4">

                  <div>
                    <h2 className="text-xl tracking-[-0.02em]">
                      Delivery Address
                    </h2>

                    <p className="mt-1 text-xs text-black/40">
                      Select a saved address.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNewAddress}
                    className="text-xs font-medium underline underline-offset-4"
                  >
                    + New Address
                  </button>
                </div>

                <div className="space-y-3">

                  {addresses.map((address) => {
                    const selected =
                      selectedAddressId === address.id &&
                      !showNewAddress;

                    return (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() =>
                          handleAddressSelect(address)
                        }
                        className={`w-full border p-5 text-left transition ${selected
                            ? "border-black bg-white"
                            : "border-black/10 bg-white/40 hover:border-black/40"
                          }`}
                      >

                        <div className="flex items-start gap-4">

                          <div
                            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected
                                ? "border-black"
                                : "border-black/25"
                              }`}
                          >
                            {selected && (
                              <div className="h-2.5 w-2.5 rounded-full bg-black" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="font-medium">
                                {address.full_name}
                              </p>

                              {address.is_default && (
                                <span className="bg-black px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-white">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-sm text-black/55">
                              {address.phone}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-black/55">
                              {address.address_line}
                              <br />
                              {address.city},{" "}
                              {address.state} -{" "}
                              {address.pincode}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* =================================================
                NEW ADDRESS
            ================================================= */}

            {showNewAddress && (
              <section>

                <div className="mb-6 border-b border-black/10 pb-4">

                  <h2 className="text-xl tracking-[-0.02em]">
                    {addresses.length > 0
                      ? "New Delivery Address"
                      : "Delivery Address"}
                  </h2>

                </div>

                <div className="space-y-5">

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    <Input
                      label="First Name"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />

                    <Input
                      label="Last Name"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Input
                    label="Address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

                    <Input
                      label="City"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />

                    <Input
                      label="State"
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />

                    <Input
                      label="PIN Code"
                      name="pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          pincode:
                            event.target.value.replace(
                              /\D/g,
                              ""
                            ),
                        }))
                      }
                      required
                    />
                  </div>

                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const defaultAddress =
                          addresses.find(
                            (address) =>
                              address.is_default
                          ) || addresses[0];

                        if (defaultAddress) {
                          handleAddressSelect(
                            defaultAddress
                          );
                        }
                      }}
                      className="text-xs text-black/50 underline underline-offset-4"
                    >
                      Use a saved address instead
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                SELECTED ADDRESS SUMMARY
            ================================================= */}

            {!showNewAddress &&
              selectedAddressId &&
              addresses.length > 0 && (
                <section>

                  <div className="border border-black/10 bg-white/40 p-5">

                    <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                      Delivering to
                    </p>

                    {(() => {
                      const selectedAddress =
                        addresses.find(
                          (address) =>
                            address.id ===
                            selectedAddressId
                        );

                      if (!selectedAddress) {
                        return null;
                      }

                      return (
                        <div className="mt-3">

                          <p className="font-medium">
                            {selectedAddress.full_name}
                          </p>

                          <p className="mt-1 text-sm text-black/55">
                            {selectedAddress.phone}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-black/55">
                            {selectedAddress.address_line}
                            <br />
                            {selectedAddress.city},{" "}
                            {selectedAddress.state} -{" "}
                            {selectedAddress.pincode}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </section>
              )}

            {/* =================================================
                PAYMENT
            ================================================= */}

            <section>

              <div className="mb-6 border-b border-black/10 pb-4">

                <h2 className="text-xl tracking-[-0.02em]">
                  Payment Method
                </h2>

              </div>

              <div className="border border-black/15 bg-white/30 p-5">

                <label className="flex cursor-pointer gap-4">

                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    defaultChecked
                    className="mt-1"
                  />

                  <div>

                    <p className="text-sm">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs leading-5 text-black/45">
                      Pay when your order arrives.
                    </p>

                  </div>
                </label>
              </div>

              <p className="mt-4 text-xs leading-5 text-black/40">
                Online payment will be connected after we
                integrate the payment gateway.
              </p>
            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {errorMessage && (
              <div className="border border-red-200 bg-red-50 px-5 py-4">

                <p className="text-sm font-medium text-red-700">
                  Order could not be placed
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  {errorMessage}
                </p>

              </div>
            )}

            {/* =================================================
                EXISTING ACCOUNT NOTICE
            ================================================= */}

            {guestCheckout && !errorMessage && (
              <div className="border border-black/10 bg-white px-5 py-4">

                <p className="text-sm font-medium">
                  Continuing as guest
                </p>

                <p className="mt-1 text-xs leading-5 text-black/50">
                  This email already has an account. Your
                  order can still be placed without logging
                  in.
                </p>

              </div>
            )}

            {/* =================================================
                PLACE ORDER
            ================================================= */}

            <button
              type="submit"
              disabled={
                submitting ||
                savingAddress
              }
              className="flex h-14 w-full items-center justify-center border border-black bg-black px-6 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingAddress
                ? "Saving Address..."
                : submitting
                  ? "Processing Order..."
                  : `Place Order · ₹${total.toLocaleString(
                    "en-IN"
                  )}`}
            </button>

            <p className="text-center text-[10px] uppercase tracking-[0.12em] text-black/35">
              Secure checkout • Easy returns
            </p>

          </form>

          {/* =================================================
              RIGHT — ORDER SUMMARY
          ================================================= */}

          <aside className="h-fit lg:sticky lg:top-8 lg:self-start">

            <div className="border border-black/10 bg-white/40 p-6 sm:p-8">

              <h2 className="text-lg tracking-[-0.02em]">
                Your Order
              </h2>

              <p className="mt-2 text-xs text-black/40">
                {getCartCount()}{" "}
                {getCartCount() === 1
                  ? "item"
                  : "items"}
              </p>

              {/* PRODUCTS */}

              <div className="mt-7 space-y-5 border-b border-black/10 pb-6">

                {cartProducts.map((item) => {
                  const image =
                    item.product.image ||
                    item.product.images?.[0] ||
                    null;

                  return (
                    <div
                      key={`${item.productId}-${item.size ?? ""}-${item.color ?? ""}`}
                      className="flex gap-4"
                    >

                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#e8e7e2]">

                        {image ? (
                          <img
                            src={image}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-wider text-black/30">
                            No image
                          </div>
                        )}

                        <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center bg-black px-1 text-[9px] text-white">
                          {item.quantity}
                        </span>

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-sm">
                          {item.product.name}
                        </p>

                        {item.size && (
                          <p className="mt-1 text-[11px] text-black/45">
                            Size: {item.size}
                          </p>
                        )}

                        {item.color && (
                          <p className="text-[11px] text-black/45">
                            Color: {item.color}
                          </p>
                        )}

                        <p className="mt-2 text-sm">
                          ₹
                          {(
                            Number(item.product.price) *
                            item.quantity
                          ).toLocaleString("en-IN")}
                        </p>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* =================================================
                  PRICE SUMMARY
              ================================================= */}

              <div className="space-y-4 border-b border-black/10 py-6">

                <div className="flex items-center justify-between text-sm">

                  <span className="text-black/50">
                    Subtotal
                  </span>

                  <span>
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between text-sm">

                  <span className="text-black/50">
                    Shipping
                  </span>

                  <span>
                    {shipping === 0
                      ? "Free"
                      : `₹${shipping.toLocaleString(
                        "en-IN"
                      )}`}
                  </span>

                </div>

              </div>

              {/* =================================================
                  TOTAL
              ================================================= */}

              <div className="flex items-center justify-between py-6">

                <span className="text-sm uppercase tracking-[0.12em]">
                  Total
                </span>

                <span className="text-xl font-medium">
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

              {/* =================================================
                  FREE SHIPPING MESSAGE
              ================================================= */}

              {subtotal >= 999 && (
                <div className="bg-[#eeeee9] px-4 py-3 text-xs leading-5 text-black/50">
                  🎉 Free shipping has been applied to
                  your order.
                </div>
              )}

              {subtotal > 0 &&
                subtotal < 999 && (
                  <div className="bg-[#eeeee9] px-4 py-3 text-xs leading-5 text-black/50">

                    Add ₹
                    {(999 - subtotal).toLocaleString(
                      "en-IN"
                    )}{" "}
                    more to unlock free shipping.

                  </div>
                )}

            </div>

            {/* BACK TO CART */}

            <Link
              href="/cart"
              className="mt-5 block text-center text-xs uppercase tracking-[0.15em] text-black/45 underline underline-offset-4 transition hover:text-black"
            >
              ← Back to Bag
            </Link>

          </aside>
        </div>
      </section>

      {/* =================================================
          BRAND STATEMENT
      ================================================= */}

      <section className="bg-black px-6 py-24 text-white sm:px-10 lg:py-28">

        <div className="mx-auto max-w-7xl">

          <p className="mb-7 text-xs uppercase tracking-[0.3em] text-white/40">
            NO NAME
          </p>

          <h2 className="max-w-5xl text-5xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-8xl">

            Nothing ordinary.

            <br />

            Everything considered.

          </h2>

        </div>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-[#f7f7f5]">

        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-3">

          {/* BRAND */}

          <div>

            <h3 className="text-2xl font-semibold tracking-[-0.04em]">
              NO NAME
            </h3>

            <p className="mt-4 max-w-xs text-sm leading-6 text-black/50">
              Curated products. Refined choices. Made for
              modern living.
            </p>

          </div>

          {/* EXPLORE */}

          <div>

            <p className="text-xs uppercase tracking-[0.2em]">
              Explore
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-black/60">

              <Link href="/">
                Home
              </Link>

              <Link href="/shop">
                Shop
              </Link>

              <Link href="/account">
                Account
              </Link>

              <Link href="/cart">
                Cart
              </Link>

            </div>
          </div>

          {/* INFORMATION */}

          <div>

            <p className="text-xs uppercase tracking-[0.2em]">
              Information
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-black/60">

              <Link href="#">
                Shipping
              </Link>

              <Link href="#">
                Returns
              </Link>

              <Link href="#">
                Privacy
              </Link>

              <Link href="#">
                Contact
              </Link>

            </div>
          </div>

        </div>

        <div className="border-t border-black/10 px-5 py-6 text-center text-[10px] uppercase tracking-[0.2em] text-black/40 sm:px-8">
          © 2026 NO NAME. All rights reserved.
        </div>

      </footer>

    </main>
  );
}

/*
 * =====================================================
 * REUSABLE INPUT
 * =====================================================
 */

function Input({
  label,
  name,
  type,
  value,
  onChange,
  required = false,
  inputMode,
  maxLength,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-black/45">
        {label}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full border border-black/15 bg-transparent px-4 py-4 text-sm outline-none transition focus:border-black"
      />

    </label>
  );
}