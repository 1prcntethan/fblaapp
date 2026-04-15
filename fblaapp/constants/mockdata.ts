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

// ─── Logged-in member ────────────────────────────────────────────────────────
// Used on the Home screen (greeting) and the Profile screen (full detail).
// Extend this object freely — add fields like `phone`, `grade`, etc.
// When connecting a real auth system, replace this with a useAuth() hook result.
export const MOCK_MEMBER = { 
  id:             "mbr_001",
  firstName:      "Alexis",
  lastName:       "Ma",
  email:          "alexis.ma@mtv.edu",
  grade:          "12th Grade",
  chapter:        "Mountain View High School",
  chapterId:      "CA-0412",             // Chapter ID shown on the digital member card
  state:          "Washington",
  region:         "Region 4",
  memberSince:    "2022",               // Year joined FBLA
  role:           "Chapter Vice President",
  avatarInitials: "AM",
  // avatarUrl: require("../assets/avatar.png"), // Uncomment when real assets exist
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

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY / SOCIAL DATA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The social platforms the chapter has accounts on.
 * "platform" values are used as filter keys — keep them lowercase, no spaces.
 * To add a new platform: add it here, add its metadata to SOCIAL_PLATFORM_META,
 * and add posts with that platform value to MOCK_SOCIAL_POSTS.
 */
export type SocialPlatform =
  | "instagram"
  | "twitter"
  | "facebook"
  | "youtube";

/**
 * Metadata for each platform — brand color, icon name, display label, and URL scheme.
 * icon: Ionicons name. For platforms without a specific Ionicons glyph, use "globe-outline".
 */
export const SOCIAL_PLATFORM_META: Record<
  SocialPlatform,
  {
    label:       string;
    color:       string;   // Brand hex color
    icon:        string;   // Ionicons name
    urlScheme:   string;   // Used to build the "View on X" deep-link
  }
> = {
  instagram: {
    label:     "Instagram",
    color:     "#E1306C",
    icon:      "logo-instagram",
    urlScheme: "https://instagram.com/",
  },
  twitter: {
    label:     "X (Twitter)",
    color:     "#1DA1F2",
    icon:      "logo-twitter",
    urlScheme: "https://twitter.com/",
  },
  facebook: {
    label:     "Facebook",
    color:     "#1877F2",
    icon:      "logo-facebook",
    urlScheme: "https://facebook.com/",
  },
  youtube: {
    label:     "YouTube",
    color:     "#FF0000",
    icon:      "logo-youtube",
    urlScheme: "https://youtube.com/",
  },
};

/**
 * A chapter social media account (shown in the "Follow Us" header strip).
 */
export interface SocialAccount {
  id:        string;
  platform:  SocialPlatform;
  handle:    string;         // e.g. "@LincolnFBLA"
  url:       string;         // Full profile URL
  followers: string;         // Display string: "1.2K", "840", etc.
}

/**
 * A single social media post in the unified feed.
 *
 * hasImage: true means the card renders an image placeholder block.
 *   → Replace with a real <Image> component when you have actual post images.
 *
 * engagement: likes/comments/shares — shown as social proof below the post text.
 */
export interface SocialPost {
  id:          string;
  platform:    SocialPlatform;
  accountId:   string;       // References a SocialAccount.id
  handle:      string;       // Display handle (may differ from account — e.g. national vs chapter)
  authorName:  string;       // Display name shown on the post card
  content:     string;       // Post body text
  publishedAt: string;       // ISO datetime
  hasImage:    boolean;      // Whether to render an image block
  imageLabel?: string;       // Short label shown inside the image placeholder (e.g. "Photo • NLC 2026")
  imageColor?: string;       // Background color for the placeholder block
  url:         string;       // Direct link to the post
  engagement: {
    likes:    number;
    comments: number;
    shares:   number;
  };
  isPinned: boolean;         // Pinned posts appear first regardless of sort
}

// ─── Chapter Social Accounts ─────────────────────────────────────────────────
// Update handles and URLs to match the real chapter accounts.
export const MOCK_SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    id:        "acc_ig",
    platform:  "instagram",
    handle:    "@LincolnFBLA",
    url:       "https://instagram.com/",
    followers: "1.2K",
  },
  {
    id:        "acc_tw",
    platform:  "twitter",
    handle:    "@LincolnFBLA",
    url:       "https://twitter.com/",
    followers: "840",
  },
  {
    id:        "acc_fb",
    platform:  "facebook",
    handle:    "Lincoln HS FBLA",
    url:       "https://facebook.com/",
    followers: "2.1K",
  },
  {
    id:        "acc_yt",
    platform:  "youtube",
    handle:    "Lincoln HS FBLA",
    url:       "https://youtube.com/",
    followers: "310",
  },
];

