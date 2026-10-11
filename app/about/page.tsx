import Link from "next/link";
import Navbar from "../components/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f5] !text-[#111]">
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="max-w-4xl">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] !text-neutral-500">
              About NO NAME
            </p>

            <h1 className="text-5xl font-semibold tracking-tight !text-[#111] md:text-7xl">
              Nothing Ordinary.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 !text-neutral-600 md:text-xl">
              NO NAME is a curated destination for products worth keeping —
              thoughtfully selected for quality, usefulness and everyday
              appeal.
            </p>
          </div>
        </section>

        {/* STORY — BLACK SECTION */}
        <section className="bg-black px-6 py-20 !text-white md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 md:grid-cols-2 md:items-start">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] !text-neutral-400">
                  The NO NAME edit
                </p>

                <h2 className="mt-5 text-4xl font-semibold tracking-tight !text-white md:text-5xl">
                  Less noise.
                  <br />
                  More choice.
                </h2>
              </div>

              <div className="max-w-xl">
                <p className="text-lg leading-8 !text-neutral-300">
                  We search for pieces worth keeping — products chosen for
                  quality, usefulness and everyday appeal.
                </p>

                <p className="mt-6 text-lg leading-8 !text-neutral-300">
                  No unnecessary clutter. No endless scrolling. Just a
                  considered collection of products designed to fit naturally
                  into modern living.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="max-w-3xl">
            <p className="text-4xl font-semibold tracking-tight !text-[#111] md:text-5xl">
              Everything considered.
            </p>

            <p className="mt-6 text-lg leading-8 !text-neutral-600">
              Great products don't need to shout. They simply need to be
              thoughtfully chosen.
            </p>

            <Link
              href="/shop"
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-medium !text-white no-underline transition-all duration-200 hover:bg-neutral-800 hover:!text-white"
            >
              <span className="!text-white">Explore the edit</span>

              <span className="!text-white transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="border-t border-neutral-200 px-6 py-16">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold !text-[#111]">
                Find something different.
              </h2>

              <p className="mt-2 !text-neutral-600">
                Discover the latest NO NAME collection.
              </p>
            </div>

            <Link
              href="/shop"
              className="group inline-flex w-fit items-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-medium !text-white no-underline transition-all duration-200 hover:bg-neutral-800 hover:!text-white"
            >
              <span className="!text-white">Shop Collection</span>

              <span className="!text-white transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}