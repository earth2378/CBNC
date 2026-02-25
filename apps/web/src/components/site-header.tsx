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

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (isPublicProfilePage) return null;

  return (
    <header className="site-header">
      <div className="site-header-row">
        <Link href="/" className="brand brand-link" aria-label="Go to home">
          <div className="brand-chip">BOT</div>
          <h1 className="brand-title">CBNC Employee Name Card</h1>
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
        </nav>
      </div>
    </header>
  );
}
