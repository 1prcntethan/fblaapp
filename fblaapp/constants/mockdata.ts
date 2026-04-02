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
  // { id: "s1", label: "Events Attended",  value: "12",  icon: "checkmark-circle" },
  { id: "s2", label: "Days to NLC",      value: "47",  icon: "timer" },
  // { id: "s3", label: "Chapter Members",  value: "84",  icon: "people" },
  // { id: "s4", label: "Points Earned",    value: "320", icon: "star" },
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

// ─── Full Calendar Event (extended from UpcomingEvent) ────────────────────────
// Used by the Events/Calendar screen which needs richer detail fields.
export interface CalendarEvent extends UpcomingEvent {
  description:  string;        // Full description shown in detail view
  organizer:    string;        // e.g. "FBLA National", "Lincoln HS Chapter"
  registrationUrl?: string;    // Link to register (if applicable)
  isRegistered: boolean;       // Has this member registered?
  allDay:       boolean;       // True for deadlines that span the whole day
}

// ─── Resource Types ───────────────────────────────────────────────────────────

/**
 * The "kind" of a resource — controls which icon and action is used.
 *   pdf    → open in an in-app PDF viewer (or browser fallback)
 *   link   → open in the system browser via Linking.openURL
 *   doc    → Word / Google Doc link
 *   video  → YouTube or hosted video link
 */
export type ResourceKind = "pdf" | "link" | "doc" | "video";

/**
 * A single resource item inside a category.
 */
export interface Resource {
  id:          string;
  title:       string;
  description: string;    // 1–2 sentence summary shown in the expanded list
  kind:        ResourceKind;
  url:         string;    // External URL — replace with internal asset path for stored PDFs
  isFeatured:  boolean;   // True → shown in the "Pinned / Featured" strip at the top
  updatedAt:   string;    // ISO date — shown as "Updated Apr 2026"
  fileSize?:   string;    // e.g. "2.4 MB" — optional, shown on PDF items
}

/**
 * A logical grouping of resources — rendered as an accordion section.
 * To reorder sections, change the order of items in MOCK_RESOURCE_CATEGORIES.
 */
export interface ResourceCategory {
  id:          string;
  title:       string;    // Section header label
  icon:        string;    // Ionicons name for the section icon
  color:       string;    // Accent color for the section icon background
  resources:   Resource[];
}

// Kind → display metadata (icon name, label, color)
export const RESOURCE_KIND_META: Record<
  ResourceKind,
  { icon: string; label: string; color: string }
> = {
  pdf:   { icon: "document-text",   label: "PDF",      color: "#EF4444" },
  link:  { icon: "globe-outline",   label: "Link",     color: "#3B82F6" },
  doc:   { icon: "document-outline", label: "Document", color: "#22C55E" },
  video: { icon: "play-circle",     label: "Video",    color: "#8B5CF6" },
};

