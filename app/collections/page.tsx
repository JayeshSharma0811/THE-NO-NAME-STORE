import Link from "next/link";
import { supabase } from "../lib/supabase";

type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
};

export default async function CollectionsPage() {
  const { data: collections, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, image")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Collections loading error:", error);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5]">

      {/* Hero */}
      <section className="border-b border-black/10 px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.25em] text-black/40">
            NO NAME
          </p>

          <h1 className="max-w-3xl text-5xl font-medium tracking-[-0.06em] sm:text-7xl">
            Collections
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-6 text-black/50 sm:text-base">
            Explore thoughtfully selected collections made for modern living.
            Nothing ordinary. Everything considered.
          </p>
        </div>
      </section>

      {/* Collections */}
      <section className="px-5 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">

          {collections && collections.length > 0 ? (
            <div className="grid grid-cols-1 gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group relative min-h-[300px] overflow-hidden bg-white transition-all duration-300 hover:bg-black"
                >
                  {/* Image */}
                  {collection.image ? (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#eeeeeb] via-[#f7f7f5] to-[#deded9] transition-transform duration-500 group-hover:scale-105" />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/55" />

                  {/* Content */}
                  <div className="relative flex h-full min-h-[300px] flex-col justify-between p-7">

                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/40 transition-colors group-hover:text-white/60">
                        Collection
                      </span>

                      <span className="text-lg text-black/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white">
                        →
                      </span>
                    </div>

                    <div>
                      <h2 className="text-3xl font-medium tracking-[-0.04em] text-black transition-colors duration-300 group-hover:text-white">
                        {collection.name}
                      </h2>

                      {collection.description && (
                        <p className="mt-3 max-w-sm text-sm leading-5 text-black/50 transition-colors duration-300 group-hover:text-white/70">
                          {collection.description}
                        </p>
                      )}
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-black/10 bg-white px-6 py-20 text-center">
              <h2 className="text-2xl font-medium tracking-[-0.03em]">
                No collections available
              </h2>

              <p className="mt-3 text-sm text-black/50">
                Collections created from the admin panel will appear here.
              </p>

              <Link
                href="/shop"
                className="mt-8 inline-flex bg-black px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-80"
              >
                Continue Shopping
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* Bottom statement */}
      <section className="border-t border-black/10 px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-3xl tracking-[-0.04em] sm:text-5xl">
            Nothing ordinary.
            <br />
            <span className="text-black/30">
              Everything considered.
            </span>
          </p>
        </div>
      </section>

    </main>
  );
}