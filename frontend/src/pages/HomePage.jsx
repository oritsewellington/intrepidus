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
  Drama,
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

const DISPLAY_FONT = { fontFamily: "'Playfair Display', Georgia, serif" };
const MARQUEE_FONT = {
  fontFamily: "'Bebas Neue', system-ui, sans-serif",
  letterSpacing: "0.08em",
};

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
  Social: "from-[#6E1423] to-[#3D0B14]",
  Academic: "from-[#1F3B3B] to-[#0F211F]",
  Popularity: "from-[#C7A34C] to-[#8A6A24]",
  Sports: "from-[#2E4A3F] to-[#16261F]",
  Leadership: "from-[#7A1830] to-[#420C1A]",
  Creative: "from-[#8A2C42] to-[#4A1523]",
  Fashion: "from-[#5C4A8A] to-[#2E2350]",
  Business: "from-[#1F3B54] to-[#0F1F2E]",
  General: "from-[#C7A34C] to-[#6E1423]",
};

const FLAGSHIP_EVENT_BANNER = "/tasa-flagship-banner.webp";
const DEFAULT_EVENT_BANNER = "/tasa-event-banner.webp";

function isFlagshipEvent(event) {
  const name = (event.category || event.title || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
  return name === "mr tasa" || name === "miss tasa";
}

const CATEGORIES_PER_PAGE = 9;
const TOP_STANDINGS_COUNT = 6;

function useWelcomeConfetti(durationMs = 5000) {
  useEffect(() => {
    const end = Date.now() + durationMs;
    const curtainColors = ["#C7A34C", "#6E1423", "#F4ECDA", "#8A2C42"];

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { x: 0.5, y: 0.3 },
      colors: curtainColors,
      startVelocity: 40,
      gravity: 1,
      scalar: 1.1,
      angle: 90,
    });

    let frameId;
    (function frame() {
      confetti({
        particleCount: 1,
        colors: curtainColors,
        origin: { x: Math.random(), y: -0.1 },
        startVelocity: 0,
        gravity: 0.35,
        drift: (Math.random() - 0.5) * 1.2,
        scalar: 1.1,
        ticks: 400,
      });
      if (Date.now() < end) frameId = requestAnimationFrame(frame);
    })();

    return () => cancelAnimationFrame(frameId);
  }, [durationMs]);
}

