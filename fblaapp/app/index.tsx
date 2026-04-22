/**
 * app/index.tsx — Home / Dashboard Screen
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the first screen users see after logging in.
 * It serves as a "command center" — surfacing the most important
 * information at a glance without needing to dig into other tabs.
 *
 * SECTIONS (top → bottom):
 *   1. Header Banner   — Personalized greeting + FBLA logo area
 *   2. Quick Stats     — 4-up stat cards (events, days to NLC, members, points)
 *   3. Upcoming Events — Horizontal-scroll event cards (top 3)
 *   4. News Feed       — Vertical list of announcements & updates
 *
 * MODIFYING THIS SCREEN:
 *   • To change the greeting logic   → edit the `getGreeting()` function below
 *   • To change stats                → edit MOCK_STATS in constants/mockData.ts
 *   • To add/remove sections         → add/remove <Section> blocks in the JSX
 *   • To change colors/fonts         → edit constants/theme.ts
 *   • To swap mock data for real API → replace MOCK_* imports with hook calls
 *
 * DEPENDENCIES:
 *   npx expo install @expo/vector-icons react-native-safe-area-context
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import {
  MOCK_MEMBER,
  MOCK_STATS,
  MOCK_UPCOMING_EVENTS,
  MOCK_NEWS,
  NEWS_CATEGORY_META,
  EVENT_TYPE_META,
  type UpcomingEvent,
  type NewsItem,
} from "../constants/mockdata";

// ─────────────────────────────────────────────────────────────────────────────
// Utility: time-of-day greeting
// ─────────────────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: format ISO date string to a short human-readable label
// e.g. "2026-04-05" → "Apr 5"
// ─────────────────────────────────────────────────────────────────────────────
function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: how long ago was a news item published
// e.g. "2 days ago"
// ─────────────────────────────────────────────────────────────────────────────
function timeAgo(isoDatetime: string): string {
  const diff = Date.now() - new Date(isoDatetime).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Section header (title + optional "See All" link)
// ─────────────────────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Single stat card (2×2 grid)
// ─────────────────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      {/* Icon in a small gold circle */}
      <View style={styles.statIconCircle}>
        <Ionicons name={icon as any} size={16} color={COLORS.gold} />
      </View>
      {/* Big number */}
      <Text style={styles.statValue}>{value}</Text>
      {/* Label */}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Horizontal event card (inside ScrollView)
// ─────────────────────────────────────────────────────────────────────────────
interface EventCardProps {
  event: UpcomingEvent;
  onPress: () => void;
}