// ─── Resource Categories & Items ──────────────────────────────────────────────
// Each category maps to one accordion section on the Resources screen.
// To add a new category: append an object to this array.
// To add a resource: append to the `resources` array inside its category.
export const MOCK_RESOURCE_CATEGORIES: ResourceCategory[] = [
  // ── Competitive Events ────────────────────────────────────────────────────
  {
    id:    "cat_competitive",
    title: "Competitive Events",
    icon:  "trophy-outline",
    color: "#8B5CF6",
    resources: [
      {
        id:          "res_001",
        title:       "2025–2026 Competitive Events Guidelines",
        description: "Official guidelines for all FBLA competitive events, including event descriptions, eligibility requirements, and judging criteria.",
        kind:        "pdf",
        url:         "https://www.fbla-pbl.org/fbla/competitive-events/",
        isFeatured:  true,
        updatedAt:   "2025-09-01",
        fileSize:    "4.2 MB",
      },
      {
        id:          "res_002",
        title:       "Business Plan Event Guidelines",
        description: "Detailed rubric, format requirements, and presentation tips for the Business Plan competitive event.",
        kind:        "pdf",
        url:         "https://www.fbla-pbl.org/fbla/competitive-events/",
        isFeatured:  false,
        updatedAt:   "2025-09-01",
        fileSize:    "1.1 MB",
      },
      {
        id:          "res_003",
        title:       "Coding & Programming Prep Guide",
        description: "Sample problems, allowed languages, IDE setup, and scoring breakdown for the Coding & Programming event.",
        kind:        "pdf",
        url:         "https://www.fbla-pbl.org/fbla/competitive-events/",
        isFeatured:  false,
        updatedAt:   "2025-09-01",
        fileSize:    "850 KB",
      },
      {
        id:          "res_004",
        title:       "Public Speaking Evaluation Rubric",
        description: "Judging sheet used at region, state, and national levels. Know exactly what evaluators are looking for.",
        kind:        "pdf",
        url:         "https://www.fbla-pbl.org/fbla/competitive-events/",
        isFeatured:  false,
        updatedAt:   "2025-09-01",
        fileSize:    "320 KB",
      },
    ],
  },

  // ── Member Handbook & Policies ────────────────────────────────────────────
  {
    id:    "cat_handbook",
    title: "Member Handbook & Policies",
    icon:  "book-outline",
    color: "#FFB81C",
    resources: [
      {
        id:          "res_005",
        title:       "FBLA Member Handbook 2025–2026",
        description: "Everything a new and returning member needs: mission, bylaws, officer responsibilities, code of conduct, and dress code.",
        kind:        "pdf",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  true,
        updatedAt:   "2025-08-15",
        fileSize:    "6.8 MB",
      },
      {
        id:          "res_006",
        title:       "FBLA National Bylaws",
        description: "The official governing document of FBLA-PBL, Inc. Required reading for chapter officers.",
        kind:        "pdf",
        url:         "https://www.fbla-pbl.org/about/bylaws-and-policies/",
        isFeatured:  false,
        updatedAt:   "2024-07-01",
        fileSize:    "1.5 MB",
      },
      {
        id:          "res_007",
        title:       "Chapter Officer Duties Guide",
        description: "Role descriptions, responsibilities, and best practices for all chapter officer positions.",
        kind:        "doc",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  false,
        updatedAt:   "2025-08-15",
      },
    ],
  },

  // ── Forms & Templates ─────────────────────────────────────────────────────
  {
    id:    "cat_forms",
    title: "Forms & Templates",
    icon:  "clipboard-outline",
    color: "#22C55E",
    resources: [
      {
        id:          "res_008",
        title:       "Chapter Charter Renewal Form",
        description: "Annual form to maintain chapter status. Must be submitted by October 31.",
        kind:        "pdf",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  false,
        updatedAt:   "2025-08-01",
        fileSize:    "245 KB",
      },
      {
        id:          "res_009",
        title:       "Member Registration Form",
        description: "Template for registering new members through your state association portal.",
        kind:        "doc",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  false,
        updatedAt:   "2025-08-01",
      },
      {
        id:          "res_010",
        title:       "Community Service Project Log",
        description: "Track hours and project details for chapter community service activities.",
        kind:        "doc",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  false,
        updatedAt:   "2025-08-01",
      },
      {
        id:          "res_011",
        title:       "Trip Permission & Medical Form",
        description: "Required for all members attending conferences and off-campus FBLA events.",
        kind:        "pdf",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  false,
        updatedAt:   "2025-08-01",
        fileSize:    "180 KB",
      },
    ],
  },

  // ── National Links ────────────────────────────────────────────────────────
  {
    id:    "cat_national",
    title: "National Resources",
    icon:  "globe-outline",
    color: "#3B82F6",
    resources: [
      {
        id:          "res_012",
        title:       "FBLA-PBL Official Website",
        description: "The national hub for news, event registration, competitive event information, and member resources.",
        kind:        "link",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  true,
        updatedAt:   "2026-01-01",
      },
      {
        id:          "res_013",
        title:       "NLC 2026 Information Page",
        description: "Registration, schedule, hotel, and competition info for the 2026 National Leadership Conference in Atlanta.",
        kind:        "link",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  true,
        updatedAt:   "2026-02-01",
      },
      {
        id:          "res_014",
        title:       "Scholarship Portal",
        description: "Apply for FBLA-PBL scholarships ranging from $1,000 to $5,000. Open to graduating senior members.",
        kind:        "link",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  false,
        updatedAt:   "2026-01-15",
      },
      {
        id:          "res_015",
        title:       "FBLA Connect (Member Portal)",
        description: "Log in to manage your membership, view competitive event results, and access digital resources.",
        kind:        "link",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  false,
        updatedAt:   "2026-01-01",
      },
    ],
  },

  // ── Study Materials ───────────────────────────────────────────────────────
  {
    id:    "cat_study",
    title: "Study Materials",
    icon:  "school-outline",
    color: "#F59E0B",
    resources: [
      {
        id:          "res_016",
        title:       "Business Concepts Study Guide",
        description: "Covers all topics tested in written and objective events: accounting, economics, management, and marketing.",
        kind:        "pdf",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  false,
        updatedAt:   "2025-10-01",
        fileSize:    "3.1 MB",
      },
      {
        id:          "res_017",
        title:       "Introduction to FBLA Video Series",
        description: "A 5-part video series covering FBLA history, mission, competitive events, and chapter operations. Great for new members.",
        kind:        "video",
        url:         "https://www.youtube.com/@FBLAmedia",
        isFeatured:  false,
        updatedAt:   "2025-09-15",
      },
      {
        id:          "res_018",
        title:       "Parliamentary Procedure Reference",
        description: "Quick-reference card for Robert's Rules of Order, commonly tested in the Parliamentary Procedure event.",
        kind:        "pdf",
        url:         "https://www.fbla-pbl.org/",
        isFeatured:  false,
        updatedAt:   "2025-09-01",
        fileSize:    "420 KB",
      },
    ],
  },
];

