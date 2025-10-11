// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PLAN_META } from "../lib/subscription";

const baseNavItems = [
  { to: "/lesson", label: "Lesson" },
  { to: "/menu", label: "Menu" },
  { to: "/blog", label: "Blog" },
];

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-3 py-1.5 rounded-xl transition-colors",
          "text-gray-300 hover:text-white visited:text-inherit",
          !isActive && "hover:bg-white/5",
          isActive && "text-black font-semibold",
        ]
          .filter(Boolean)
          .join(" ")
      }
      style={({ isActive }) =>
        isActive ? { backgroundColor: "#00B3A4" } : undefined
      }
    >
      {label}
    </NavLink>
  );
}

/* === Programs dropdown: click-to-open, dễ bấm === */
function ProgramsMenu() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (
        !menuRef.current?.contains(e.target) &&
        !btnRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const items = [
    { label: "Fatloss", to: "/program/fatloss" },
    { label: "Strength", to: "/program/strength" },
    { label: "Yoga", to: "/program/yoga" },
  ];

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          "px-3 py-1.5 rounded-xl transition-colors",
          "text-gray-300 hover:text-white hover:bg-white/5",
          "inline-flex items-center gap-1.5",
        ].join(" ")}
      >
        Programs
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute left-0 mt-2 w-60 rounded-2xl border border-[#1c2227] bg-[#0f1214] shadow-2xl p-2"
        >
          {items.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center justify-between rounded-lg px-3 py-3 text-[15px]",
                  "hover:bg-white/5 focus:bg-white/5 focus:outline-none",
                  "text-gray-200",
                  isActive && "bg-white/10 font-semibold",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {i.label}
              <span className="text-xs text-gray-500">→</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout, currentPlan } = useAuth();
  const meta = PLAN_META[currentPlan] || PLAN_META.free;

  useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const initial = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-[#1c2227] bg-[#0f1214]/80 backdrop-blur">
      <nav className="container h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="font-extrabold tracking-tight">
          <div className="flex items-center gap-2">
            <img
              src="/images/home/logo.png"
              alt="TripleTwo logo"
              className="h-6 w-6 rounded-sm object-contain"
              aria-hidden="true"
            />
            <div className="leading-none">
              <span className="text-white">Triple</span>
              <span className="text-[#00B3A4]">Two</span>
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          {baseNavItems.map((it) => (
            <NavItem key={it.to} {...it} />
          ))}
          <ProgramsMenu />
          <NavItem to="/pricing" label="Pricing" />
          {user?.role === "ADMIN" && (
            <NavItem to="/admin/users" label="Admin" />
          )}
        </div>

        {/* User menu */}
        <div
          className="hidden md:flex items-center gap-3 relative"
          ref={menuRef}
        >
          {user ? (
            <>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5"
                title={user.email}
              >
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-black font-semibold"
                      style={{ backgroundColor: "#00B3A4" }}
                    >
                      {initial}
                    </div>
                  )}
                  <span
                    className="absolute -right-1 -bottom-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-black/30"
                    style={{ backgroundColor: meta.color, color: "#000" }}
                  >
                    {meta.abbr}
                  </span>
                </div>
                <div className="text-sm text-gray-200 max-w-[160px] truncate">
                  {user.name || user.email}
                </div>
              </button>

              {open && (
                <div className="absolute right-0 top-12 w-56 rounded-xl border border-[#1c2227] bg-[#0f1214] shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#1c2227]">
                    <div className="text-sm font-semibold truncate">
                      {user.name || "User"}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {user.email}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: meta.color, color: "#000" }}
                      >
                        {meta.name}
                      </span>
                      {user.subscription?.billing && (
                        <span className="text-xs text-gray-400">
                          ({user.subscription.billing})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-1">
                    <NavLink
                      to="/account"
                      className="block px-3 py-2 rounded-lg text-sm hover:bg-white/5"
                      onClick={() => setOpen(false)}
                    >
                      Account settings
                    </NavLink>
                    <NavLink
                      to="/lesson"
                      className="block px-3 py-2 rounded-lg text-sm hover:bg-white/5"
                      onClick={() => setOpen(false)}
                    >
                      My lessons
                    </NavLink>
                    <NavLink
                      to="/program/fatloss"
                      className="block px-3 py-2 rounded-lg text-sm hover:bg-white/5"
                      onClick={() => setOpen(false)}
                    >
                      Programs
                    </NavLink>
                    {user?.role === "ADMIN" && (
                      <NavLink
                        to="/admin/users"
                        className="block px-3 py-2 rounded-lg text-sm hover:bg-white/5"
                        onClick={() => setOpen(false)}
                      >
                        Manage User Account
                      </NavLink>
                    )}
                    <button
                      onClick={() => {
                        setOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-white/5"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="px-3 py-1.5 rounded-xl text-gray-300 hover:text-white visited:text-inherit"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="px-3 py-1.5 rounded-xl font-semibold text-black"
                style={{ backgroundColor: "#00B3A4" }}
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