function EventCard({ event, onPress }: EventCardProps) {
  const meta  = EVENT_TYPE_META[event.type];
  const date  = new Date(event.date);
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day   = date.getDate();

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress} activeOpacity={0.85}>
      {/* Left: date block */}
      <View style={styles.eventDateBlock}>
        <Text style={styles.eventDateMonth}>{month}</Text>
        <Text style={styles.eventDateDay}>{day}</Text>
      </View>

      {/* Right: event details */}
      <View style={styles.eventInfo}>
        {/* Type badge */}
        <View style={[styles.eventBadge, { backgroundColor: meta.color + "22" }]}>
          <Ionicons name={meta.icon as any} size={10} color={meta.color} />
          <Text style={[styles.eventBadgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
        {/* Location row */}
        <View style={styles.eventMeta}>
          <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
          <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text>
        </View>
        {/* Time row */}
        <View style={styles.eventMeta}>
          <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
          <Text style={styles.eventMetaText}>{event.time}</Text>
        </View>
      </View>

      {/* Reminder bell — gold if reminder is set */}
      {/* <Ionicons
        name={event.isReminder ? "notifications" : "notifications-outline"}
        size={18}
        color={event.isReminder ? COLORS.gold : COLORS.textMuted}
        style={styles.eventBell}
      /> */}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: News feed item row
// ─────────────────────────────────────────────────────────────────────────────
interface NewsCardProps {
  item: NewsItem;
  onPress: () => void;
}

function NewsCard({ item, onPress }: NewsCardProps) {
  const catMeta = NEWS_CATEGORY_META[item.category];

  return (
    <TouchableOpacity
      style={[styles.newsCard, item.isPinned && styles.newsCardPinned]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Pinned indicator strip on the left */}
      {item.isPinned && <View style={styles.pinnedStrip} />}

      <View style={styles.newsContent}>
        {/* Top row: category badge + timestamp + unread dot */}
        <View style={styles.newsTopRow}>
          <View style={[styles.newsBadge, { backgroundColor: catMeta.color + "22" }]}>
            <Text style={[styles.newsBadgeText, { color: catMeta.color }]}>
              {catMeta.label}
            </Text>
          </View>
          <View style={styles.newsMetaRight}>
            {!item.isRead && <View style={styles.unreadDot} />}
            <Text style={styles.newsTime}>{timeAgo(item.publishedAt)}</Text>
          </View>
        </View>

        {/* Headline */}
        <Text style={[styles.newsTitle, item.isRead && styles.newsTitleRead]} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Summary preview */}
        <Text style={styles.newsSummary} numberOfLines={2}>
          {item.summary}
        </Text>

        {/* Footer: source + read more chevron */}
        <View style={styles.newsFooter}>
          <Text style={styles.newsSource}>{item.source}</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.gold} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen Component
// ─────────────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();

  // Local state: which news items have been marked read (optimistic UI)
  // Replace with a real state manager (Zustand, Redux, React Query) later.
  const [readIds, setReadIds] = useState<Set<string>>(
    new Set(MOCK_NEWS.filter((n) => n.isRead).map((n) => n.id))
  );

  function handleNewsPress(item: NewsItem) {
    // Mark as read locally
    setReadIds((prev) => new Set(prev).add(item.id));
    // TODO: navigate to NewsDetailScreen with item.id
    // router.push(`/news/${item.id}`);
  }

  function handleEventPress(event: UpcomingEvent) {
    // TODO: navigate to EventDetailScreen
    // router.push(`/events/${event.id}`);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─────────────────────────────────────────────────────────────────
            SECTION 1: Header / Greeting Banner
        ───────────────────────────────────────────────────────────────── */}
        <View style={styles.headerBanner}>
          {/* Left: greeting text */}
          <View style={styles.headerLeft}>
            <Text style={styles.greetingText}>
              {getGreeting()},
            </Text>
            <Text style={styles.memberName}>{MOCK_MEMBER.firstName} 👋</Text>
            {/* Chapter & role subtitle */}
            {/* <Text style={styles.chapterSubtitle}>
              {MOCK_MEMBER.role} · {MOCK_MEMBER.chapter}
            </Text> */}
          </View>

          {/* Right: avatar circle */}
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarInitials}>{MOCK_MEMBER.avatarInitials}</Text>
          </TouchableOpacity>
        </View>

        {/* FBLA gold accent bar — decorative separator under header */}
        <View style={styles.goldAccentBar} />

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 2: Quick Stats (2×2 grid)
        ───────────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="Your Dashboard" />
          <View style={styles.statsGrid}>
            {MOCK_STATS.map((stat) => (
              <StatCard
                key={stat.id}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 3: Upcoming Events (horizontal scroll)
        ───────────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="Upcoming Events"
            onSeeAll={() => router.push("/events")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsScroll}
          >
            {MOCK_UPCOMING_EVENTS.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 4: News Feed
        ───────────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="News & Announcements"
            onSeeAll={() => {
              /* TODO: router.push("/news") — full news list screen */
            }}
          />
          {MOCK_NEWS.map((item) => (
            <NewsCard
              key={item.id}
              item={{ ...item, isRead: readIds.has(item.id) }}
              onPress={() => handleNewsPress(item)}
            />
          ))}
        </View>

        {/* Bottom spacer so last card clears the tab bar */}
        <View style={{ height: SPACING["2xl"] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Layout ────────────────────────────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },

  // ── Section wrapper ────────────────────────────────────────────────────────
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gold,
    fontWeight: "600",
  },

  // ── Header Banner ─────────────────────────────────────────────────────────
  headerBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  greetingText: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  memberName: {
    fontSize: FONT_SIZE["2xl"],
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    fontWeight: "700",
    marginTop: 2,
  },
  chapterSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: "400",
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.goldGlow,
  },
  avatarInitials: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bold,
    color: COLORS.navyDark,
    fontWeight: "700",
  },

  // Gold decorative separator under header
  goldAccentBar: {
    height: 2,
    backgroundColor: COLORS.gold,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: RADIUS.full,
    opacity: 0.6,
  },

  // ── Stats Grid (2×2) ──────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  statCard: {
    // Each card takes just under half the available width (accounting for gap)
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
    alignItems: "flex-start",
    ...SHADOWS.card,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold + "22",  // 13% opacity gold
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZE["2xl"],
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    fontWeight: "700",
    lineHeight: 28,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: "400",
  },

  // ── Events Horizontal Scroll ───────────────────────────────────────────────
  eventsScroll: {
    paddingRight: SPACING.lg,   // Trailing padding inside the scroll
    gap: SPACING.md,
  },
  eventCard: {
    width: 240,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "flex-start",
    ...SHADOWS.card,
  },
  eventDateBlock: {
    width: 44,
    backgroundColor: COLORS.navyLight,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    marginRight: SPACING.md,
  },
  eventDateMonth: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bold,
    color: COLORS.gold,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  eventDateDay: {
    fontSize: FONT_SIZE.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    fontWeight: "700",
    lineHeight: 24,
  },
  eventInfo: {
    flex: 1,
  },
  eventBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    gap: 4,
    marginBottom: 6,
  },
  eventBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semibold,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  eventTitle: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.textPrimary,
    fontWeight: "600",
    lineHeight: 18,
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  eventMetaText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    flex: 1,
    fontWeight: "400",
  },
  eventBell: {
    marginLeft: SPACING.xs,
    marginTop: 2,
  },

  // ── News Cards ─────────────────────────────────────────────────────────────
  newsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    flexDirection: "row",
    overflow: "hidden",
    ...SHADOWS.card,
  },
  newsCardPinned: {
    borderColor: COLORS.gold + "55",  // Subtle gold border for pinned items
  },
  pinnedStrip: {
    width: 3,
    backgroundColor: COLORS.gold,
  },
  newsContent: {
    flex: 1,
    padding: SPACING.md,
  },
  newsTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  newsBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  newsBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semibold,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  newsMetaRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
  },
  newsTime: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontWeight: "400",
  },
  newsTitle: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.semibold,
    color: COLORS.textPrimary,
    fontWeight: "600",
    lineHeight: 21,
    marginBottom: SPACING.xs,
  },
  newsTitleRead: {
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  newsSummary: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: "400",
  },
  newsFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  newsSource: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
});