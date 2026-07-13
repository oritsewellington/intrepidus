import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Crown,
  Trophy,
  Users,
  Shield,
  ArrowRight,
  Star,
  Zap,
  ChevronRight,
  ChevronLeft,
  Award,
  Music,
  Shirt,
  BookOpen,
  Briefcase,
  Sparkles,
  Flame,
} from "lucide-react";
import { useGetEventsQuery } from "../store/api/eventsApi.js";
import { useGetCategoriesQuery } from "../store/api/categoriesApi.js";
import { useGetAllPollsQuery } from "../store/api/polls.Api.js";
import { getEventStatus, formatNumber } from "../utils/helpers.js";
import {
  EventStatusBadge,
  CountdownTimer,
  PageLoader,
} from "../components/ui/index.jsx";

const HEADING_FONT = { fontFamily: "'Sora', system-ui, sans-serif" };

const GROUP_ICONS = {
  Social: Users,
  Academic: BookOpen,
  Popularity: Star,
  Sports: Trophy,
  Leadership: Crown,
  Creative: Music,
  Fashion: Shirt,
  Business: Briefcase,
  General: Sparkles,
};

const GROUP_COLORS = {
  Social: "from-indigo-500 to-indigo-700",
  Academic: "from-violet-500 to-violet-700",
  Popularity: "from-amber-400 to-amber-600",
  Sports: "from-emerald-500 to-emerald-700",
  Leadership: "from-rose-500 to-rose-700",
  Creative: "from-pink-500 to-fuchsia-600",
  Fashion: "from-purple-500 to-violet-700",
  Business: "from-sky-500 to-indigo-600",
  General: "from-amber-500 to-orange-600",
};

const FLAGSHIP_EVENT_BANNER = "/intrepidus-flagship-banner.webp";
const DEFAULT_EVENT_BANNER = "/intrepidus-event-banner.webp";

