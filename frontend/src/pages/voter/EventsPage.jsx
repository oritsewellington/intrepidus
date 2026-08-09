import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Crown,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Trophy,
  Users,
  BookOpen,
  Star,
  Music,
  Shirt,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { useGetEventsQuery } from "../../store/api/eventsApi.js";
import { useGetCategoriesQuery } from "../../store/api/categoriesApi.js";
import {
  getEventStatus,
  formatShortDate,
  formatNumber,
} from "../../utils/helpers.js";
import {
  EventStatusBadge,
  PageLoader,
  EmptyState,
  CountdownTimer,
} from "../../components/ui/index.jsx";

const STATUS_FILTERS = ["all", "open", "upcoming", "closed"];
const EVENTS_PER_PAGE = 9;

// Icon + deep duotone gradient per category group, used to generate each
// event card's banner — no image asset required. Kept in sync with the
// palette in HomePage.jsx; consider extracting to a shared util once all
// pages are redesigned.
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

const BANNER_GRADIENTS = {
  Social: "from-indigo-950 via-indigo-900 to-ink-950",
  Academic: "from-violet-950 via-violet-900 to-ink-950",
  Popularity: "from-ember-900 via-ember-800 to-ink-950",
  Sports: "from-emerald-950 via-emerald-900 to-ink-950",
  Leadership: "from-rose-950 via-rose-900 to-ink-950",
  Creative: "from-fuchsia-950 via-pink-900 to-ink-950",
  Fashion: "from-purple-950 via-violet-900 to-ink-950",
  Business: "from-sky-950 via-indigo-900 to-ink-950",
  General: "from-orange-950 via-ember-800 to-ink-950",
};