// ─── Social Posts Feed ────────────────────────────────────────────────────────
// In production: replace with a call to your social media aggregator API
// (e.g. a backend that caches posts from the Instagram Graph API, Twitter API v2, etc.)
export const MOCK_SOCIAL_POSTS: SocialPost[] = [
  // ── Pinned / featured ─────────────────────────────────────────────────────
  {
    id:         "post_001",
    platform:   "instagram",
    accountId:  "acc_ig",
    handle:     "@LincolnFBLA",
    authorName: "Lincoln HS FBLA",
    content:
      "🏆 We're heading to NLC 2026 in Atlanta! 8 members qualified across 6 competitive events. So proud of this team. See you in Atlanta! 🇺🇸 #FBLA #NLC2026 #LincolnFBLA",
    publishedAt: "2026-03-22T16:00:00Z",
    hasImage:    true,
    imageLabel:  "Photo • NLC Qualifier Announcement",
    imageColor:  "#1A3A5C",
    url:         "https://instagram.com/",
    engagement:  { likes: 214, comments: 31, shares: 18 },
    isPinned:    true,
  },
  {
    id:         "post_002",
    platform:   "twitter",
    accountId:  "acc_tw",
    handle:     "@LincolnFBLA",
    authorName: "Lincoln HS FBLA",
    content:
      "Reminder ⏰ — NLC registration closes April 1st at 11:59 PM. If you qualified, make sure your adviser completes registration ASAP. Link in bio! #FBLA #NLC2026",
    publishedAt: "2026-03-25T09:30:00Z",
    hasImage:    false,
    url:         "https://twitter.com/",
    engagement:  { likes: 47, comments: 8, shares: 22 },
    isPinned:    true,
  },

  // ── Regular posts (most recent first) ─────────────────────────────────────
  {
    id:         "post_003",
    platform:   "instagram",
    accountId:  "acc_ig",
    handle:     "@LincolnFBLA",
    authorName: "Lincoln HS FBLA",
    content:
      "Gold Seal Chapter of Merit — ACHIEVED! 🥇 Our chapter earned the highest chapter recognition at the Regional Leadership Conference. Thank you to every member who put in the work this year. 💙💛 #FBLA #GoldSeal",
    publishedAt: "2026-03-16T18:00:00Z",
    hasImage:    true,
    imageLabel:  "Photo • Gold Seal Award Ceremony",
    imageColor:  "#2A1A4A",
    url:         "https://instagram.com/",
    engagement:  { likes: 189, comments: 44, shares: 12 },
    isPinned:    false,
  },
  {
    id:         "post_004",
    platform:   "facebook",
    accountId:  "acc_fb",
    handle:     "Lincoln HS FBLA",
    authorName: "Lincoln HS FBLA",
    content:
      "📣 Applications for FBLA-PBL scholarships are now open! Graduating seniors can apply for awards ranging from $1,000 to $5,000. Deadline is May 15, 2026. Visit the Resources tab in the FBLA Member App or go to fbla-pbl.org to apply.",
    publishedAt: "2026-03-11T10:00:00Z",
    hasImage:    false,
    url:         "https://facebook.com/",
    engagement:  { likes: 93, comments: 17, shares: 38 },
    isPinned:    false,
  },
  {
    id:         "post_005",
    platform:   "youtube",
    accountId:  "acc_yt",
    handle:     "Lincoln HS FBLA",
    authorName: "Lincoln HS FBLA",
    content:
      "🎥 NEW VIDEO: Full recap of our Regional Leadership Conference experience — competitions, workshops, networking, and the award ceremony. Watch now!",
    publishedAt: "2026-03-18T14:00:00Z",
    hasImage:    true,
    imageLabel:  "▶  Video • RLC 2026 Recap",
    imageColor:  "#1A0A0A",
    url:         "https://youtube.com/",
    engagement:  { likes: 76, comments: 23, shares: 9 },
    isPinned:    false,
  },
  {
    id:         "post_006",
    platform:   "twitter",
    accountId:  "acc_tw",
    handle:     "@LincolnFBLA",
    authorName: "Lincoln HS FBLA",
    content:
      "Big congratulations to our Business Plan team — Jordan, Marcus & Priya — for placing 1st at regionals! 🎉 Next stop: State Leadership Conference. #FBLA #BusinessPlan",
    publishedAt: "2026-03-15T20:00:00Z",
    hasImage:    false,
    url:         "https://twitter.com/",
    engagement:  { likes: 102, comments: 19, shares: 14 },
    isPinned:    false,
  },
  {
    id:         "post_007",
    platform:   "instagram",
    accountId:  "acc_ig",
    handle:     "@LincolnFBLA",
    authorName: "Lincoln HS FBLA",
    content:
      "Spring Bake Sale is THIS Friday, April 10! 🍪🧁 All proceeds go toward NLC travel costs. Come hungry and support your chapter! Room 204 at lunch.",
    publishedAt: "2026-04-07T08:00:00Z",
    hasImage:    true,
    imageLabel:  "Photo • Spring Bake Sale Flyer",
    imageColor:  "#2A2A0A",
    url:         "https://instagram.com/",
    engagement:  { likes: 61, comments: 9, shares: 5 },
    isPinned:    false,
  },
  {
    id:         "post_008",
    platform:   "facebook",
    accountId:  "acc_fb",
    handle:     "Lincoln HS FBLA",
    authorName: "Lincoln HS FBLA",
    content:
      "📋 Meeting recap from March 28: We reviewed State Leadership Conference logistics, confirmed event assignments, and voted on the chapter community service project for spring. Minutes are posted to the chapter Google Drive.",
    publishedAt: "2026-03-28T17:30:00Z",
    hasImage:    false,
    url:         "https://facebook.com/",
    engagement:  { likes: 34, comments: 6, shares: 2 },
    isPinned:    false,
  },
  {
    id:         "post_009",
    platform:   "instagram",
    accountId:  "acc_ig",
    handle:     "@fbla",
    authorName: "FBLA-PBL National",
    content:
      "The 2026 NLC theme is officially 'Ignite the Future' 🔥 We can't wait to see 12,000+ future business leaders come together in Atlanta this April. Are YOU ready? #FBLA #NLC2026 #IgniteTheFuture",
    publishedAt: "2026-03-20T12:00:00Z",
    hasImage:    true,
    imageLabel:  "Graphic • NLC 2026 Theme Reveal",
    imageColor:  "#0A1A3A",
    url:         "https://instagram.com/fbla",
    engagement:  { likes: 4821, comments: 312, shares: 890 },
    isPinned:    false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE DATA
// ─────────────────────────────────────────────────────────────────────────────

// ─── Competitive Event History ────────────────────────────────────────────────
/**
 * A competitive event the member has participated in (current year or past).
 * `placement` is only set if the member placed — leave undefined if they
 * did not place or results are not yet available.
 */
export interface CompetitiveEventRecord {
  id:           string;
  eventName:    string;        // Official FBLA event name
  year:         string;        // "2025–2026"
  level:        "chapter" | "region" | "state" | "national";
  placement?:   number;        // 1st, 2nd, 3rd, etc. — undefined if no placement
  partners?:    string[];      // Co-competitors for team events
  isCurrentYear: boolean;      // True → shown in "This Year" section
}

// Level display metadata
export const COMPETITION_LEVEL_META: Record<
  CompetitiveEventRecord["level"],
  { label: string; color: string }
> = {
  chapter:  { label: "Chapter",  color: "#6B7A8D" },
  region:   { label: "Regional", color: "#22C55E" },
  state:    { label: "State",    color: "#3B82F6" },
  national: { label: "National", color: "#FFB81C" },
};

export const MOCK_COMPETITIVE_EVENTS: CompetitiveEventRecord[] = [
  // ── Current year (2025–2026) ──────────────────────────────────────────────
  {
    id:            "ce_001",
    eventName:     "Business Plan",
    year:          "2025–2026",
    level:         "region",
    placement:     1,
    partners:      ["Marcus Chen", "Priya Patel"],
    isCurrentYear: true,
  },
  {
    id:            "ce_002",
    eventName:     "Coding & Programming",
    year:          "2025–2026",
    level:         "region",
    placement:     2,
    isCurrentYear: true,
  },
  {
    id:            "ce_003",
    eventName:     "Public Speaking",
    year:          "2025–2026",
    level:         "region",
    placement:     undefined,   // Did not place
    isCurrentYear: true,
  },
  // ── Prior years ───────────────────────────────────────────────────────────
  {
    id:            "ce_004",
    eventName:     "Business Plan",
    year:          "2024–2025",
    level:         "state",
    placement:     3,
    partners:      ["Marcus Chen", "Priya Patel"],
    isCurrentYear: false,
  },
  {
    id:            "ce_005",
    eventName:     "Coding & Programming",
    year:          "2024–2025",
    level:         "state",
    placement:     undefined,
    isCurrentYear: false,
  },
  {
    id:            "ce_006",
    eventName:     "Introduction to Business",
    year:          "2023–2024",
    level:         "region",
    placement:     1,
    isCurrentYear: false,
  },
];

// ─── Achievement Badges ────────────────────────────────────────────────────────
/**
 * An earned achievement badge shown on the profile.
 * `earnedAt` is optional — some badges (like "Chapter Officer") are role-based
 * and don't have a specific earn date.
 *
 * To add a new badge type: add an entry here. The icon is an Ionicons name.
 */
export interface AchievementBadge {
  id:          string;
  title:       string;
  description: string;   // Shown in a tooltip / detail view
  icon:        string;   // Ionicons name
  color:       string;   // Badge accent color
  earnedAt?:   string;   // ISO date or year string
  isLocked:    boolean;  // True → badge is greyed out (not yet earned — aspirational)
}

export const MOCK_BADGES: AchievementBadge[] = [
  {
    id:          "bdg_001",
    title:       "NLC Qualifier",
    description: "Qualified to compete at the National Leadership Conference.",
    icon:        "trophy",
    color:       "#FFB81C",
    earnedAt:    "2026",
    isLocked:    false,
  },
  {
    id:          "bdg_002",
    title:       "Gold Seal Chapter",
    description: "Member of a Gold Seal Chapter of Merit — the highest chapter recognition.",
    icon:        "ribbon",
    color:       "#FFB81C",
    earnedAt:    "2026",
    isLocked:    false,
  },
  {
    id:          "bdg_003",
    title:       "Chapter Officer",
    description: "Elected or appointed to a chapter officer position.",
    icon:        "star",
    color:       "#3B82F6",
    earnedAt:    "2025",
    isLocked:    false,
  },
  {
    id:          "bdg_004",
    title:       "Regional Placer",
    description: "Placed in the top 3 at a Regional Leadership Conference event.",
    icon:        "medal",
    color:       "#22C55E",
    earnedAt:    "2025",
    isLocked:    false,
  },
  {
    id:          "bdg_005",
    title:       "State Competitor",
    description: "Competed at the State Leadership Conference.",
    icon:        "flag",
    color:       "#8B5CF6",
    earnedAt:    "2025",
    isLocked:    false,
  },
  {
    id:          "bdg_006",
    title:       "3-Year Member",
    description: "Active FBLA member for 3 or more consecutive years.",
    icon:        "time",
    color:       "#F59E0B",
    earnedAt:    "2025",
    isLocked:    false,
  },
  {
    id:          "bdg_007",
    title:       "Community Service",
    description: "Completed 20+ hours of FBLA community service projects.",
    icon:        "heart",
    color:       "#EF4444",
    earnedAt:    "2025",
    isLocked:    false,
  },
  {
    id:          "bdg_008",
    title:       "National Officer",
    description: "Elected as a FBLA national officer. (Aspirational)",
    icon:        "earth",
    color:       "#6B7A8D",
    earnedAt:    undefined,
    isLocked:    true,   // Not yet earned — shown as locked/aspirational
  },
];

// ─── Chapter Info ─────────────────────────────────────────────────────────────
/**
 * Information about the member's chapter.
 * In production: GET /chapter/:id
 */
export const MOCK_CHAPTER_INFO = {
  name:           "Lincoln High School FBLA",
  id:             "CA-0412",
  adviser:        "Ms. Patricia Chen",
  adviserEmail:   "p.chen@lincolnhs.edu",
  school:         "Lincoln High School",
  city:           "Sacramento",
  state:          "California",
  region:         "Region 4",
  totalMembers:   84,
  foundedYear:    "2008",
  websiteUrl:     "https://www.fbla-pbl.org/",
} as const;

// ─── Settings Sections ────────────────────────────────────────────────────────
/**
 * Settings rows are grouped into sections. Each row has an action type:
 *   "navigate" → push a new screen (route provided)
 *   "toggle"   → renders a Switch (value provided separately)
 *   "action"   → fires a callback (e.g. Sign Out, Share Profile)
 *   "link"     → opens a URL via Linking.openURL
 *
 * To add a new setting: append a SettingsRow to the appropriate section,
 * or add a new section object.
 */
export type SettingsActionType = "navigate" | "toggle" | "action" | "link";

export interface SettingsRow {
  id:          string;
  label:       string;
  icon:        string;      // Ionicons name
  iconColor:   string;      // Background tint for the icon cell
  actionType:  SettingsActionType;
  route?:      string;      // For "navigate" type
  url?:        string;      // For "link" type
  value?:      boolean;     // For "toggle" type — initial value
  destructive?: boolean;    // True → label renders in red (e.g. Sign Out)
}

export interface SettingsSection {
  id:    string;
  title: string;
  rows:  SettingsRow[];
}

export const MOCK_SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id:    "sec_account",
    title: "Account",
    rows: [
      {
        id:         "set_edit_profile",
        label:      "Edit Profile",
        icon:       "person-outline",
        iconColor:  "#3B82F6",
        actionType: "action",     // TODO: navigate to EditProfileScreen
      },
      {
        id:         "set_member_card",
        label:      "Digital Member Card",
        icon:       "card-outline",
        iconColor:  "#FFB81C",
        actionType: "action",     // TODO: show digital ID card modal
      },
      {
        id:         "set_change_password",
        label:      "Change Password",
        icon:       "lock-closed-outline",
        iconColor:  "#8B5CF6",
        actionType: "action",     // TODO: navigate to ChangePasswordScreen
      },
    ],
  },
  {
    id:    "sec_notifications",
    title: "Notifications",
    rows: [
      {
        id:         "set_notif_events",
        label:      "Event Reminders",
        icon:       "calendar-outline",
        iconColor:  "#22C55E",
        actionType: "toggle",
        value:      true,
      },
      {
        id:         "set_notif_news",
        label:      "News & Announcements",
        icon:       "newspaper-outline",
        iconColor:  "#3B82F6",
        actionType: "toggle",
        value:      true,
      },
      {
        id:         "set_notif_deadlines",
        label:      "Deadline Alerts",
        icon:       "alarm-outline",
        iconColor:  "#EF4444",
        actionType: "toggle",
        value:      true,
      },
      {
        id:         "set_notif_social",
        label:      "Social Media Posts",
        icon:       "share-social-outline",
        iconColor:  "#E1306C",
        actionType: "toggle",
        value:      false,
      },
    ],
  },
  {
    id:    "sec_about",
    title: "About",
    rows: [
      {
        id:         "set_fbla_website",
        label:      "FBLA-PBL Website",
        icon:       "globe-outline",
        iconColor:  "#FFB81C",
        actionType: "link",
        url:        "https://www.fbla-pbl.org/",
      },
      {
        id:         "set_privacy",
        label:      "Privacy Policy",
        icon:       "shield-outline",
        iconColor:  "#6B7A8D",
        actionType: "link",
        url:        "https://www.fbla-pbl.org/",
      },
      {
        id:         "set_terms",
        label:      "Terms of Service",
        icon:       "document-text-outline",
        iconColor:  "#6B7A8D",
        actionType: "link",
        url:        "https://www.fbla-pbl.org/",
      },
      {
        id:         "set_version",
        label:      "App Version 1.0.0",
        icon:       "information-circle-outline",
        iconColor:  "#6B7A8D",
        actionType: "action",    // No-op — just displays version info
      },
    ],
  },
  {
    id:    "sec_danger",
    title: "",   // No visible section title for the danger zone
    rows: [
      {
        id:          "set_signout",
        label:       "Sign Out",
        icon:        "log-out-outline",
        iconColor:   "#EF4444",
        actionType:  "action",
        destructive: true,
      },
    ],
  },
];