// ─── Full event list (covers April 2026 for demo) ─────────────────────────────
// Replace with an API call: GET /events?month=2026-04
export const MOCK_ALL_EVENTS: CalendarEvent[] = [
  // ── March (carry-over) ──────────────────────────────────────────────────
  {
    id:              "evt_002",
    title:           "Chapter Officer Meeting",
    date:            "2026-03-28",
    time:            "3:30 PM",
    location:        "Room 204, Lincoln HS",
    type:            "meeting",
    isReminder:      false,
    allDay:          false,
    description:
      "Monthly officer meeting to review chapter progress, upcoming events, and assign responsibilities for the State Leadership Conference.",
    organizer:       "Lincoln HS Chapter",
    isRegistered:    true,
  },
  // ── April ───────────────────────────────────────────────────────────────
  {
    id:              "evt_003",
    title:           "NLC Registration Deadline",
    date:            "2026-04-01",
    time:            "11:59 PM",
    location:        "Online",
    type:            "deadline",
    isReminder:      true,
    allDay:          true,
    description:
      "Last day to register for the 2026 National Leadership Conference. Late registrations will not be accepted. Visit fbla.org to complete your registration.",
    organizer:       "FBLA National",
    registrationUrl: "https://www.fbla-pbl.org/",
    isRegistered:    false,
  },
  {
    id:              "evt_001",
    title:           "State Leadership Conference",
    date:            "2026-04-05",
    time:            "8:00 AM",
    location:        "Sacramento Convention Center",
    type:            "conference",
    isReminder:      true,
    allDay:          false,
    description:
      "California's annual State Leadership Conference. Compete in your events, attend workshops, elect state officers, and network with members from across the state.",
    organizer:       "FBLA California",
    registrationUrl: "https://www.fbla-pbl.org/",
    isRegistered:    true,
  },
  {
    id:              "evt_004",
    title:           "Business Plan Competition",
    date:            "2026-04-05",
    time:            "10:00 AM",
    location:        "Room 12A, Convention Center",
    type:            "competition",
    isReminder:      true,
    allDay:          false,
    description:
      "Present your business plan to a panel of industry judges. Teams of 1–3 members. Bring printed copies of your plan and any visual aids.",
    organizer:       "FBLA California",
    isRegistered:    true,
  },
  {
    id:              "evt_005",
    title:           "Leadership Workshop: Public Speaking",
    date:            "2026-04-08",
    time:            "4:00 PM",
    location:        "Room 204, Lincoln HS",
    type:            "workshop",
    isReminder:      false,
    allDay:          false,
    description:
      "Prepare for the Public Speaking competitive event. Practice rounds, feedback from advisers, and tips from last year's state finalists.",
    organizer:       "Lincoln HS Chapter",
    isRegistered:    false,
  },
  {
    id:              "evt_006",
    title:           "Fundraiser: Spring Bake Sale",
    date:            "2026-04-10",
    time:            "7:30 AM",
    location:        "Lincoln HS Main Hallway",
    type:            "meeting",
    isReminder:      false,
    allDay:          false,
    description:
      "Annual spring bake sale fundraiser to support NLC travel costs. All members are encouraged to bring baked goods and help during passing periods.",
    organizer:       "Lincoln HS Chapter",
    isRegistered:    false,
  },
  {
    id:              "evt_007",
    title:           "Coding & Programming Event",
    date:            "2026-04-14",
    time:            "1:00 PM",
    location:        "Computer Lab B, Lincoln HS",
    type:            "competition",
    isReminder:      true,
    allDay:          false,
    description:
      "Chapter-level practice round for the Coding & Programming competitive event. Timed challenges simulating the NLC format.",
    organizer:       "Lincoln HS Chapter",
    isRegistered:    true,
  },
  {
    id:              "evt_008",
    title:           "NLC Preparation Meeting",
    date:            "2026-04-17",
    time:            "3:30 PM",
    location:        "Room 204, Lincoln HS",
    type:            "meeting",
    isReminder:      false,
    allDay:          false,
    description:
      "Pre-NLC briefing covering travel logistics, hotel check-in, dress code expectations, event schedules, and chapter rules of conduct.",
    organizer:       "Lincoln HS Chapter",
    isRegistered:    false,
  },
  {
    id:              "evt_009",
    title:           "Scholarship Submission Deadline",
    date:            "2026-04-20",
    time:            "11:59 PM",
    location:        "Online",
    type:            "deadline",
    isReminder:      true,
    allDay:          true,
    description:
      "Deadline to submit FBLA-PBL scholarship applications for graduating seniors. Awards range from $1,000 to $5,000. Submit via the member portal.",
    organizer:       "FBLA National",
    registrationUrl: "https://www.fbla-pbl.org/",
    isRegistered:    false,
  },
  {
    id:              "evt_010",
    title:           "Social Media & Marketing Workshop",
    date:            "2026-04-22",
    time:            "4:00 PM",
    location:        "Room 204, Lincoln HS",
    type:            "workshop",
    isReminder:      false,
    allDay:          false,
    description:
      "Learn best practices for chapter social media, recruiting new members, and running community service campaigns. Guest speaker from a local marketing agency.",
    organizer:       "Lincoln HS Chapter",
    isRegistered:    false,
  },
  {
    id:              "evt_011",
    title:           "2026 National Leadership Conference",
    date:            "2026-04-29",
    time:            "All Day",
    location:        "Atlanta, Georgia",
    type:            "conference",
    isReminder:      true,
    allDay:          true,
    description:
      "The pinnacle of the FBLA year — the National Leadership Conference in Atlanta. Compete at the national level, attend keynote sessions, and celebrate achievements with 12,000+ members nationwide.",
    organizer:       "FBLA National",
    registrationUrl: "https://www.fbla-pbl.org/",
    isRegistered:    true,
  },
];