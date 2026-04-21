/**
 * app/community.tsx — Community / Social Media Screen
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A unified social media hub that aggregates the chapter's posts from all
 * platforms into one scrollable feed — no platform-switching required.
 *
 * LAYOUT (top → bottom):
 *   1. "Follow Us" Accounts Strip  — quick-follow cards for each platform account
 *   2. Platform Filter Tabs        — All / Instagram / X / Facebook / YouTube
 *   3. Social Feed                 — post cards sorted: pinned first, then newest
 *
 * EACH POST CARD SHOWS:
 *   • Platform color bar + icon badge (top-right)
 *   • Author avatar (initials) + display name + handle + timestamp
 *   • Post body text (expandable — "Show more" if > 3 lines)
 *   • Optional image/video placeholder block (swap in <Image> when you have real media)
 *   • Engagement row: likes, comments, shares
 *   • "View on [Platform]" button → opens the native post URL
 *
 * REAL API INTEGRATION:
 *   Social platforms require OAuth and platform-specific API credentials.
 *   The recommended production approach is a lightweight backend aggregator:
 *     1. A server-side job fetches & caches posts from each platform's API
 *        (Instagram Graph API, Twitter API v2, Facebook Graph API, YouTube Data API)
 *     2. Your React Native app calls your own backend: GET /api/social-feed
 *     3. Replace MOCK_SOCIAL_POSTS import with a useQuery / useSWR hook
 *   This avoids embedding OAuth tokens in the mobile app bundle.
 *
 * MODIFYING:
 *   • Add/edit posts          → constants/mockData.ts (MOCK_SOCIAL_POSTS)
 *   • Add a platform          → add to SocialPlatform type + SOCIAL_PLATFORM_META
 *   • Change account handles  → constants/mockData.ts (MOCK_SOCIAL_ACCOUNTS)
 *   • Swap image placeholders → replace <ImagePlaceholder> with <Image source={...} />
 *   • Engagement interactions → fill in handleLike / handleShare stubs below
 *
 * DEPENDENCIES:
 *   npx expo install react-native-safe-area-context @expo/vector-icons
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  COLORS,
  FONTS,
  FONT_SIZE,
  SPACING,
  RADIUS,
  SHADOWS,
} from "../constants/theme";
import {
  MOCK_SOCIAL_ACCOUNTS,
  MOCK_SOCIAL_POSTS,
  SOCIAL_PLATFORM_META,
  type SocialPlatform,
  type SocialPost,
  type SocialAccount,
} from "../constants/mockdata";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

// Filter tab options — "all" + one per platform that has posts
// To add a platform: add to SOCIAL_PLATFORM_META and this array
const PLATFORM_FILTERS: Array<{ key: "all" | SocialPlatform; label: string }> = [
  { key: "all",       label: "All" },
  { key: "instagram", label: "Instagram" },
  { key: "twitter",   label: "X" },
  { key: "facebook",  label: "Facebook" },
  { key: "youtube",   label: "YouTube" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility: human-readable relative time  e.g. "2h ago", "Mar 15"
// ─────────────────────────────────────────────────────────────────────────────
function relativeTime(isoDatetime: string): string {
  const diff  = Date.now() - new Date(isoDatetime).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;

  // Older than a week → show the date
  return new Date(isoDatetime).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: compact number  e.g. 4821 → "4.8K"
// ─────────────────────────────────────────────────────────────────────────────
function compactNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: get initials from a display name  "FBLA-PBL National" → "FN"
// ─────────────────────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Platform Filter Tabs
// Horizontal scroll row of tab pills — one per platform + "All"
// ─────────────────────────────────────────────────────────────────────────────
interface PlatformTabsProps {
  active:   "all" | SocialPlatform;
  onChange: (key: "all" | SocialPlatform) => void;
  counts:   Record<string, number>;   // key → post count (for badges)
}

function PlatformTabs({ active, onChange, counts }: PlatformTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsRow}
    >
      {PLATFORM_FILTERS.map(({ key, label }) => {
        const isActive    = key === active;
        const platformColor =
          key === "all"
            ? COLORS.gold
            : SOCIAL_PLATFORM_META[key as SocialPlatform].color;
        const count = counts[key] ?? 0;
        const icon  = key === "all" ? null : SOCIAL_PLATFORM_META[key as SocialPlatform].icon;

        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.tab,
              isActive && { backgroundColor: platformColor + "22", borderColor: platformColor },
            ]}
            onPress={() => onChange(key)}
            activeOpacity={0.75}
          >
            {/* Platform icon (not shown for "All") */}
            {icon && (
              <Ionicons
                name={icon as any}
                size={14}
                color={isActive ? platformColor : COLORS.textMuted}
              />
            )}
            <Text
              style={[
                styles.tabLabel,
                isActive && { color: platformColor, fontWeight: "700" },
              ]}
            >
              {label}
            </Text>
            {/* Post count badge */}
            {count > 0 && (
              <View
                style={[
                  styles.tabBadge,
                  { backgroundColor: isActive ? platformColor : COLORS.cardBorder },
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    { color: isActive ? COLORS.navyDark : COLORS.textMuted },
                  ]}
                >
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Account Card (in the "Follow Us" strip)
// ─────────────────────────────────────────────────────────────────────────────
interface AccountCardProps {
  account: SocialAccount;
}

function AccountCard({ account }: AccountCardProps) {
  const meta = SOCIAL_PLATFORM_META[account.platform];

  function handleFollow() {
    Linking.openURL(account.url).catch(() =>
      console.warn("[Community] Cannot open:", account.url)
    );
  }

  return (
    <TouchableOpacity
      style={styles.accountCard}
      onPress={handleFollow}
      activeOpacity={0.85}
    >
      {/* Platform icon circle */}
      <View style={[styles.accountIconCircle, { backgroundColor: meta.color + "22" }]}>
        <Ionicons name={meta.icon as any} size={20} color={meta.color} />
      </View>

      {/* Handle + follower count */}
      <Text style={styles.accountHandle} numberOfLines={1}>
        {account.handle}
      </Text>
      <Text style={styles.accountFollowers}>{account.followers} followers</Text>

      {/* Follow CTA */}
      <View style={[styles.followBtn, { borderColor: meta.color }]}>
        <Text style={[styles.followBtnText, { color: meta.color }]}>Follow</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Image / Video Placeholder
// Replace this entire component with <Image source={{ uri: post.imageUrl }} />
// once you have real media URLs from the social API.
// ─────────────────────────────────────────────────────────────────────────────
interface ImagePlaceholderProps {
  label?: string;
  color?: string;
  isVideo?: boolean;
}

function ImagePlaceholder({ label, color, isVideo }: ImagePlaceholderProps) {
  return (
    <View style={[styles.imagePlaceholder, { backgroundColor: color ?? COLORS.navyMid }]}>
      <Ionicons
        name={isVideo ? "play-circle-outline" : "image-outline"}
        size={32}
        color={COLORS.textMuted}
      />
      {label && (
        <Text style={styles.imagePlaceholderLabel}>{label}</Text>
      )}
      {/* TODO: Replace with actual <Image> component:
           <Image
             source={{ uri: post.imageUrl }}
             style={{ width: "100%", height: "100%" }}
             resizeMode="cover"
           />
      */}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Post Card
// The main social post card — mirrors the look of a native social post.
// ─────────────────────────────────────────────────────────────────────────────
interface PostCardProps {
  post:        SocialPost;
  isExpanded:  boolean;
  onToggleExpand: () => void;
}

function PostCard({ post, isExpanded, onToggleExpand }: PostCardProps) {
  const meta       = SOCIAL_PLATFORM_META[post.platform];
  const isVideo    = post.platform === "youtube";
  const initials   = getInitials(post.authorName);

  // ── Engagement interaction stubs ──────────────────────────────────────────
  // Fill these in with your real like/share logic (API calls, optimistic updates).
  function handleLike() {
    // TODO: POST /api/social/like { postId: post.id }
    console.log("[Community] Like post:", post.id);
  }
  function handleShare() {
    // TODO: Use expo-sharing or Share.share() from react-native
    console.log("[Community] Share post:", post.id);
  }
  function handleViewOnPlatform() {
    Linking.openURL(post.url).catch(() =>
      console.warn("[Community] Cannot open:", post.url)
    );
  }

  // Determine if "Show more" toggle is needed.
  // We use a line-count limit (3 lines) as the threshold.
  const TRUNCATE_LINES = 3;

  return (
    <View style={[styles.postCard, post.isPinned && styles.postCardPinned]}>

      {/* ── Pinned indicator ─────────────────────────────────────────────── */}
      

      {/* ── Platform color bar (left edge) ───────────────────────────────── */}
      <View style={[styles.platformBar, { backgroundColor: meta.color }]} />

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <View style={styles.postBody}>

        {/* Author row: avatar + name/handle + timestamp + platform badge */}
        <View style={styles.authorRow}>
          {/* Avatar circle with initials */}
          <View style={[styles.avatarCircle, { backgroundColor: meta.color + "33" }]}>
            <Text style={[styles.avatarInitials, { color: meta.color }]}>
              {initials}
            </Text>
          </View>

          {/* Name + handle + time */}
          <View style={styles.authorInfo}>
            <Text style={styles.authorName} numberOfLines={1}>
              {post.authorName}
            </Text>
            <View style={styles.authorSubRow}>
              <Text style={styles.authorHandle}>{post.handle}</Text>
              <View style={styles.authorDot} />
              <Text style={styles.postTime}>{relativeTime(post.publishedAt)}</Text>
            </View>
          </View>

          {/* Platform icon badge (top-right) */}
          <View style={[styles.platformBadge, { backgroundColor: meta.color + "22" }]}>
            <Ionicons name={meta.icon as any} size={16} color={meta.color} />
          </View>
        </View>

        {/* Post text — collapsible */}
        <Text
          style={styles.postContent}
          numberOfLines={isExpanded ? undefined : TRUNCATE_LINES}
        >
          {post.content}
        </Text>

        {/* "Show more / Show less" toggle — only rendered if content is long */}
        {post.content.length > 140 && (
          <TouchableOpacity onPress={onToggleExpand} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
            <Text style={styles.showMoreText}>
              {isExpanded ? "Show less" : "Show more"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Image / video placeholder */}
        {post.hasImage && (
          <ImagePlaceholder
            label={post.imageLabel}
            color={post.imageColor}
            isVideo={isVideo}
          />
        )}

        {/* ── Engagement bar ─────────────────────────────────────────────── */}
        <View style={styles.engagementBar}>
          {/* Left: like + comment + share counts */}
          <View style={styles.engagementLeft}>
            <TouchableOpacity
              style={styles.engagementBtn}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Ionicons name="heart-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.engagementCount}>
                {compactNumber(post.engagement.likes)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.engagementBtn} activeOpacity={0.7}>
              <Ionicons name="chatbubble-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.engagementCount}>
                {compactNumber(post.engagement.comments)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.engagementBtn}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-redo-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.engagementCount}>
                {compactNumber(post.engagement.shares)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right: "View on Platform" CTA */}
          <TouchableOpacity
            style={[styles.viewOnBtn, { borderColor: meta.color + "55" }]}
            onPress={handleViewOnPlatform}
            activeOpacity={0.8}
          >
            <Ionicons name={meta.icon as any} size={12} color={meta.color} />
            <Text style={[styles.viewOnText, { color: meta.color }]}>
              View on {meta.label}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen Component
// ─────────────────────────────────────────────────────────────────────────────
export default function CommunityScreen() {

  // ── State ──────────────────────────────────────────────────────────────────
  // Active platform filter tab
  const [activePlatform, setActivePlatform] = useState<"all" | SocialPlatform>("all");

  // Track which post cards are expanded (show full text)
  // Key: post.id, Value: true = expanded
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  // ── Toggle post expansion ───────────────────────────────────────────────────
  const toggleExpand = useCallback((postId: string) => {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }, []);

  // ── Filtered + sorted posts ─────────────────────────────────────────────────
  // Sort order: pinned first, then by publishedAt descending (newest first)
  const filteredPosts = useMemo<SocialPost[]>(() => {
    return MOCK_SOCIAL_POSTS
      .filter((p) => activePlatform === "all" || p.platform === activePlatform)
      .sort((a, b) => {
        // Pinned posts always float to top
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        // Then newest first
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [activePlatform]);

  // ── Post counts per platform (for tab badges) ───────────────────────────────
  const postCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = { all: MOCK_SOCIAL_POSTS.length };
    MOCK_SOCIAL_POSTS.forEach((p) => {
      counts[p.platform] = (counts[p.platform] ?? 0) + 1;
    });
    return counts;
  }, []);

  // ── Total engagement across filtered posts (shown in section header) ─────────
  const totalEngagement = useMemo(() => {
    return filteredPosts.reduce(
      (sum, p) => sum + p.engagement.likes + p.engagement.comments + p.engagement.shares,
      0
    );
  }, [filteredPosts]);

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Intro header ─────────────────────────────────────────────────── */}
        <View style={styles.introRow}>
          <View style={styles.introLeft}>
            <Text style={styles.introTitle}>Community</Text>
            <Text style={styles.introSub}>
              Stay connected with your chapter & FBLA national
            </Text>
          </View>
          <View style={styles.introAccent}>
            <Ionicons name="people" size={26} color={COLORS.gold} />
          </View>
        </View>

        {/* Gold divider */}
        <View style={styles.goldBar} />

        {/* ── "Follow Us" Accounts Strip ─────────────────────────────────── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="share-social-outline" size={15} color={COLORS.gold} />
            <Text style={styles.sectionHeading}>Follow the Chapter</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.accountsScroll}
          >
            {MOCK_SOCIAL_ACCOUNTS.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </ScrollView>
        </View>

        {/* ── Platform Filter Tabs ─────────────────────────────────────────── */}
        <PlatformTabs
          active={activePlatform}
          onChange={setActivePlatform}
          counts={postCounts}
        />

        {/* ── Feed header ──────────────────────────────────────────────────── */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedHeading}>
            {activePlatform === "all"
              ? "All Posts"
              : SOCIAL_PLATFORM_META[activePlatform].label}
          </Text>
          <Text style={styles.feedSub}>
            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} ·{" "}
            {compactNumber(totalEngagement)} engagements
          </Text>
        </View>

        {/* ── Post Feed ────────────────────────────────────────────────────── */}
        <View style={styles.feedWrapper}>
          {filteredPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyStateText}>No posts yet</Text>
              <Text style={styles.emptyStateSub}>
                No posts from this platform. Check back soon!
              </Text>
            </View>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isExpanded={expandedPosts.has(post.id)}
                onToggleExpand={() => toggleExpand(post.id)}
              />
            ))
          )}
        </View>

        {/* ── Footer disclaimer ────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.footerText}>
            Posts are aggregated from chapter social media accounts.
            Content reflects individual account posts and is not moderated by this app.
          </Text>
        </View>

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
  safeArea:      { flex: 1, backgroundColor: COLORS.background },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },

  // ── Intro header ──────────────────────────────────────────────────────────
  introRow: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.lg,
    paddingBottom:     SPACING.sm,
  },
  introLeft: { flex: 1, marginRight: SPACING.md },
  introTitle: {
    fontSize:   FONT_SIZE["2xl"],
    fontFamily: FONTS.bold,
    color:      COLORS.textPrimary,
    fontWeight: "700",
  },
  introSub: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color:      COLORS.textSecondary,
    marginTop:  2,
    fontWeight: "400",
  },
  introAccent: {
    width:           48,
    height:          48,
    borderRadius:    RADIUS.lg,
    backgroundColor: COLORS.gold + "18",
    alignItems:      "center",
    justifyContent:  "center",
  },

  // Gold divider
  goldBar: {
    height:           2,
    backgroundColor:  COLORS.gold,
    marginHorizontal: SPACING.lg,
    marginTop:        SPACING.sm,
    marginBottom:     SPACING.lg,
    borderRadius:     RADIUS.full,
    opacity:          0.5,
  },

  // ── Shared section utilities ───────────────────────────────────────────────
  sectionBlock: { marginBottom: SPACING.md },
  sectionHeaderRow: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               SPACING.xs,
    paddingHorizontal: SPACING.lg,
    marginBottom:      SPACING.md,
  },
  sectionHeading: {
    fontSize:   FONT_SIZE.lg,
    fontFamily: FONTS.bold,
    color:      COLORS.textPrimary,
    fontWeight: "700",
  },

  // ── Account Cards (horizontal strip) ──────────────────────────────────────
  accountsScroll: {
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.md,
  },
  accountCard: {
    width:           130,
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.cardBorder,
    padding:         SPACING.md,
    alignItems:      "center",
    gap:             SPACING.xs,
    ...SHADOWS.card,
  },
  accountIconCircle: {
    width:          44,
    height:         44,
    borderRadius:   RADIUS.full,
    alignItems:     "center",
    justifyContent: "center",
    marginBottom:   SPACING.xs,
  },
  accountHandle: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    color:      COLORS.textPrimary,
    fontWeight: "600",
    textAlign:  "center",
  },
  accountFollowers: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color:      COLORS.textMuted,
    fontWeight: "400",
  },
  followBtn: {
    marginTop:        SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical:  SPACING.xs,
    borderRadius:     RADIUS.full,
    borderWidth:      1.5,
  },
  followBtnText: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.bold,
    fontWeight: "700",
  },

  // ── Platform Filter Tabs ───────────────────────────────────────────────────
  tabsRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
    gap:               SPACING.sm,
  },
  tab: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical:  SPACING.xs + 2,
    borderRadius:     RADIUS.full,
    backgroundColor:  COLORS.cardBackground,
    borderWidth:      1,
    borderColor:      COLORS.cardBorder,
  },
  tabLabel: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.medium,
    color:      COLORS.textSecondary,
    fontWeight: "500",
  },
  tabBadge: {
    minWidth:         18,
    height:           18,
    borderRadius:     RADIUS.full,
    alignItems:       "center",
    justifyContent:   "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.bold,
    fontWeight: "700",
  },

  // ── Feed header ────────────────────────────────────────────────────────────
  feedHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom:      SPACING.md,
  },
  feedHeading: {
    fontSize:   FONT_SIZE.lg,
    fontFamily: FONTS.bold,
    color:      COLORS.textPrimary,
    fontWeight: "700",
  },
  feedSub: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color:      COLORS.textMuted,
    marginTop:  2,
    fontWeight: "400",
  },

  // ── Feed wrapper ───────────────────────────────────────────────────────────
  feedWrapper: {
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.md,
  },

  // ── Post Card ─────────────────────────────────────────────────────────────
  postCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.cardBorder,
    overflow:        "hidden",
    flexDirection:   "row",
    ...SHADOWS.card,
  },
  postCardPinned: {
    // Slightly brighter border on pinned posts to draw the eye
    borderColor: COLORS.gold + "44",
  },
  platformBar: {
    // Left-edge colored stripe — platform brand color
    width: 4,
  },
  postBody: {
    flex:    1,
    padding: SPACING.md,
    gap:     SPACING.sm,
  },

  // ── Pinned row ─────────────────────────────────────────────────────────────
  pinnedRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           4,
    paddingTop:    SPACING.sm,
    paddingLeft:   SPACING.md + 4,   // offset for the platform bar width
    paddingBottom: 0,
  },
  pinnedLabel: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.medium,
    color:      COLORS.gold,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Author row ─────────────────────────────────────────────────────────────
  authorRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           SPACING.sm,
  },
  avatarCircle: {
    width:          38,
    height:         38,
    borderRadius:   RADIUS.full,
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },
  avatarInitials: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.bold,
    fontWeight: "700",
  },
  authorInfo: {
    flex: 1,
    gap:  2,
  },
  authorName: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    color:      COLORS.textPrimary,
    fontWeight: "600",
  },
  authorSubRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           4,
  },
  authorHandle: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color:      COLORS.textMuted,
    fontWeight: "400",
  },
  authorDot: {
    width:           3,
    height:          3,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.textMuted,
  },
  postTime: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color:      COLORS.textMuted,
    fontWeight: "400",
  },
  platformBadge: {
    width:          32,
    height:         32,
    borderRadius:   RADIUS.md,
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },

  // ── Post content ───────────────────────────────────────────────────────────
  postContent: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color:      COLORS.textPrimary,
    fontWeight: "400",
    lineHeight: 20,
  },
  showMoreText: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    color:      COLORS.gold,
    fontWeight: "600",
    marginTop:  -2,
  },

  // ── Image placeholder ──────────────────────────────────────────────────────
  imagePlaceholder: {
    height:         180,
    borderRadius:   RADIUS.md,
    alignItems:     "center",
    justifyContent: "center",
    gap:            SPACING.sm,
    overflow:       "hidden",
    borderWidth:    1,
    borderColor:    COLORS.cardBorder,
  },
  imagePlaceholderLabel: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.medium,
    color:      COLORS.textMuted,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // ── Engagement bar ─────────────────────────────────────────────────────────
  engagementBar: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    paddingTop:     SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    marginTop:      SPACING.xs,
  },
  engagementLeft: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           SPACING.md,
  },
  engagementBtn: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           4,
  },
  engagementCount: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.medium,
    color:      COLORS.textSecondary,
    fontWeight: "500",
  },
  viewOnBtn: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              4,
    paddingHorizontal: SPACING.sm,
    paddingVertical:  SPACING.xs,
    borderRadius:     RADIUS.full,
    borderWidth:      1,
  },
  viewOnText: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.semibold,
    fontWeight: "600",
  },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyState: {
    alignItems:      "center",
    paddingVertical: SPACING["3xl"],
    gap:             SPACING.sm,
  },
  emptyStateText: {
    fontSize:   FONT_SIZE.lg,
    fontFamily: FONTS.semibold,
    color:      COLORS.textSecondary,
    fontWeight: "600",
  },
  emptyStateSub: {
    fontSize:         FONT_SIZE.sm,
    fontFamily:       FONTS.regular,
    color:            COLORS.textMuted,
    textAlign:        "center",
    fontWeight:       "400",
    paddingHorizontal: SPACING["2xl"],
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    flexDirection:    "row",
    alignItems:       "flex-start",
    gap:              SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingTop:       SPACING.xl,
    paddingBottom:    SPACING.sm,
  },
  footerText: {
    flex:       1,
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color:      COLORS.textMuted,
    fontWeight: "400",
    lineHeight: 16,
  },
});