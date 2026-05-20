import { useEffect, useState } from "react";

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    fetch("/api/admin/session").then((response) => {
      if (!response.ok && pathname !== "/admin/login") {
        navigate("/admin/login");
      } else {
        setIsReady(true);
      }
    });
  }, [pathname]);

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    navigate("/admin/login");
  }

  function onNavClick(event: React.MouseEvent<HTMLAnchorElement>, path: string) {
    event.preventDefault();
    navigate(path);
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isReady) {
    return (
      <div className="admin-shell">
        <main className="admin-main">Проверяем доступ...</main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <nav className="admin-nav">
        <strong>Wedding Admin</strong>
        <div className="admin-links">
          <a href="/admin" onClick={(event) => onNavClick(event, "/admin")}>
            Обзор
          </a>
          <a href="/admin/content" onClick={(event) => onNavClick(event, "/admin/content")}>
            Контент
          </a>
          <a href="/admin/guests" onClick={(event) => onNavClick(event, "/admin/guests")}>
            Гости
          </a>
          <a href="/admin/responses" onClick={(event) => onNavClick(event, "/admin/responses")}>
            Ответы
          </a>
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
