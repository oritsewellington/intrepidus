import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Menu, X, LogOut, LayoutDashboard, Trophy, Drama } from "lucide-react";
import {
  selectIsAuth,
  selectUserRole,
  selectCurrentUser,
  logout,
} from "../../store/slices/authSlice.js";
import { apiSlice } from "../../store/api/apiSlice.js";

const DISPLAY_FONT = { fontFamily: "'Playfair Display', Georgia, serif" };

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
    <header className="sticky top-0 z-50 bg-[#FBF7EE]/95 backdrop-blur-md border-b border-[#C7A34C]/25 shadow-sm">
      <nav className="page-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-[#C7A34C]/40 blur-lg rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-10 h-10 rounded-sm bg-gradient-to-br from-[#8A2C42] via-[#6E1423] to-[#3D0B14] flex items-center justify-center shadow-md ring-1 ring-[#C7A34C]/40 group-hover:scale-105 group-hover:rotate-[-4deg] transition-transform duration-300">
              <div className="absolute inset-[3px] rounded-sm border border-[#C7A34C]/30" />
              <Drama size={18} className="relative z-10 text-[#F4ECDA]" />
            </div>
          </div>

          <div className="leading-none">
            <div className="flex items-baseline gap-1.5">
              <span
                style={DISPLAY_FONT}
                className="font-bold italic text-lg tracking-tight text-[#241A15]"
              >
                TASA
              </span>
              <span
                style={DISPLAY_FONT}
                className="italic text-lg tracking-tight text-[#8A7A64]"
              >
                Awards
              </span>
            </div>
            <span className="inline-flex items-center mt-1 px-1.5 py-[1px] rounded-full text-[9px] font-bold tracking-widest bg-[#6E1423]/10 text-[#6E1423] border border-[#6E1423]/20">
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#6E1423] bg-[#6E1423]/10"
                    : "text-[#5C4A3A] hover:text-[#241A15] hover:bg-[#241A15]/5"
                }`}
              >
                {isResults && (
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm font-medium text-[#5C4A3A] hover:bg-[#241A15]/5 transition-colors"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 py-2 px-5 rounded-sm bg-[#6E1423] text-[#F4ECDA] text-sm font-semibold hover:bg-[#7A1830] transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden p-2 rounded-sm text-[#241A15] hover:bg-[#241A15]/5 transition-colors"
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
          <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-[#FBF7EE] border-t border-[#C7A34C]/25 shadow-lg animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="page-container py-4 space-y-1">
              {NAV_LINKS.map(({ to, label }) => {
                const isResults = to === "/polls";
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-4 py-3 rounded-sm text-sm font-medium ${
                      isActive
                        ? "bg-[#6E1423]/10 text-[#6E1423]"
                        : "text-[#5C4A3A] hover:bg-[#241A15]/5"
                    }`}
                  >
                    {isResults && (
                      <Trophy size={15} className="text-[#6E1423]" />
                    )}
                    {label}
                    {isResults && (
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse ml-auto" />
                    )}
                  </Link>
                );
              })}
              <div className="border-t border-[#C7A34C]/25 pt-2 mt-2">
                {isAuth ? (
                  <>
                    <Link
                      to={role === "admin" ? "/admin" : "/organizer"}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#5C4A3A] hover:bg-[#241A15]/5 rounded-sm"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-sm"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-sm font-semibold text-[#6E1423] hover:bg-[#6E1423]/10 rounded-sm"
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
