
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }

    const authenticated =
      sessionStorage.getItem("no-name-admin-auth") === "true";

    if (!authenticated) {
      router.replace("/admin/login");
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking && pathname !== "/admin/login") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <p className="text-sm text-black/50">
          Checking admin access...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}