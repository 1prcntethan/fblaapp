/**
 * constants/mockData.ts — Placeholder / Mock Data
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * All mock data lives here during development.
 * When you wire up a real backend / API, replace these exports with API calls
 * in a services/ folder and update the components to use those hooks instead.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type NewsCategory =
  | "announcement"
  | "competition"
  | "chapter"
  | "national"
  | "award";

export type EventType =
  | "competition"
  | "meeting"
  | "workshop"
  | "conference"
  | "deadline";

// ─── Logged-in member (for the home greeting) ─────────────────────────────────
export const MOCK_MEMBER = {
  id:           "mbr_001",
  firstName:    "Jordan",
  lastName:     "Rivera",
  chapter:      "Lincoln High School",
  state:        "California",
  memberSince:  "2022",
  role:         "Chapter Vice President",         // e.g. "Member", "President", "Adviser"
  avatarInitials: "JR",                           // Used until real avatar images are loaded
  // avatarUrl: require("../assets/avatar.png"), // Uncomment when you have real assets
} as const;

// ─── Quick Stats (shown on dashboard) ─────────────────────────────────────────
// Replace with real aggregated data from your backend.
export const MOCK_STATS = [
  { id: "s1", label: "Events Attended",  value: "12",  icon: "checkmark-circle" },
  { id: "s2", label: "Days to NLC",      value: "47",  icon: "timer" },
  { id: "s3", label: "Chapter Members",  value: "84",  icon: "people" },
  { id: "s4", label: "Points Earned",    value: "320", icon: "star" },
] as const;

// ─── Upcoming Events (top 3 shown on dashboard) ───────────────────────────────
export interface UpcomingEvent {
  id:          string;
  title:       string;
  date:        string;   // ISO date string: "2025-11-15"
  time:        string;   // Human-readable: "9:00 AM"
  location:    string;
  type:        EventType;
  isReminder:  boolean;  // True if the user has set a reminder
}

export const MOCK_UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id:         "evt_001",
    title:      "State Leadership Conference",
    date:       "2026-04-05",
    time:       "8:00 AM",
    location:   "Sacramento Convention Center",
    type:       "conference",
    isReminder: true,
  },
  {
    id:         "evt_002",
    title:      "Chapter Officer Meeting",
    date:       "2026-03-28",
    time:       "3:30 PM",
    location:   "Room 204, Lincoln HS",
    type:       "meeting",
    isReminder: false,
  },
  {
    id:         "evt_003",
    title:      "NLC Registration Deadline",
    date:       "2026-04-01",
    time:       "11:59 PM",
    location:   "Online",
    type:       "deadline",
    isReminder: true,
  },
];

// ─── News Feed Items ───────────────────────────────────────────────────────────
export interface NewsItem {
  id:          string;
  title:       string;
  summary:     string;
  category:    NewsCategory;
  publishedAt: string;   // ISO datetime
  source:      string;   // e.g. "FBLA National", "Chapter Update"
  isRead:      boolean;
  isPinned:    boolean;
}

export const MOCK_NEWS: NewsItem[] = [
  {
    id:          "news_001",
    title:       "2026 NLC Theme Revealed: 'Ignite the Future'",
    summary:
      "FBLA-PBL has officially announced the theme for the 2026 National Leadership Conference. Registration opens April 1st — don't miss your spot!",
    category:    "national",
    publishedAt: "2026-03-20T10:00:00Z",
    source:      "FBLA National",
    isRead:      false,
    isPinned:    true,
  },
  {
    id:          "news_002",
    title:       "New Competitive Event Guidelines Released",
    summary:
      "Updated guidelines for Business Plan, Coding & Programming, and Public Speaking events are now available in the Resources tab.",
    category:    "competition",
    publishedAt: "2026-03-18T14:30:00Z",
    source:      "FBLA National",
    isRead:      false,
    isPinned:    false,
  },
  {
    id:          "news_003",
    title:       "Lincoln HS Chapter Wins Regional Award",
    summary:
      "Congratulations to our chapter for earning the Gold Seal Chapter of Merit award at the Regional Leadership Conference!",
    category:    "award",
    publishedAt: "2026-03-15T09:00:00Z",
    source:      "Chapter Update",
    isRead:      true,
    isPinned:    false,
  },
  {
    id:          "news_004",
    title:       "Scholarship Applications Now Open",
    summary:
      "FBLA-PBL is offering $1,000–$5,000 scholarships for graduating seniors. Deadline is May 15, 2026.",
    category:    "announcement",
    publishedAt: "2026-03-10T08:00:00Z",
    source:      "FBLA National",
    isRead:      true,
    isPinned:    false,
  },
];

// ─── Category metadata (colors/labels for badges) ────────────────────────────
// Maps NewsCategory → display label + theme color
export const NEWS_CATEGORY_META: Record<
  NewsCategory,
  { label: string; color: string }
> = {
  announcement: { label: "Announcement", color: "#3B82F6" },
  competition:  { label: "Competition",  color: "#8B5CF6" },
  chapter:      { label: "Chapter",      color: "#22C55E" },
  national:     { label: "National",     color: "#FFB81C" },
  award:        { label: "Award",        color: "#F59E0B" },
};

// ─── Event type metadata ───────────────────────────────────────────────────────
export const EVENT_TYPE_META: Record<
  EventType,
  { label: string; color: string; icon: string }
> = {
  competition: { label: "Competition", color: "#8B5CF6", icon: "trophy" },
  meeting:     { label: "Meeting",     color: "#3B82F6", icon: "people" },
  workshop:    { label: "Workshop",    color: "#22C55E", icon: "construct" },
  conference:  { label: "Conference",  color: "#FFB81C", icon: "business" },
  deadline:    { label: "Deadline",    color: "#EF4444", icon: "alert-circle" },
};