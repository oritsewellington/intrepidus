import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Menu, X, LogOut, LayoutDashboard, Trophy } from "lucide-react";
import {
  selectIsAuth,
  selectUserRole,
  selectCurrentUser,
  logout,
} from "../../store/slices/authSlice.js";
import { apiSlice } from "../../store/api/apiSlice.js";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Vote Now" },
  { to: "/polls", label: "Results" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const role = useSelector(selectUserRole);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-sm">
      <nav className="page-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-ember-400/40 blur-lg rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-ember-300 via-ember-500 to-ember-700 flex items-center justify-center shadow-ember ring-1 ring-ember-200/50 group-hover:scale-105 group-hover:rotate-[-4deg] transition-transform duration-300">
              <div className="absolute inset-[3px] rounded-[9px] border border-white/25" />
              <span
                className="font-display relative z-10 text-white font-extrabold text-sm tracking-tight"
                aria-hidden="true"
              >
                IX
              </span>
            </div>
          </div>

          <div className="leading-none">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-lg tracking-tight text-zinc-900">
                INTREPIDUS
              </span>
              <span className="font-display font-medium text-lg tracking-tight text-zinc-400">
                Awards
              </span>
            </div>
            <span className="inline-flex items-center mt-1 px-1.5 py-[1px] rounded-full text-[9px] font-bold tracking-widest bg-ember-50 text-ember-700 border border-ember-200">
              2026 EDITION
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => {
            const isResults = to === "/polls";
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-ember-700 bg-ember-50"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                {isResults && (
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                )}
                {label}
              </Link>
            );
          })}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          {isAuth ? (
            <>
              <Link
                to={role === "admin" ? "/admin" : "/organizer"}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-5">
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden p-2 rounded-lg text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 top-16 z-40 bg-black/30 animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-white border-t border-zinc-100 shadow-lg animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="page-container py-4 space-y-1">
              {NAV_LINKS.map(({ to, label }) => {
                const isResults = to === "/polls";
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive
                        ? "bg-ember-50 text-ember-700"
                        : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    {isResults && (
                      <Trophy size={15} className="text-ember-500" />
                    )}
                    {label}
                    {isResults && (
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse ml-auto" />
                    )}
                  </Link>
                );
              })}
              <div className="border-t border-zinc-100 pt-2 mt-2">
                {isAuth ? (
                  <>
                    <Link
                      to={role === "admin" ? "/admin" : "/organizer"}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-sm font-semibold text-ember-600 hover:bg-ember-50 rounded-xl"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
