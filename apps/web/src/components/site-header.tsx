"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { apiFetch, ApiError } from "../lib/api";

type AuthUser = {
  role: "employee" | "admin";
};

type MeProfileResponse = {
  user: {
    role: "employee" | "admin";
  };
};

type Theme = "light" | "dark";

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("light");

  // Read initial theme from DOM (set by anti-FOUC script in layout)
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as Theme | null;
    if (current === "dark" || current === "light") {
      setTheme(current);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore storage errors
    }
  }

  useEffect(() => {
    if (pathname.startsWith("/p/")) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    apiFetch<MeProfileResponse>("/me/profile")
      .then((data) => {
        if (!cancelled) {
          setAuthUser({ role: data.user.role });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            setAuthUser(null);
          } else {
            setAuthUser(null);
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const isPublicProfilePage = pathname.startsWith("/p/");

  // Keep your improved logic: skip nav entirely for public pages
  const links = useMemo(() => {
    if (loading || isPublicProfilePage) {
      return [] as Array<{ href: string; label: string }>;
    }

    if (!authUser) {
      return [
        { href: "/register", label: "Register" },
        { href: "/login", label: "Login" }
      ];
    }

    const result: Array<{ href: string; label: string }> = [{ href: "/me/profile", label: "My Profile" }];
    if (authUser.role === "admin") {
      result.push({ href: "/admin/users", label: "Admin" });
    }
    return result;
  }, [authUser, isPublicProfilePage, loading]);

  // Hide header entirely on public profile pages
  if (isPublicProfilePage) return null;

  return (
    <header className="site-header">
      <div className="site-header-row">
        <Link href="/" className="brand brand-link" aria-label="Go to home">
          <div className="brand-chip">BOT</div>
          <h1 className="brand-title">BOT Name Card</h1>
        </Link>

        <nav className="nav-links">
          {links.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={isActive ? "active" : undefined}>
                {item.label}
              </Link>
            );
          })}

          {authUser && !loading && (
            <button
              type="button"
              className="nav-btn"
              onClick={async () => {
                await apiFetch("/auth/logout", { method: "POST" });
                setAuthUser(null);
                router.push("/login");
              }}
            >
              Logout
            </button>
          )}

          {/* Theme toggle */}
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>
      </div>
    </header>
  );
}