function isFlagshipEvent(event) {
  const name = (event.category || event.title || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
  return name === "mr intrepidus" || name === "miss intrepidus";
}

const CATEGORIES_PER_PAGE = 9;
const TOP_STANDINGS_COUNT = 6;

function useWelcomeConfetti(durationMs = 6000) {
  useEffect(() => {
    const end = Date.now() + durationMs;

    const brandColors = [
      "#D9A441", // amber
      "#F3D9A4", // pale amber
      "#4C5FD9", // ink-indigo
      "#0A0C10", // near-black
      "#FFFFFF",
    ];

    const ribbonShape = confetti.shapeFromPath({
      path: "M0 0 L3 0 L3 20 L0 20 Z",
    });

    confetti({
      particleCount: 90,
      spread: 65,
      origin: { x: 0, y: 0.9 },
      colors: brandColors,
      startVelocity: 55,
      gravity: 0.9,
      scalar: 1.2,
    });

    confetti({
      particleCount: 90,
      spread: 65,
      origin: { x: 1, y: 0.9 },
      colors: brandColors,
      startVelocity: 55,
      gravity: 0.9,
      scalar: 1.2,
    });

    let frameId;

    (function frame() {
      const randomX = Math.random();

      confetti({
        particleCount: 1,
        shapes: [ribbonShape],
        colors: brandColors,
        origin: { x: randomX, y: -0.1 },
        startVelocity: 0,
        gravity: 0.4,
        drift: (Math.random() - 0.5) * 1.5,
        scalar: 1.4,
        ticks: 500,
      });

      confetti({
        particleCount: 2,
        shapes: ["circle"],
        colors: brandColors,
        origin: { x: randomX, y: -0.1 },
        startVelocity: Math.random() * 5 + 2,
        gravity: 0.5,
        drift: (Math.random() - 0.5) * 2.5,
        scalar: 0.6,
        ticks: 400,
      });

      if (Date.now() < end) {
        frameId = requestAnimationFrame(frame);
      }
    })();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [durationMs]);
}

export default function HomePage() {
  const [activeGroup, setActiveGroup] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesSectionRef = useRef(null);

  useWelcomeConfetti();

  const { data: events = [], isLoading: eventsLoading } = useGetEventsQuery({});
  const { data: categories = [], isLoading: catLoading } =
    useGetCategoriesQuery();
  const { data: polls = [], isLoading: pollsLoading } =
    useGetAllPollsQuery(undefined);

  const statsLoading = eventsLoading || catLoading;

  const totalCategories = categories.length;
  const categoryGroups = [...new Set(categories.map((c) => c.group))].filter(
    Boolean,
  );

  const liveEvents = events.filter(
    (e) => getEventStatus(e.startDate, e.endDate, e.isOpen) === "open",
  );
  const totalVotesAcrossEvents = events.reduce(
    (s, e) => s + (e.totalVotes || 0),
    0,
  );

  const topStandings = useMemo(() => {
    return polls
      .filter((p) => p.leaderName && p.totalVotes > 0)
      .map((p) => ({
        ...p,
        percent:
          p.leaderVotes != null ? (p.leaderVotes / p.totalVotes) * 100 : null,
      }))
      .sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0))
      .slice(0, TOP_STANDINGS_COUNT);
  }, [polls]);

  const filteredCategories =
    activeGroup === "All"
      ? categories
      : categories.filter((c) => c.group === activeGroup);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeGroup]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * CATEGORIES_PER_PAGE;
  const paginatedCategories = filteredCategories.slice(
    startIdx,
    startIdx + CATEGORIES_PER_PAGE,
  );

  const goToPage = (page) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
    categoriesSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      {/* Local, self-contained animation + font utilities — no dependency
          on external tailwind.config tokens. */}
      <style>{`
        @keyframes ixFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes ixFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        @keyframes ixPulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217,164,65,0.45); }
          50% { box-shadow: 0 0 0 14px rgba(217,164,65,0); }
        }
        @keyframes ixSpinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ix-fade-in { animation: ixFadeIn .7s ease-out both; }
        .ix-float { animation: ixFloat 6s ease-in-out infinite; }
        .ix-pulse-glow { animation: ixPulseGlow 2.4s ease-in-out infinite; }
        .ix-spin-slow { animation: ixSpinSlow 30s linear infinite; }
      `}</style>

      <div className="ix-fade-in">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0A0C10]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* dot lattice */}
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.07]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="ix-dots"
                  width="28"
                  height="28"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1.5" cy="1.5" r="1.5" fill="#D9A441" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ix-dots)" />
            </svg>

            {/* asymmetric blurred blobs */}
            <div
              className="absolute w-[420px] h-[420px] rounded-full bg-amber-500/20 blur-[110px]"
              style={{ top: "-12%", right: "-8%" }}
            />
            <div
              className="absolute w-[320px] h-[320px] rounded-full bg-indigo-600/25 blur-[100px]"
              style={{ bottom: "-10%", left: "-6%" }}
            />

            {/* rotated diamond accent */}
            <div
              className="ix-spin-slow absolute w-40 h-40 border border-amber-400/20 rounded-[28%]"
              style={{ top: "8%", left: "6%" }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-24">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
              {/* ── Left: message + CTA ─────────────────────────────── */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 bg-amber-400/10 border border-amber-400/25 rounded-full text-amber-300 text-[10px] sm:text-xs font-bold tracking-wide sm:tracking-[0.18em] uppercase mb-8 ix-fade-in max-w-full text-center leading-snug">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full animate-pulse flex-shrink-0" />
                  <span className="whitespace-normal">
                    Class of INTREPIDUS Awards 2026 — University of Benin
                  </span>
                </div>

                <h1
                  style={HEADING_FONT}
                  className="text-5xl sm:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-6 text-balance"
                >
                  <span className="block">Honor the</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-indigo-400">
                    Bold &amp;
                  </span>
                  <span className="block">Brilliant</span>
                </h1>

                <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto lg:mx-0 mb-10 font-light leading-relaxed">
                  {statsLoading ? (
                    <span className="inline-block h-6 w-64 max-w-full bg-white/10 rounded-md animate-pulse align-middle" />
                  ) : (
                    <>
                      {totalCategories} award categories. Vote for the boldest
                      minds, leaders, artists, and icons of the Faculty of Arts,
                      UNIBEN.
                    </>
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="#categories"
                    className="ix-pulse-glow group inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-[#1A1204] font-semibold text-sm sm:text-base shadow-[0_15px_40px_-10px_rgba(217,164,65,0.55)] hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-8px_rgba(217,164,65,0.7)] transition-all duration-300 w-full sm:w-auto"
                  >
                    <Trophy size={18} className="flex-shrink-0" />
                    <span>Find Your Category</span>
                    <ArrowRight
                      size={16}
                      className="flex-shrink-0 group-hover:translate-x-1 transition-transform"
                    />
                  </a>

                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-10 sm:py-4 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur text-white font-medium text-sm sm:text-base hover:bg-white/10 hover:border-white/25 transition-all duration-300 w-full sm:w-auto"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* ── Right: brand emblem (no banner asset needed) ─────── */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative ix-float">
                  <div className="absolute -inset-10 bg-gradient-to-br from-amber-500/25 to-indigo-600/20 blur-3xl rounded-full pointer-events-none" />

                  {/* rotating dashed ring */}
                  <div className="ix-spin-slow absolute -inset-5 sm:-inset-6 rounded-full border-2 border-dashed border-amber-400/20 pointer-events-none" />

                  {/* medallion */}
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-[#181B24] to-[#0A0C10] border border-white/10 shadow-2xl shadow-black/60 flex items-center justify-center overflow-hidden">
                    {/* compass rosette */}
                    <svg
                      className="absolute inset-0 w-full h-full opacity-30"
                      viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="100"
                        cy="100"
                        r="92"
                        fill="none"
                        stroke="#D9A441"
                        strokeWidth="0.5"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="76"
                        fill="none"
                        stroke="#4C5FD9"
                        strokeWidth="0.5"
                      />
                      {Array.from({ length: 24 }).map((_, i) => (
                        <line
                          key={i}
                          x1="100"
                          y1="8"
                          x2="100"
                          y2={i % 6 === 0 ? "20" : "15"}
                          stroke="#D9A441"
                          strokeWidth={i % 6 === 0 ? 1 : 0.5}
                          transform={`rotate(${(i * 360) / 24} 100 100)`}
                        />
                      ))}
                    </svg>

                    <div className="absolute inset-4 rounded-full border border-amber-400/25" />
                    <div className="absolute inset-8 rounded-full border border-white/10" />

                    <div className="relative text-center px-4">
                      <span
                        style={HEADING_FONT}
                        className="block text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-amber-400 to-indigo-400 text-6xl sm:text-7xl font-extrabold tracking-tight leading-none"
                      >
                        IX
                      </span>
                      <span className="block mt-2 text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-zinc-400">
                        Awards · 2026
                      </span>
                    </div>

                    <Sparkles
                      size={14}
                      className="absolute top-6 right-8 text-amber-400/50"
                    />
                    <Star
                      size={12}
                      className="absolute bottom-8 left-7 text-indigo-400/50"
                    />
                  </div>

                  {/* floating chip — live category count */}
                  <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-6 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-[#12141B]/90 backdrop-blur border border-white/10 shadow-xl">
                    <Trophy
                      size={14}
                      className="text-amber-400 flex-shrink-0"
                    />
                    <span className="text-white text-xs sm:text-sm font-semibold whitespace-nowrap">
                      {statsLoading ? "…" : totalCategories} Categories
                    </span>
                  </div>

                  {/* floating chip — live voting status */}
                  <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-6 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-[#12141B]/90 backdrop-blur border border-white/10 shadow-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <span className="text-white text-xs sm:text-sm font-semibold whitespace-nowrap">
                      Live Voting Open
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* stats row */}
            <div className="flex flex-wrap items-center justify-center gap-10 mt-20">
              {statsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-8 w-14 mx-auto bg-white/10 rounded-md animate-pulse" />
                      <div className="h-3 w-20 mt-2 bg-white/5 rounded-md animate-pulse" />
                    </div>
                  ))
                : [
                    {
                      value: totalCategories.toString(),
                      label: "Award Categories",
                    },
                    { value: "100%", label: "Secure Payments" },
                    {
                      value: liveEvents.length.toString(),
                      label: "Live Events",
                    },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center ix-fade-in">
                      <div
                        style={HEADING_FONT}
                        className="text-3xl font-bold text-white"
                      >
                        {value}
                      </div>
                      <div className="text-xs text-zinc-500 font-medium mt-1 tracking-wide">
                        {label}
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              className="w-full h-[50px]"
            >
              <path d="M0 60L1440 0L1440 60L0 60Z" fill="#FAF9F6" />
            </svg>
          </div>
        </section>

        {/* ── Top standings ────────────────────────────────────────────── */}
        {!pollsLoading && topStandings.length > 0 && (
          <section className="py-16 bg-white border-t border-zinc-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flame size={14} className="text-amber-500" />
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-600">
                      Top Standings
                    </p>
                  </div>
                  <h2
                    style={HEADING_FONT}
                    className="text-2xl font-bold text-zinc-900"
                  >
                    Who&rsquo;s leading right now
                  </h2>
                </div>
                <Link
                  to="/polls"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:gap-2 transition-all"
                >
                  View all results <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {topStandings.map((poll) => (
                  <Link
                    key={poll.eventId}
                    to={`/events/${poll.eventId}/results`}
                    className="group rounded-3xl bg-white border border-zinc-100 p-5 shadow-[0_2px_10px_-2px_rgba(20,20,25,0.06)] hover:shadow-[0_25px_60px_-15px_rgba(76,95,217,0.2)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-xs text-zinc-400">
                        {poll.category || "Uncategorized"}
                      </p>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                        <Trophy size={10} />
                      </span>
                    </div>

                    <h3 className="font-semibold text-zinc-900 text-sm leading-snug mb-1 group-hover:text-amber-700 transition-colors truncate">
                      {poll.eventTitle}
                    </h3>

                    <p className="text-xs text-zinc-500 mb-3">
                      Leading:{" "}
                      <span className="font-semibold text-zinc-800">
                        {poll.leaderName}
                      </span>
                    </p>

                    {poll.percent != null && (
                      <>
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-1.5">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-indigo-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(poll.percent, 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs font-bold text-amber-600">
                          {poll.percent.toFixed(1)}% of votes
                        </p>
                      </>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-50">
                      <span className="text-xs font-semibold text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        View standings <ChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Categories ───────────────────────────────────────────────── */}
        <section
          id="categories"
          ref={categoriesSectionRef}
          className="py-24 bg-[#FAF9F6] scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-600 mb-3">
                Class of INTREPIDUS Awards 2026
              </p>
              <h2
                style={HEADING_FONT}
                className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4"
              >
                {totalCategories ? `All ${totalCategories}` : "All"} Award
                Categories
              </h2>
              <p className="text-zinc-500 max-w-lg mx-auto text-sm">
                Tap a category to see its candidates and cast your vote. Live
                categories are marked with a green dot.
              </p>
            </div>

            {catLoading ? (
              <PageLoader />
            ) : categories.length === 0 ? (
              <p className="text-center text-sm text-zinc-400 py-12">
                Categories are being set up. Check back shortly.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                  {"All" === activeGroup ? (
                    <button className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all bg-[#0A0C10] text-white border-[#0A0C10] shadow-sm">
                      All
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveGroup("All")}
                      className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium border transition-all bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                    >
                      All
                    </button>
                  )}
                  {categoryGroups.map((group) => {
                    const Icon = GROUP_ICONS[group];
                    return (
                      <button
                        key={group}
                        onClick={() => setActiveGroup(group)}
                        className={`flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                          activeGroup === group
                            ? "bg-[#0A0C10] text-white border-[#0A0C10] shadow-sm font-semibold"
                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        {Icon && <Icon size={13} />}
                        {group}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mb-4 px-1">
                  <p className="text-xs text-zinc-400">
                    Showing{" "}
                    <span className="font-medium text-zinc-600">
                      {filteredCategories.length === 0 ? 0 : startIdx + 1}–
                      {Math.min(
                        startIdx + CATEGORIES_PER_PAGE,
                        filteredCategories.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-zinc-600">
                      {filteredCategories.length}
                    </span>{" "}
                    categories
                  </p>
                  {totalPages > 1 && (
                    <p className="text-xs text-zinc-400">
                      Page {safePage} of {totalPages}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedCategories.map((cat) => {
                    const Icon = GROUP_ICONS[cat.group] || Award;
                    const gradColor =
                      GROUP_COLORS[cat.group] || "from-amber-400 to-amber-600";
                    const matchEvent = events.find(
                      (e) =>
                        getEventStatus(e.startDate, e.endDate, e.isOpen) ===
                          "open" && e.categoryId === cat._id,
                    );
                    return (
                      <Link
                        key={cat._id}
                        to={`/category/${cat._id}`}
                        className="group rounded-3xl bg-white border border-zinc-100 p-6 shadow-[0_2px_10px_-2px_rgba(20,20,25,0.06)] hover:shadow-[0_25px_60px_-15px_rgba(217,164,65,0.25)] hover:-translate-y-1 transition-all duration-300 flex items-start gap-4"
                      >
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${gradColor} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform text-lg`}
                        >
                          <span>
                            {cat.emoji || (
                              <Icon size={19} className="text-white" />
                            )}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className="font-semibold text-zinc-900 text-sm leading-snug group-hover:text-amber-700 transition-colors">
                              {cat.name}
                            </p>
                            {matchEvent && (
                              <span
                                className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-1 animate-pulse"
                                title="Live event"
                              />
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {cat.group}
                          </p>
                          {cat.description && (
                            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed line-clamp-2">
                              {cat.description}
                            </p>
                          )}
                          <p className="text-xs text-amber-600 font-medium mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                            {matchEvent ? "Vote now" : "View →"}
                            <ChevronRight size={11} />
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                  />
                )}
              </>
            )}

            <div className="text-center mt-14">
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-10 sm:py-4 rounded-full bg-[#0A0C10] text-white font-semibold text-sm sm:text-base hover:bg-[#171922] transition-all duration-300 w-full sm:w-auto max-w-xs mx-auto"
              >
                <Trophy size={16} className="flex-shrink-0" /> See All Voting
                Events
              </Link>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-600 mb-3">
                Simple process
              </p>
              <h2
                style={HEADING_FONT}
                className="text-3xl font-bold text-zinc-900"
              >
                How voting works
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
              {[
                {
                  step: "01",
                  icon: Trophy,
                  title: "Choose a category",
                  desc: "Browse all the award categories and pick the one you want to vote in.",
                },
                {
                  step: "02",
                  icon: Users,
                  title: "Pick your candidate",
                  desc: "View all contestants, their profiles, and current standings before deciding.",
                },
                {
                  step: "03",
                  icon: Shield,
                  title: "Pay & vote securely",
                  desc: "Complete your vote via Paystack — Nigeria's most trusted payment gateway.",
                },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="text-center group">
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 bg-[#FAF9F6] rounded-2xl border border-zinc-100 shadow-[0_2px_10px_-2px_rgba(20,20,25,0.06)] flex items-center justify-center group-hover:shadow-[0_15px_40px_-10px_rgba(217,164,65,0.35)] group-hover:-translate-y-1 transition-all duration-300">
                      <Icon size={26} className="text-amber-500" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#0A0C10] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <h3
                    style={HEADING_FONT}
                    className="font-bold text-zinc-900 text-lg mb-2"
                  >
                    {title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="relative py-24 bg-[#0A0C10] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/25 via-transparent to-amber-900/15" />
          <div
            className="absolute w-[380px] h-[380px] rounded-full bg-amber-500/15 blur-[110px]"
            style={{ top: "-15%", left: "50%", transform: "translateX(-50%)" }}
          />
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <Flame size={44} className="text-amber-400 mx-auto mb-6 ix-float" />
            <h2
              style={HEADING_FONT}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              Ready to make your vote count?
            </h2>
            <p className="text-zinc-400 mb-9 max-w-lg mx-auto">
              Support your favourite finalists across every Class of INTREPIDUS
              award category. Every vote matters.
            </p>
            <Link
              to="/events"
              className="ix-pulse-glow inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-[#1A1204] font-semibold text-sm sm:text-base shadow-[0_15px_40px_-10px_rgba(217,164,65,0.55)] hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto max-w-xs mx-auto"
            >
              <Zap size={18} className="flex-shrink-0" />
              <span>Vote Now — It Only Takes a Minute</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <nav
      aria-label="Category pagination"
      className="flex items-center justify-center gap-1.5 mt-14"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            className="w-9 h-9 flex items-center justify-center text-zinc-300 text-sm select-none"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`w-9 h-9 rounded-full text-sm font-medium border transition-all ${
              page === currentPage
                ? "bg-[#0A0C10] text-white border-[#0A0C10] shadow-sm"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

function EventCard({ event }) {
  const status = getEventStatus(event.startDate, event.endDate, event.isOpen);
  const isFlagship = isFlagshipEvent(event);
  const bannerSrc =
    event.bannerImage ||
    (isFlagship ? FLAGSHIP_EVENT_BANNER : DEFAULT_EVENT_BANNER);

  return (
    <Link
      to={`/events/${event._id}`}
      className={`block rounded-3xl bg-white border border-zinc-100 overflow-hidden group shadow-[0_2px_10px_-2px_rgba(20,20,25,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-15px_rgba(76,95,217,0.2)] ${
        isFlagship ? "ring-1 ring-amber-400/40" : ""
      }`}
    >
      <div className="relative w-full h-44 overflow-hidden">
        <img
          src={bannerSrc}
          alt={event.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isFlagship ? "object-top" : "object-center"
          }`}
        />
        <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />{" "}
          LIVE
        </span>
        {isFlagship && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-[#1A1204] text-[10px] font-bold">
            <Crown size={11} /> FLAGSHIP
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent" />
        {event.category && (
          <span className="absolute bottom-2.5 left-3 text-xs text-white/90 font-medium drop-shadow-sm">
            {event.category}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <EventStatusBadge status={status} />
          <span className="text-xs text-zinc-400">
            ₦{(event.pricePerVote / 100).toLocaleString()}/vote
          </span>
        </div>
        <h3
          style={HEADING_FONT}
          className="font-bold text-zinc-900 text-base leading-snug mb-1 group-hover:text-amber-700 transition-colors line-clamp-2"
        >
          {event.title}
        </h3>
        <p className="text-xs text-zinc-500 mb-3">{event.organization}</p>
        <CountdownTimer targetDate={event.endDate} />
        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-zinc-50">
          <span className="font-semibold text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Vote now <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
