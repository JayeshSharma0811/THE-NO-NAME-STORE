"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { supabase } from "../../../lib/supabase";

type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean;
};

type CollectionApiResponse = {
  error?: string;
  collection?: Collection;
  collections?: Collection[];
};

export default function NewProductPage() {
  // --------------------------------------------------
  // PRODUCT INFORMATION
  // --------------------------------------------------

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");

  // --------------------------------------------------
  // COLLECTIONS
  // --------------------------------------------------

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] =
    useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [deletingCollectionId, setDeletingCollectionId] =
    useState<string | null>(null);

  // --------------------------------------------------
  // IMAGES
  // --------------------------------------------------

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>(
    []
  );
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<
    string[]
  >([]);

  // --------------------------------------------------
  // OPTIONAL VARIANTS
  // --------------------------------------------------

  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");

  // --------------------------------------------------
  // PRODUCT STATUS
  // --------------------------------------------------

  const [featured, setFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [inStock, setInStock] = useState(true);

  // --------------------------------------------------
  // GENERAL STATE
  // --------------------------------------------------

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --------------------------------------------------
  // CREATE SLUG
  // --------------------------------------------------

  const makeSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const generateSlug = (value: string) => {
    setName(value);
    setSlug(makeSlug(value));
  };

  // --------------------------------------------------
  // LOAD COLLECTIONS FROM SECURE API
  // --------------------------------------------------

  const loadCollections = useCallback(async () => {
    setLoadingCollections(true);

    try {
      const response = await fetch("/api/admin/collections", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const responseText = await response.text();

      let result: CollectionApiResponse;

      try {
        result = JSON.parse(responseText) as CollectionApiResponse;
      } catch {
        throw new Error(
          `Invalid collections API response (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error || `Unable to load collections (${response.status}).`
        );
      }

      const activeCollections = (result.collections || []).filter(
        (collection) => collection.is_active !== false
      );

      setCollections(
        activeCollections.sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (error) {
      console.error("Collections loading error:", error);
      setCollections([]);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load collections."
      );
    } finally {
      setLoadingCollections(false);
    }
  }, []);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  // --------------------------------------------------
  // CREATE COLLECTION
  // --------------------------------------------------

  const handleCreateCollection = async () => {
    const trimmedName = newCollectionName.trim();

    if (!trimmedName) {
      setMessage("Please enter a collection name.");
      return;
    }

    const collectionSlug = makeSlug(trimmedName);

    if (!collectionSlug) {
      setMessage("Please enter a valid collection name.");
      return;
    }

    const duplicate = collections.some(
      (collection) =>
        collection.slug.toLowerCase() === collectionSlug.toLowerCase()
    );

    if (duplicate) {
      setMessage("A collection with this name already exists.");
      return;
    }

    setCreatingCollection(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/collections", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          slug: collectionSlug,
          description: newCollectionDescription.trim() || null,
          is_active: true,
        }),
      });

      const responseText = await response.text();

      console.log("Collection API status:", response.status);
      console.log("Collection API response:", responseText);

      let result: CollectionApiResponse;

      try {
        result = JSON.parse(responseText) as CollectionApiResponse;
      } catch {
        throw new Error(
          `Invalid API response (HTTP ${response.status}). Check the terminal.`
        );
      }

      if (!response.ok) {
        setMessage(
          result.error ||
            `Collection creation failed (HTTP ${response.status}).`
        );
        return;
      }

      if (!result.collection) {
        throw new Error("The API did not return the created collection.");
      }

      const createdCollection = result.collection;

      setCollections((current) =>
        [...current.filter((item) => item.id !== createdCollection.id), createdCollection]
          .filter((item) => item.is_active !== false)
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      setCollectionId(createdCollection.id);
      setNewCollectionName("");
      setNewCollectionDescription("");
      setShowNewCollection(false);
      setMessage("Collection created successfully!");
    } catch (error) {
      console.error("Collection creation error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create collection."
      );
    } finally {
      setCreatingCollection(false);
    }
  };

  // --------------------------------------------------
  // REMOVE COLLECTION
  // --------------------------------------------------

  const handleRemoveCollection = async (collection: Collection) => {
    const confirmed = window.confirm(
      `Remove "${collection.name}"? Products assigned to it should remain in your store.`
    );

    if (!confirmed) return;

    setDeletingCollectionId(collection.id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/collections", {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: collection.id,
        }),
      });

      const responseText = await response.text();

      let result: CollectionApiResponse;

      try {
        result = JSON.parse(responseText) as CollectionApiResponse;
      } catch {
        throw new Error(
          `Invalid API response (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            `Unable to remove collection (HTTP ${response.status}).`
        );
      }

      setCollections((current) =>
        current.filter((item) => item.id !== collection.id)
      );

      if (collectionId === collection.id) {
        setCollectionId("");
      }

      setMessage("Collection removed successfully!");
    } catch (error) {
      console.error("Collection removal error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to remove collection."
      );
    } finally {
      setDeletingCollectionId(null);
    }
  };

  // --------------------------------------------------
  // MAIN IMAGE SELECTION
  // --------------------------------------------------

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }

    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
    setMessage("");
  };

  // --------------------------------------------------
  // ADDITIONAL IMAGE SELECTION
  // --------------------------------------------------

  const handleAdditionalImagesChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setMessage("Please select valid image files only.");
      e.target.value = "";
      return;
    }

    additionalImagePreviews.forEach((url) => URL.revokeObjectURL(url));

    setAdditionalImageFiles(files);
    setAdditionalImagePreviews(
      files.map((file) => URL.createObjectURL(file))
    );
    setMessage("");
  };

  // --------------------------------------------------
  // UPLOAD IMAGE TO SUPABASE STORAGE
  // --------------------------------------------------

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // --------------------------------------------------
  // CREATE PRODUCT
  // --------------------------------------------------

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim() || !category.trim()) {
      setMessage("Please fill in the required product information.");
      return;
    }

    if (!price.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) {
      setMessage("Please enter a valid product price.");
      return;
    }

    if (
      originalPrice.trim() &&
      (!Number.isFinite(Number(originalPrice)) || Number(originalPrice) < 0)
    ) {
      setMessage("Please enter a valid original price.");
      return;
    }

    if (!collectionId) {
      setMessage("Please select a collection.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // MAIN IMAGE
      let mainImageUrl: string | null = null;

      if (mainImageFile) {
        setMessage("Uploading main image...");
        mainImageUrl = await uploadImage(mainImageFile);
      }

      // ADDITIONAL IMAGES
      let additionalImageUrls: string[] = [];

      if (additionalImageFiles.length > 0) {
        setMessage("Uploading additional images...");

        additionalImageUrls = await Promise.all(
          additionalImageFiles.map((file) => uploadImage(file))
        );
      }

      // VARIANTS
      const sizeArray = sizes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const colorArray = colors
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      // INSERT PRODUCT
      setMessage("Creating product...");

      const { error } = await supabase.from("products").insert([
        {
          name: name.trim(),
          slug: slug.trim(),
          category: category.trim(),
          collection_id: collectionId || null,
          price: Number(price),
          original_price: originalPrice.trim()
            ? Number(originalPrice)
            : null,
          description: description.trim() || null,
          image: mainImageUrl,
          images: additionalImageUrls,
          sizes: sizeArray,
          colors: colorArray,
          featured,
          is_new: isNew,
          in_stock: inStock,
        },
      ]);

      if (error) {
        console.error("Create product error:", error);
        throw new Error(error.message);
      }

      setMessage("Product created successfully!");

      window.setTimeout(() => {
        window.location.href = "/admin/products";
      }, 1000);
    } catch (error) {
      console.error("Product creation error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the product."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // MESSAGE STYLING
  // --------------------------------------------------

  const isSuccess = message.toLowerCase().includes("successfully");
  const isProgress =
    message.includes("Uploading") || message.includes("Creating");

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* HEADER */}

        <div className="mb-8">
          <Link
            href="/admin/products"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            ← Back to Products
          </Link>

          <h1 className="mt-5 text-3xl font-semibold">Add Product</h1>

          <p className="mt-2 text-gray-500">
            Add a new product to your No Name store.
          </p>
        </div>

        {/* PRODUCT FORM */}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* BASIC INFORMATION */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Basic Information</h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* PRODUCT NAME */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Product Name *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => generateSlug(e.target.value)}
                  placeholder="Bluetooth Speaker"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              {/* SLUG */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Slug *
                </label>

                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="bluetooth-speaker"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category *
                </label>

                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Speakers"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              {/* COLLECTION */}

              <div className="md:col-span-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <label className="block text-sm font-medium">
                      Collection *
                    </label>

                    <p className="mt-1 text-xs text-gray-500">
                      Choose where this product will appear in your store.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNewCollection((value) => !value)}
                    className="w-fit rounded-lg border border-black px-4 py-2 text-xs font-medium transition hover:bg-black hover:text-white"
                  >
                    {showNewCollection
                      ? "Cancel"
                      : "+ Create New Collection"}
                  </button>
                </div>

                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  required
                  disabled={loadingCollections}
                  className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingCollections
                      ? "Loading collections..."
                      : "Select a collection"}
                  </option>

                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>

                {/* MANAGE COLLECTIONS */}

                {collections.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-4">
                      <p className="text-sm font-medium">
                        Manage Collections
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Removing a collection should not delete its products.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {collections.map((collection) => (
                        <div
                          key={collection.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-black">
                              {collection.name}
                            </p>

                            {collection.description && (
                              <p className="mt-1 truncate text-xs text-gray-400">
                                {collection.description}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCollection(collection)}
                            disabled={
                              deletingCollectionId === collection.id
                            }
                            className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingCollectionId === collection.id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CREATE COLLECTION FORM */}

                {showNewCollection && (
                  <div className="mt-4 rounded-2xl border border-black/10 bg-[#f7f7f5] p-5">
                    <h3 className="font-medium">Create New Collection</h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Example: Toys, Beauty, Sports, Books
                    </p>

                    <div className="mt-4 space-y-4">
                      <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Collection name"
                        maxLength={100}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                      />

                      <textarea
                        value={newCollectionDescription}
                        onChange={(e) =>
                          setNewCollectionDescription(e.target.value)
                        }
                        placeholder="Short description (optional)"
                        rows={3}
                        maxLength={500}
                        className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                      />

                      <button
                        type="button"
                        onClick={handleCreateCollection}
                        disabled={creatingCollection}
                        className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {creatingCollection
                          ? "Creating..."
                          : "Create Collection"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PRICE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price (₹) *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="999"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              {/* ORIGINAL PRICE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Original Price (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="1499"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>
            </div>

            {/* DESCRIPTION */}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
                rows={5}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </section>

          {/* PRODUCT IMAGES */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Product Images</h2>

            <p className="mt-2 text-sm text-gray-500">
              Upload product photos from your computer.
            </p>

            <div className="mt-6 space-y-8">
              {/* MAIN IMAGE */}

              <div>
                <label className="mb-3 block text-sm font-medium">
                  Main Product Image
                </label>

                <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-black hover:bg-gray-100">
                  {mainImagePreview ? (
                    <img
                      src={mainImagePreview}
                      alt="Main product preview"
                      className="max-h-56 max-w-full rounded-xl object-contain"
                    />
                  ) : (
                    <>
                      <div className="text-4xl">📷</div>
                      <p className="mt-3 font-medium">
                        Click to upload main image
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        JPG, PNG or WEBP
                      </p>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                </label>

                {mainImageFile && (
                  <p className="mt-2 text-xs text-gray-500">
                    Selected: {mainImageFile.name}
                  </p>
                )}
              </div>

              {/* ADDITIONAL IMAGES */}

              <div>
                <label className="mb-3 block text-sm font-medium">
                  Additional Product Images
                </label>

                <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-black hover:bg-gray-100">
                  <div className="text-4xl">🖼️</div>

                  <p className="mt-3 font-medium">
                    Click to upload multiple images
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    You can select multiple photos
                  </p>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="hidden"
                  />
                </label>

                {additionalImagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {additionalImagePreviews.map((preview, index) => (
                      <div
                        key={preview}
                        className="overflow-hidden rounded-xl border border-gray-200"
                      >
                        <img
                          src={preview}
                          alt={`Product image ${index + 1}`}
                          className="h-32 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {additionalImageFiles.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    {additionalImageFiles.length} additional image(s)
                    selected.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* OPTIONAL VARIANTS */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Variants</h2>

            <p className="mt-2 text-sm text-gray-500">
              Optional. Leave these fields empty if your product has no sizes
              or colors.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Sizes <span className="text-xs text-gray-400">Optional</span>
                </label>

                <input
                  type="text"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  placeholder="S, M, L, XL"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Example: S, M, L, XL
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Colors <span className="text-xs text-gray-400">Optional</span>
                </label>

                <input
                  type="text"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  placeholder="Black, White, Blue"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Example: Black, White, Blue
                </p>
              </div>
            </div>
          </section>

          {/* PRODUCT STATUS */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Product Status</h2>

            <div className="mt-6 space-y-5">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-5 w-5"
                />

                <span>
                  <span className="block font-medium">Featured Product</span>
                  <span className="text-sm text-gray-500">
                    Show this product in featured sections.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="h-5 w-5"
                />

                <span>
                  <span className="block font-medium">New Product</span>
                  <span className="text-sm text-gray-500">
                    Mark this product as new.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-5 w-5"
                />

                <span>
                  <span className="block font-medium">In Stock</span>
                  <span className="text-sm text-gray-500">
                    Customers can purchase this product.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* STATUS MESSAGE */}

          {message && (
            <div
              role="status"
              className={`rounded-xl border p-4 text-sm ${
                isSuccess
                  ? "border-green-200 bg-green-50 text-green-700"
                  : isProgress
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* FORM BUTTONS */}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/products"
              className="rounded-xl border border-gray-300 px-6 py-3 text-center text-sm font-medium transition hover:bg-gray-100"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || loadingCollections || collections.length === 0}
              className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating Product..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}