// ASSUMPTION: flagship event is named "Mr / Miss TASA" — kept in
// sync with the same check in HomePage.jsx.
function isFlagshipEvent(event) {
  const name = (event.category || event.title || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
  return name === "mr tasa" || name === "miss tasa";
}

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef(null);

  const { data: events = [], isLoading } = useGetEventsQuery({});
  const { data: categories = [] } = useGetCategoriesQuery();

  const categoryGroups = [...new Set(categories.map((c) => c.group))].filter(
    Boolean,
  );

  const filtered = events.filter((ev) => {
    const status = getEventStatus(ev.startDate, ev.endDate, ev.isOpen);
    const matchStatus = statusFilter === "all" || status === statusFilter;
    const matchGroup =
      groupFilter === "all" ||
      (() => {
        const cat = categories.find((c) => c._id === ev.categoryId);
        return cat?.group === groupFilter;
      })();
    const matchSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.organization?.toLowerCase().includes(search.toLowerCase()) ||
      ev.category?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchGroup && matchSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, groupFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / EVENTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * EVENTS_PER_PAGE;
  const paginatedEvents = filtered.slice(startIdx, startIdx + EVENTS_PER_PAGE);

  const goToPage = (page) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stats = useMemo(() => {
    const open = events.filter(
      (e) => getEventStatus(e.startDate, e.endDate, e.isOpen) === "open",
    ).length;
    const totalVotes = events.reduce((s, e) => s + (e.totalVotes || 0), 0);
    return { open, totalVotes, total: events.length };
  }, [events]);

  const hasActiveFilters =
    search || statusFilter !== "all" || groupFilter !== "all";

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-zinc-100">
        <div className="page-container py-10">
          <p className="section-label text-ember-600 mb-2">Cast your vote</p>
          <h1 className="font-display text-3xl font-bold text-zinc-900 mb-1">
            All Voting Events
          </h1>
          <p className="text-zinc-500 text-sm mb-5">
            Choose an event category and vote for your favourite candidate.
          </p>

          {!isLoading && (
            <div className="flex flex-wrap gap-6 mb-7 pb-6 border-b border-zinc-50">
              <div>
                <span className="text-xl font-bold text-zinc-900">
                  {stats.total}
                </span>
                <span className="text-xs text-zinc-400 ml-1.5">
                  total events
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xl font-bold text-zinc-900">
                  {stats.open}
                </span>
                <span className="text-xs text-zinc-400 ml-1">live now</span>
              </div>
            </div>
          )}

          <div className="relative max-w-md mb-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search events or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-100 rounded-full p-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    statusFilter === f
                      ? "bg-ink-950 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {categoryGroups.length > 0 && (
              <>
                <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block" />
                <div className="relative">
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-2 rounded-full text-sm font-medium border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ember-400/30"
                  >
                    <option value="all">All Groups</option>
                    {categoryGroups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <Filter
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  />
                </div>
              </>
            )}

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setGroupFilter("all");
                }}
                className="text-xs text-zinc-400 hover:text-ember-600 underline underline-offset-2 ml-1 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-container py-10" ref={listTopRef}>
        {isLoading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events found"
            description={
              search
                ? `No events match "${search}"`
                : "No events available right now. Check back soon."
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-5 px-1">
              <p className="text-xs text-zinc-400">
                Showing{" "}
                <span className="font-medium text-zinc-600">
                  {startIdx + 1}–
                  {Math.min(startIdx + EVENTS_PER_PAGE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-zinc-600">
                  {filtered.length}
                </span>{" "}
                event
                {filtered.length !== 1 ? "s" : ""}
              </p>
              {totalPages > 1 && (
                <p className="text-xs text-zinc-400">
                  Page {safePage} of {totalPages}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedEvents.map((ev) => (
                <EventCard
                  key={ev._id}
                  event={ev}
                  category={categories.find((c) => c._id === ev.categoryId)}
                />
              ))}
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
      </div>
    </div>
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
      aria-label="Events pagination"
      className="flex items-center justify-center gap-1.5 mt-12"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 text-zinc-500 hover:border-ember-300 hover:text-ember-600 hover:bg-ember-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
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
                ? "bg-ember-500 text-white border-ember-500 shadow-sm"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-ember-300 hover:text-ember-600 hover:bg-ember-50"
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
        className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 text-zinc-500 hover:border-ember-300 hover:text-ember-600 hover:bg-ember-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

function EventBanner({ category, isFlagship }) {
  if (isFlagship) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-[#171a22] to-ink-950 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full border border-ember-400/20" />
        <div className="absolute -right-5 -top-5 w-32 h-32 rounded-full border border-ember-400/15" />
        <span
          className="font-display absolute -bottom-6 -right-2 text-[110px] font-extrabold leading-none text-white/[0.05] select-none"
          aria-hidden="true"
        >
          IX
        </span>
      </div>
    );
  }

  const Icon = GROUP_ICONS[category?.group] || Trophy;
  const gradient =
    BANNER_GRADIENTS[category?.group] || "from-ink-900 to-ink-950";

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} overflow-hidden`}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`dots-${category?._id || "default"}`}
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.2" cy="1.2" r="1.2" fill="#ffffff" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#dots-${category?._id || "default"})`}
        />
      </svg>
      <Icon
        size={104}
        strokeWidth={1.2}
        className="absolute -right-4 -bottom-5 text-white/[0.09] rotate-[-12deg]"
      />
    </div>
  );
}

function EventCard({ event, category }) {
  const status = getEventStatus(event.startDate, event.endDate, event.isOpen);
  const isOpen = status === "open";
  const isFlagship = isFlagshipEvent(event);

  return (
    <Link
      to={`/events/${event._id}`}
      className={`card-hover block overflow-hidden group ${
        !isOpen ? "opacity-75" : ""
      } ${isFlagship ? "ring-1 ring-ember-400/40" : ""}`}
    >
      <div className="relative w-full h-44 overflow-hidden">
        <EventBanner category={category} isFlagship={isFlagship} />

        {isOpen && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-2xs font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />{" "}
            LIVE
          </span>
        )}
        {isFlagship && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-ember-500/90 backdrop-blur-sm text-ink-950 text-2xs font-bold">
            <Crown size={11} /> FLAGSHIP
          </span>
        )}
        {/* subtle bottom gradient so the category label stays readable
            over the generated banner art */}
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
          <span className="text-xs text-zinc-600 font-bold">
            ₦{(event.pricePerVote / 100).toLocaleString()}/vote
          </span>
        </div>
        <h2 className="font-display font-bold text-zinc-900 text-base leading-snug mb-1 group-hover:text-ember-700 transition-colors line-clamp-2">
          {event.title}
        </h2>
        <p className="text-xs text-zinc-500 mb-3">{event.organization}</p>
        {isOpen && <CountdownTimer targetDate={event.endDate} />}
        <div className="flex items-center justify-between text-xs border-t border-zinc-50 pt-3 mt-3">
          <span className="flex items-center gap-1 text-zinc-600 font-medium">
            <Calendar size={11} /> {formatShortDate(event.endDate)}
          </span>
          <span className="font-semibold text-ember-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            {isOpen ? "Vote now" : "View results"} <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