export default function HomePage() {
  const [activeGroup, setActiveGroup] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const categoriesSectionRef = useRef(null);

  useWelcomeConfetti();

  useEffect(() => {
    const t = setTimeout(() => setCurtainsOpen(true), 250);
    return () => clearTimeout(t);
  }, []);

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

  const topStandings = useMemo(() => {
    return polls
      .filter((p) => p.leaderName && p.leaderVotes > 0)
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,700&family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap');

        @keyframes tasaFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes tasaCurtainLeft { from { transform: translateX(0); } to { transform: translateX(-102%); } }
        @keyframes tasaCurtainRight { from { transform: translateX(0); } to { transform: translateX(102%); } }
        @keyframes tasaFlicker {
          0%, 100% { opacity: 1; }
          45% { opacity: 0.85; }
          50% { opacity: 1; }
          52% { opacity: 0.9; }
          55% { opacity: 1; }
        }
        @keyframes tasaChase { to { background-position: 40px 0; } }
        @keyframes tasaFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        .tasa-fade-in { animation: tasaFadeIn .7s ease-out both; }
        .tasa-curtain-left { animation: tasaCurtainLeft 1.1s cubic-bezier(.65,0,.35,1) .2s forwards; }
        .tasa-curtain-right { animation: tasaCurtainRight 1.1s cubic-bezier(.65,0,.35,1) .2s forwards; }
        .tasa-flicker { animation: tasaFlicker 4s ease-in-out infinite; }
        .tasa-float { animation: tasaFloat 6s ease-in-out infinite; }
        .tasa-marquee-border {
          background-image: radial-gradient(circle, #C7A34C 2px, transparent 2.5px);
          background-size: 14px 14px;
          animation: tasaChase 1.4s linear infinite;
        }
        .tasa-curtain-fabric {
          background-image: repeating-linear-gradient(
            90deg,
            #7A1830 0px, #7A1830 18px,
            #5C1120 18px, #5C1120 36px
          );
        }
      `}</style>

      <div className="tasa-fade-in">
        <section className="relative overflow-hidden bg-[#120D0C] min-h-[640px] flex items-center">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute left-1/2 top-0 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-40"
              style={{
                background:
                  "radial-gradient(circle, rgba(246,217,139,0.35) 0%, rgba(246,217,139,0.08) 40%, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-0 inset-x-0 h-40 opacity-[0.15]"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #F4ECDA 0px, #F4ECDA 2px, transparent 2px, transparent 60px)",
              }}
            />
          </div>

          <div className="absolute inset-0 z-20 flex pointer-events-none">
            <div
              className={`w-1/2 h-full tasa-curtain-fabric shadow-[inset_-40px_0_60px_-20px_rgba(0,0,0,0.6)] ${
                curtainsOpen ? "tasa-curtain-left" : ""
              }`}
            />
            <div
              className={`w-1/2 h-full tasa-curtain-fabric shadow-[inset_40px_0_60px_-20px_rgba(0,0,0,0.6)] ${
                curtainsOpen ? "tasa-curtain-right" : ""
              }`}
            />
          </div>
          <div className="absolute top-0 inset-x-0 h-6 sm:h-8 z-30 bg-gradient-to-b from-[#C7A34C] to-[#8A6A24] shadow-md" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-[#C7A34C]/40 bg-[#C7A34C]/10 text-[#E8C97A] text-[11px] sm:text-xs font-medium mb-8 tasa-flicker">
                  <span style={MARQUEE_FONT}>
                    THEATRE ARTS STUDENT ASSOCIATION · UNIBEN · 2026
                  </span>
                </div>

                <h1
                  style={DISPLAY_FONT}
                  className="text-5xl sm:text-6xl xl:text-7xl font-black italic text-[#F4ECDA] leading-[1.05] mb-6"
                >
                  <span className="block not-italic font-normal text-3xl sm:text-4xl text-[#C7A34C] mb-2">
                    Presented By
                  </span>
                  The Theatre Arts
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C7A34C] via-[#F6D98B] to-[#C7A34C]">
                    Student Association
                  </span>
                </h1>

                <p className="text-lg text-[#D8CDB8] max-w-xl mx-auto lg:mx-0 mb-10 font-light leading-relaxed">
                  {statsLoading ? (
                    <span className="inline-block h-6 w-64 max-w-full bg-white/10 rounded-md animate-pulse align-middle" />
                  ) : (
                    <>
                      {totalCategories} categories celebrating the students who
                      write, direct, perform, and build every production — in
                      recognition by the very community they belong to.
                    </>
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="#categories"
                    className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 rounded-sm bg-[#6E1423] text-[#F4ECDA] font-semibold text-base border border-[#C7A34C]/50 hover:bg-[#7A1830] transition-colors duration-300"
                  >
                    <span className="tasa-marquee-border absolute -inset-[3px] rounded-[3px] opacity-70 -z-10" />
                    <Drama size={18} />
                    <span>Find Your Category</span>
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </a>

                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-sm border border-[#F4ECDA]/25 text-[#F4ECDA] font-medium text-base hover:bg-white/5 transition-colors duration-300"
                  >
                    About TASA
                  </Link>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="tasa-float relative w-64 sm:w-72 bg-[#F4ECDA] rounded-sm shadow-2xl shadow-black/50 border-4 border-[#C7A34C] p-7 -rotate-2">
                  <div className="text-center">
                    <p
                      style={MARQUEE_FONT}
                      className="text-[#6E1423] text-xs mb-1"
                    >
                      A PRODUCTION OF
                    </p>
                    <h2
                      style={DISPLAY_FONT}
                      className="text-3xl font-black italic text-[#241A15] leading-none mb-3"
                    >
                      TASA
                      <span className="block text-lg not-italic font-normal mt-1 text-[#6E1423]">
                        Awards
                      </span>
                    </h2>
                    <div className="h-px bg-[#C7A34C] my-4" />
                    <p className="text-[11px] text-[#5C4A3A] leading-relaxed mb-4">
                      Featuring the finest of the Faculty of Arts, University of
                      Benin
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[#6E1423] text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      {statsLoading
                        ? "Curtain rising…"
                        : `${liveEvents.length} live now`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-10 mt-16 pt-10 border-t border-[#F4ECDA]/10">
              {statsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-8 w-14 mx-auto bg-white/10 rounded-md animate-pulse" />
                      <div className="h-3 w-20 mt-2 bg-white/5 rounded-md animate-pulse" />
                    </div>
                  ))
                : [
                    { value: totalCategories.toString(), label: "Categories" },
                    { value: "100%", label: "Secure Payments" },
                    { value: liveEvents.length.toString(), label: "Live Now" },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center">
                      <div
                        style={DISPLAY_FONT}
                        className="text-3xl font-bold text-[#F4ECDA] italic"
                      >
                        {value}
                      </div>
                      <div
                        style={MARQUEE_FONT}
                        className="text-[11px] text-[#C7A34C] mt-1"
                      >
                        {label}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {!pollsLoading && topStandings.length > 0 && (
          <section className="py-16 bg-[#F4ECDA] border-t border-[#C7A34C]/30">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <p
                    style={MARQUEE_FONT}
                    className="text-[11px] text-[#6E1423] mb-1"
                  >
                    CURRENT REVIEWS
                  </p>
                  <h2
                    style={DISPLAY_FONT}
                    className="text-2xl font-bold italic text-[#241A15]"
                  >
                    Who&rsquo;s leading right now
                  </h2>
                </div>
                <Link
                  to="/polls"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#6E1423] hover:gap-2 transition-all"
                >
                  View all results <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {topStandings.map((poll) => {
                  const hasRealLeader = poll.leaderName && poll.leaderVotes > 0;
                  return (
                    <Link
                      key={poll.eventId}
                      to={`/events/${poll.eventId}/results`}
                      className="group bg-white rounded-sm border border-[#C7A34C]/25 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <p className="text-xs text-[#8A7A64]">
                          {poll.category || "Uncategorized"}
                        </p>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#6E1423] bg-[#6E1423]/10 rounded-full px-2 py-0.5">
                          <Trophy size={10} />
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#241A15] text-sm leading-snug mb-1 group-hover:text-[#6E1423] transition-colors truncate">
                        {poll.eventTitle}
                      </h3>
                      {hasRealLeader ? (
                        <p className="text-xs text-[#8A7A64] mb-3">
                          Leading:{" "}
                          <span className="font-semibold text-[#241A15]">
                            {poll.leaderName}
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-[#8A7A64] mb-3 italic">
                          No votes yet
                        </p>
                      )}
                      {hasRealLeader && poll.percent != null && (
                        <>
                          <div className="w-full h-1.5 bg-[#F4ECDA] rounded-full overflow-hidden mb-1.5">
                            <div
                              className="h-full bg-gradient-to-r from-[#C7A34C] to-[#6E1423] rounded-full transition-all"
                              style={{
                                width: `${Math.min(poll.percent, 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs font-bold text-[#6E1423]">
                            {poll.percent.toFixed(1)}% of votes
                          </p>
                        </>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F4ECDA]">
                        <span className="text-xs font-semibold text-[#6E1423] flex items-center gap-1 group-hover:gap-2 transition-all">
                          View standings <ChevronRight size={12} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section
          id="categories"
          ref={categoriesSectionRef}
          className="py-24 bg-[#FBF7EE] scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-14">
              <p
                style={MARQUEE_FONT}
                className="text-[11px] text-[#6E1423] mb-3"
              >
                TASA AWARDS 2026 · FULL PROGRAMME
              </p>
              <h2
                style={DISPLAY_FONT}
                className="text-3xl sm:text-4xl font-bold italic text-[#241A15] mb-4"
              >
                {totalCategories ? `All ${totalCategories}` : "All"} Award
                Categories
              </h2>
              <p className="text-[#5C4A3A] max-w-lg mx-auto text-sm">
                Tap a category to see its candidates and cast your vote. Live
                categories are marked with a green dot.
              </p>
            </div>

            {catLoading ? (
              <PageLoader />
            ) : categories.length === 0 ? (
              <p className="text-center text-sm text-[#8A7A64] py-12">
                Categories are being set up. Check back shortly.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                  {"All" === activeGroup ? (
                    <button className="px-5 py-2.5 rounded-sm text-sm font-semibold bg-[#241A15] text-[#F4ECDA] border border-[#241A15]">
                      All
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveGroup("All")}
                      className="px-5 py-2.5 rounded-sm text-sm font-medium bg-white text-[#5C4A3A] border border-[#C7A34C]/30 hover:border-[#C7A34C] transition-colors"
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
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-sm text-sm font-medium border transition-colors ${
                          activeGroup === group
                            ? "bg-[#241A15] text-[#F4ECDA] border-[#241A15] font-semibold"
                            : "bg-white text-[#5C4A3A] border-[#C7A34C]/30 hover:border-[#C7A34C]"
                        }`}
                      >
                        {Icon && <Icon size={13} />}
                        {group}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mb-4 px-1">
                  <p className="text-xs text-[#8A7A64]">
                    Showing{" "}
                    <span className="font-medium text-[#5C4A3A]">
                      {filteredCategories.length === 0 ? 0 : startIdx + 1}–
                      {Math.min(
                        startIdx + CATEGORIES_PER_PAGE,
                        filteredCategories.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-[#5C4A3A]">
                      {filteredCategories.length}
                    </span>{" "}
                    categories
                  </p>
                  {totalPages > 1 && (
                    <p className="text-xs text-[#8A7A64]">
                      Page {safePage} of {totalPages}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedCategories.map((cat) => {
                    const Icon = GROUP_ICONS[cat.group] || Award;
                    const gradColor =
                      GROUP_COLORS[cat.group] || "from-[#C7A34C] to-[#6E1423]";
                    const matchEvent = events.find(
                      (e) =>
                        getEventStatus(e.startDate, e.endDate, e.isOpen) ===
                          "open" && e.categoryId === cat._id,
                    );
                    return (
                      <Link
                        key={cat._id}
                        to={`/category/${cat._id}`}
                        className="group bg-white rounded-sm border border-[#C7A34C]/25 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-start gap-4"
                      >
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${gradColor} rounded-sm flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}
                        >
                          <span>
                            {cat.emoji || (
                              <Icon size={19} className="text-white" />
                            )}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className="font-semibold text-[#241A15] text-sm leading-snug group-hover:text-[#6E1423] transition-colors">
                              {cat.name}
                            </p>
                            {matchEvent && (
                              <span
                                className="flex-shrink-0 w-2 h-2 bg-emerald-600 rounded-full mt-1 animate-pulse"
                                title="Live event"
                              />
                            )}
                          </div>
                          <p className="text-xs text-[#8A7A64] mt-0.5">
                            {cat.group}
                          </p>
                          {cat.description && (
                            <p className="text-xs text-[#5C4A3A] mt-1.5 leading-relaxed line-clamp-2">
                              {cat.description}
                            </p>
                          )}
                          <p className="text-xs text-[#6E1423] font-medium mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
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
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-sm bg-[#241A15] text-[#F4ECDA] font-semibold text-sm hover:bg-[#3A2A20] transition-colors duration-300"
              >
                <Trophy size={16} /> See All Voting Events
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-16">
              <p
                style={MARQUEE_FONT}
                className="text-[11px] text-[#6E1423] mb-3"
              >
                THE PROGRAMME
              </p>
              <h2
                style={DISPLAY_FONT}
                className="text-3xl font-bold italic text-[#241A15]"
              >
                How voting works
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
              {[
                {
                  act: "Act I",
                  icon: Trophy,
                  title: "Choose a category",
                  desc: "Browse all the award categories and pick the one you want to vote in.",
                },
                {
                  act: "Act II",
                  icon: Users,
                  title: "Pick your candidate",
                  desc: "View all contestants, their profiles, and current standings before deciding.",
                },
                {
                  act: "Act III",
                  icon: Shield,
                  title: "Pay & vote securely",
                  desc: "Complete your vote via Paystack — Nigeria's most trusted payment gateway.",
                },
              ].map(({ act, icon: Icon, title, desc }) => (
                <div key={act} className="text-center group">
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 bg-[#FBF7EE] rounded-sm border border-[#C7A34C]/30 shadow-sm flex items-center justify-center group-hover:-translate-y-1 transition-all duration-300">
                      <Icon size={26} className="text-[#6E1423]" />
                    </div>
                  </div>
                  <p
                    style={MARQUEE_FONT}
                    className="text-[#C7A34C] text-xs mb-1"
                  >
                    {act}
                  </p>
                  <h3
                    style={DISPLAY_FONT}
                    className="font-bold italic text-[#241A15] text-lg mb-2"
                  >
                    {title}
                  </h3>
                  <p className="text-sm text-[#5C4A3A] leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24 bg-[#120D0C] overflow-hidden">
          <div className="absolute inset-0 opacity-30 tasa-curtain-fabric" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120D0C] via-[#120D0C]/85 to-[#120D0C]/40" />
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <Drama
              size={44}
              className="text-[#C7A34C] mx-auto mb-6 tasa-float"
            />
            <h2
              style={DISPLAY_FONT}
              className="text-3xl sm:text-4xl font-bold italic text-[#F4ECDA] mb-4"
            >
              Ready to make your vote count?
            </h2>
            <p className="text-[#D8CDB8] mb-9 max-w-lg mx-auto">
              Support your favourite performers across every TASA award
              category. Every vote matters.
            </p>
            <Link
              to="/events"
              className="relative inline-flex items-center justify-center gap-2 px-10 py-4 rounded-sm bg-[#6E1423] text-[#F4ECDA] font-semibold text-base border border-[#C7A34C]/50 hover:bg-[#7A1830] transition-colors duration-300"
            >
              <span className="tasa-marquee-border absolute -inset-[3px] rounded-[3px] opacity-60 -z-10" />
              <Zap size={18} />
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
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
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
        className="flex items-center justify-center w-9 h-9 rounded-sm border border-[#C7A34C]/30 text-[#5C4A3A] hover:border-[#C7A34C] disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronLeft size={16} />
      </button>
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            className="w-9 h-9 flex items-center justify-center text-[#C7A34C]/50 text-sm select-none"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`w-9 h-9 rounded-sm text-sm font-medium border transition-all ${
              page === currentPage
                ? "bg-[#241A15] text-[#F4ECDA] border-[#241A15]"
                : "bg-white text-[#5C4A3A] border-[#C7A34C]/30 hover:border-[#C7A34C]"
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
        className="flex items-center justify-center w-9 h-9 rounded-sm border border-[#C7A34C]/30 text-[#5C4A3A] hover:border-[#C7A34C] disabled:opacity-30 disabled:pointer-events-none transition-all"
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
      className={`block rounded-sm bg-white border border-[#C7A34C]/25 overflow-hidden group shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        isFlagship ? "ring-1 ring-[#C7A34C]/50" : ""
      }`}
    >
      <div className="relative w-full h-44 overflow-hidden">
        <img
          src={bannerSrc}
          alt={event.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isFlagship ? "object-top" : "object-center"}`}
        />
        <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />{" "}
          LIVE
        </span>
        {isFlagship && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C7A34C]/90 backdrop-blur-sm text-[#241A15] text-[10px] font-bold">
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
          <span className="text-xs text-[#8A7A64]">
            ₦{(event.pricePerVote / 100).toLocaleString()}/vote
          </span>
        </div>
        <h3
          style={DISPLAY_FONT}
          className="font-bold italic text-[#241A15] text-base leading-snug mb-1 group-hover:text-[#6E1423] transition-colors line-clamp-2"
        >
          {event.title}
        </h3>
        <p className="text-xs text-[#8A7A64] mb-3">{event.organization}</p>
        <CountdownTimer targetDate={event.endDate} />
        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-[#F4ECDA]">
          <span className="font-semibold text-[#6E1423] flex items-center gap-1 group-hover:gap-2 transition-all">
            Vote now <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
