import React from "react";
import { createRoot } from "react-dom/client";
import { AdminShell } from "./components/admin-shell";
import { PublicInviteLoader } from "./public-invite-loader";
import AdminContentPage from "./pages/admin-content";
import AdminDashboardPage from "./pages/admin-dashboard";
import AdminGuestsPage from "./pages/admin-guests";
import LoginPage from "./pages/admin-login";
import AdminResponsesPage from "./pages/admin-responses";
import "./styles/globals.css";

function getRoute() {
  const pathname = window.location.pathname;

  if (pathname === "/" || pathname === "/invite") {
    return <PublicInviteLoader />;
  }

  const inviteMatch = pathname.match(/^\/invite\/([^/]+)$/);
  if (inviteMatch) {
    return <PublicInviteLoader token={decodeURIComponent(inviteMatch[1])} />;
  }

  if (pathname.startsWith("/admin")) {
    let page: React.ReactNode;

    switch (pathname) {
      case "/admin/login":
        page = <LoginPage />;
        break;
      case "/admin/content":
        page = <AdminContentPage />;
        break;
      case "/admin/guests":
        page = <AdminGuestsPage />;
        break;
      case "/admin/responses":
        page = <AdminResponsesPage />;
        break;
      case "/admin":
      default:
        page = <AdminDashboardPage />;
        break;
    }

    return <AdminShell>{page}</AdminShell>;
  }

  return <PublicInviteLoader />;
}

function App() {
  const [, forceRender] = React.useReducer((value) => value + 1, 0);

  React.useEffect(() => {
    const onPopState = () => forceRender();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return getRoute();
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
