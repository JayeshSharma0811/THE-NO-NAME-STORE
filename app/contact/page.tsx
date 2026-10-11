import Link from "next/link";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#f7f7f5] text-[#111111]">
            <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">

                {/* Header */}
                <div className="max-w-2xl">
                    <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-black/40">
                        Contact
                    </p>

                    <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
                        Get in touch.
                    </h1>

                    <p className="mt-6 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
                        Have a question about an order, product, or anything else?
                        We&apos;re here to help.
                    </p>
                </div>

                {/* Contact Details */}
                <div className="mt-16 border-t border-black/10">

                    <div className="grid border-b border-black/10 py-8 sm:grid-cols-2 sm:py-10">
                        <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                            Email
                        </p>

                        <a
                            href="mailto:support@thenonamestore.com"
                            className="mt-3 text-base transition-opacity hover:opacity-50 sm:mt-0"
                        >
                            supportthenonamestore@gmail.com
                        </a>
                    </div>

                    <div className="grid border-b border-black/10 py-8 sm:grid-cols-2 sm:py-10">
                        <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                            Support
                        </p>

                        <p className="mt-3 text-sm leading-6 text-black/60 sm:mt-0">
                            For order, product and general enquiries.
                            +91 9024646910 & +91 8949484519
                        </p>
                    </div>

                    <div className="grid border-b border-black/10 py-8 sm:grid-cols-2 sm:py-10">
                        <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                            Response time
                        </p>

                        <p className="mt-3 text-sm leading-6 text-black/60 sm:mt-0">
                            We&apos;ll get back to you as soon as possible.
                        </p>
                    </div>
                </div>

                {/* Back */}
                <div className="mt-12">
                    <Link
                        href="/"
                        className="inline-block border border-black bg-white px-7 py-3 text-sm font-medium !text-black transition hover:bg-black hover:!text-white"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}