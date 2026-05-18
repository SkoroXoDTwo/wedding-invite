"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session").then((response) => {
      if (!response.ok && pathname !== "/admin/login") {
        router.replace("/admin/login");
      } else {
        setIsReady(true);
      }
    });
  }, [pathname, router]);

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isReady) {
    return <div className="admin-shell"><main className="admin-main">Проверяем доступ...</main></div>;
  }

  return (
    <div className="admin-shell">
      <nav className="admin-nav">
        <strong>Wedding Admin</strong>
        <div className="admin-links">
          <Link href="/admin">Обзор</Link>
          <Link href="/admin/content">Контент</Link>
          <Link href="/admin/guests">Гости</Link>
          <Link href="/admin/responses">Ответы</Link>
          <button type="button" onClick={signOut}>
            Выйти
          </button>
        </div>
      </nav>
      <main className="admin-main">{children}</main>
    </div>
  );
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers =
    init?.body instanceof FormData
      ? init?.headers
      : {
          "content-type": "application/json",
          ...init?.headers
        };

  return fetch(input, {
    ...init,
    credentials: "include",
    headers
  });
}
