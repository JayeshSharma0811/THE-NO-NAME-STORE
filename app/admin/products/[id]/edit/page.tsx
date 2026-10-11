"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  price: number | string;
  original_price: number | string | null;
  description: string | null;
  image: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  featured: boolean | null;
  is_new: boolean | null;
  in_stock: boolean | null;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");

  const [image, setImage] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [newMainImage, setNewMainImage] = useState<File | null>(null);
  const [newAdditionalImages, setNewAdditionalImages] = useState<File[]>(
    []
  );

  const [mainImagePreview, setMainImagePreview] = useState("");

  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");

  const [featured, setFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [inStock, setInStock] = useState(true);

  // -----------------------------------------
  // LOAD PRODUCT
  // -----------------------------------------

  useEffect(() => {
    async function loadProduct() {
      if (!productId || Number.isNaN(productId)) {
        setErrorMessage("Invalid product ID.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("Failed to load product:", error);
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      const product = data as Product;

      setName(product.name || "");
      setSlug(product.slug || "");
      setCategory(product.category || "");
      setPrice(String(product.price ?? ""));
      setOriginalPrice(
        product.original_price !== null
          ? String(product.original_price)
          : ""
      );
      setDescription(product.description || "");

      setImage(product.image || "");
      setImages(product.images || []);

      setSizes(product.sizes?.join(", ") || "");
      setColors(product.colors?.join(", ") || "");

      setFeatured(Boolean(product.featured));
      setIsNew(Boolean(product.is_new));
      setInStock(product.in_stock !== false);

      setLoading(false);
    }

    loadProduct();
  }, [productId]);

  // -----------------------------------------
  // GENERATE SLUG
  // -----------------------------------------

  function generateSlug(value: string) {
    setName(value);

    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  }

  // -----------------------------------------
  // MAIN IMAGE
  // -----------------------------------------

  function handleMainImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setNewMainImage(file);

    const preview = URL.createObjectURL(file);
    setMainImagePreview(preview);
  }

  // -----------------------------------------
  // ADDITIONAL IMAGES
  // -----------------------------------------

  function handleAdditionalImagesChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setNewAdditionalImages(files);
  }

  // -----------------------------------------
  // UPLOAD IMAGE
  // -----------------------------------------

  async function uploadImage(file: File) {
    const extension = file.name.split(".").pop() || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // -----------------------------------------
  // SAVE PRODUCT
  // -----------------------------------------

 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (!name.trim() || !slug.trim() || !category.trim()) {
        throw new Error("Name, slug and category are required.");
      }

      if (price.trim() === "" || !Number.isFinite(Number(price)) || Number(price) < 0) {
        throw new Error("Please enter a valid selling price.");
      }

      let updatedMainImage = image;

      if (newMainImage) {
        setMessage("Uploading new main image...");
        updatedMainImage = await uploadImage(newMainImage);
      }

      let updatedImages = [...images];

      if (newAdditionalImages.length > 0) {
        setMessage("Uploading additional images...");

        const uploadedImages = await Promise.all(
          newAdditionalImages.map((file) => uploadImage(file))
        );

        updatedImages = [...updatedImages, ...uploadedImages];
      }

      const sizeArray = sizes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const colorArray = colors
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      setMessage("Saving product...");

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          category: category.trim(),
          price: Number(price),
          original_price: originalPrice.trim()
            ? Number(originalPrice)
            : null,
          description: description || null,
          image: updatedMainImage || null,
          images: updatedImages,
          sizes: sizeArray,
          colors: colorArray,
          featured,
          is_new: isNew,
          in_stock: inStock,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update product.");
      }

      setMessage("Product updated successfully!");

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error("Product update failed:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------
  // REMOVE ADDITIONAL IMAGE
  // -----------------------------------------

  function removeAdditionalImage(index: number) {
    setImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] text-[#111111]">
        <p className="text-sm text-black/50">
          Loading product...
        </p>
      </main>
    );
  }

  // -----------------------------------------
  // ERROR
  // -----------------------------------------

  if (errorMessage && !name) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] px-5 py-20 text-[#111111]">
        <div className="mx-auto max-w-xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-xl font-medium text-red-700">
            Could not load product
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {errorMessage}
          </p>

          <Link
            href="/admin/products"
            className="mt-6 inline-block bg-[#111111] px-5 py-3 text-sm text-white"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  // -----------------------------------------
  // PAGE
  // -----------------------------------------

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
              href="/admin/products"
              className="text-black/50 transition hover:text-black"
            >
              Products
            </Link>

            <Link
              href="/"
              className="text-black/50 transition hover:text-black"
            >
              Store
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        {/* TITLE */}

        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">
            Catalog
          </p>

          <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Edit Product
          </h1>

          <p className="mt-4 text-sm text-black/50">
            Update your product information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* BASIC INFORMATION */}

          <div className="border border-black/10 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-medium">
              Basic Information
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {/* NAME */}

              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Product Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    generateSlug(e.target.value)
                  }
                  required
                  className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* SLUG */}

              <div>
                <label className="text-sm font-medium">
                  Slug
                </label>

                <input
                  type="text"
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value)
                  }
                  required
                  className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label className="text-sm font-medium">
                  Category
                </label>

                <input
                  type="text"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  placeholder="e.g. T-Shirts"
                  className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* PRICE */}

              <div>
                <label className="text-sm font-medium">
                  Selling Price (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  required
                  className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* ORIGINAL PRICE */}

              <div>
                <label className="text-sm font-medium">
                  Original Price (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) =>
                    setOriginalPrice(e.target.value)
                  }
                  placeholder="Optional"
                  className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={6}
                  placeholder="Describe your product..."
                  className="mt-2 w-full resize-none border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* IMAGES */}

          <div className="border border-black/10 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-medium">
              Product Images
            </h2>

            <div className="mt-6 space-y-8">
              {/* CURRENT MAIN IMAGE */}

              <div>
                <label className="text-sm font-medium">
                  Main Image
                </label>

                <div className="mt-3 flex flex-wrap gap-4">
                  {(mainImagePreview || image) && (
                    <div className="h-40 w-40 overflow-hidden bg-[#eeeeeb]">
                      <img
                        src={mainImagePreview || image}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="mt-4 block w-full text-sm"
                />

                <p className="mt-2 text-xs text-black/40">
                  Leave empty to keep the current main image.
                </p>
              </div>

              {/* ADDITIONAL CURRENT IMAGES */}

              <div>
                <label className="text-sm font-medium">
                  Current Additional Images
                </label>

                {images.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-4">
                    {images.map((imageUrl, index) => (
                      <div
                        key={`${imageUrl}-${index}`}
                        className="relative h-32 w-32 overflow-hidden bg-[#eeeeeb]"
                      >
                        <img
                          src={imageUrl}
                          alt={`${name} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeAdditionalImage(index)
                          }
                          className="absolute right-2 top-2 bg-white px-2 py-1 text-xs text-red-600 shadow"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-black/40">
                    No additional images.
                  </p>
                )}
              </div>

              {/* NEW ADDITIONAL IMAGES */}

              <div>
                <label className="text-sm font-medium">
                  Add More Images
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  className="mt-3 block w-full text-sm"
                />

                {newAdditionalImages.length > 0 && (
                  <p className="mt-2 text-xs text-black/40">
                    {newAdditionalImages.length} new image
                    {newAdditionalImages.length !== 1
                      ? "s"
                      : ""}{" "}
                    selected.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* VARIANTS */}

          <div className="border border-black/10 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-medium">
              Variants
            </h2>

            <p className="mt-2 text-sm text-black/40">
              Optional. Separate multiple values with commas.
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {/* SIZES */}

              <div>
                <label className="text-sm font-medium">
                  Sizes
                </label>

                <input
                  type="text"
                  value={sizes}
                  onChange={(e) =>
                    setSizes(e.target.value)
                  }
                  placeholder="S, M, L, XL"
                  className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* COLORS */}

              <div>
                <label className="text-sm font-medium">
                  Colors
                </label>

                <input
                  type="text"
                  value={colors}
                  onChange={(e) =>
                    setColors(e.target.value)
                  }
                  placeholder="Black, White, Blue"
                  className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* STATUS */}

          <div className="border border-black/10 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-medium">
              Product Status
            </h2>

            <div className="mt-6 space-y-5">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) =>
                    setFeatured(e.target.checked)
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm">
                  Featured Product
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) =>
                    setIsNew(e.target.checked)
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm">
                  Mark as New
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) =>
                    setInStock(e.target.checked)
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm">
                  Product is In Stock
                </span>
              </label>
            </div>
          </div>

          {/* MESSAGE */}

          {message && (
            <div className="border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-700">
                {message}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">
                {errorMessage}
              </p>
            </div>
          )}

          {/* BUTTONS */}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/products"
              className="border border-black/20 px-6 py-3 text-center text-sm transition hover:border-black"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#111111] px-8 py-3 text-sm text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}