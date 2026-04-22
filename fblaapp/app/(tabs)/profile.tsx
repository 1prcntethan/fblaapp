/**
 * app/profile.tsx — Member Profile Screen
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * The member's personal hub — identity, competitive history, achievements,
 * chapter info, and app settings all in one place.
 *
 * LAYOUT (top → bottom):
 *   1. Profile Hero          — avatar, name, role badge, member ID chip,
 *                              chapter/state/years-active subtext, share button
 *   2. Stats Bar             — quick 3-up stat row (events, placements, years)
 *   3. Competitive Events    — tabbed: "This Year" / "All Time" event history cards
 *   4. Achievements          — earned badge grid + locked (aspirational) badges
 *   5. Chapter Info          — adviser, location, chapter stats, website link
 *   6. Settings              — grouped rows with toggles, links, and actions
 *
 * MODIFYING:
 *   • Profile fields         → constants/mockData.ts (MOCK_MEMBER, MOCK_CHAPTER_INFO)
 *   • Competitive events     → constants/mockData.ts (MOCK_COMPETITIVE_EVENTS)
 *   • Achievement badges     → constants/mockData.ts (MOCK_BADGES)
 *   • Settings rows/sections → constants/mockData.ts (MOCK_SETTINGS_SECTIONS)
 *   • Sign-out logic         → handleSettingsAction() switch block below
 *   • Edit profile flow      → handleSettingsAction() "set_edit_profile" case
 *   • Digital member card    → handleSettingsAction() "set_member_card" case
 *
 * DEPENDENCIES:
 *   npx expo install react-native-safe-area-context @expo/vector-icons
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  StatusBar,
  Linking,
  Share,
  Alert,
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
} from "../../constants/theme";
import {
  MOCK_MEMBER,
  MOCK_CHAPTER_INFO,
  MOCK_COMPETITIVE_EVENTS,
  MOCK_BADGES,
  MOCK_SETTINGS_SECTIONS,
  COMPETITION_LEVEL_META,
  type CompetitiveEventRecord,
  type AchievementBadge,
  type SettingsRow,
  type SettingsSection,
} from "../../constants/mockdata";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// Utility: ordinal suffix  1 → "1st",  2 → "2nd",  3 → "3rd",  4 → "4th"
// ─────────────────────────────────────────────────────────────────────────────
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: how many years has the member been active (memberSince → now)
// ─────────────────────────────────────────────────────────────────────────────
function yearsActive(memberSince: string): number {
  return new Date().getFullYear() - parseInt(memberSince, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Section Header (consistent label across all sections)
// ─────────────────────────────────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title.toUpperCase()}</Text>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Profile Hero
// The visual identity card at the top of the screen.
// ─────────────────────────────────────────────────────────────────────────────
interface ProfileHeroProps {
  onShare: () => void;
}

function ProfileHero({ onShare }: ProfileHeroProps) {
  const years = yearsActive(MOCK_MEMBER.memberSince);

  return (
    <View style={styles.hero}>
      {/* Share button — top right */}
      <TouchableOpacity
        style={styles.heroShareBtn}
        onPress={onShare}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="share-outline" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {/* Avatar circle */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {MOCK_MEMBER.avatarInitials}
          </Text>
        </View>
        {/* Small role icon badge overlaid on the bottom-right of the avatar */}
        <View style={styles.avatarRoleBadge}>
          <Ionicons name="star" size={12} color={COLORS.navyDark} />
        </View>
      </View>

      {/* Name */}
      <Text style={styles.heroName}>
        {MOCK_MEMBER.firstName} {MOCK_MEMBER.lastName}
      </Text>

      {/* Role badge pill */}
      <View style={styles.roleBadge}>
        <Ionicons name="ribbon-outline" size={12} color={COLORS.gold} />
        <Text style={styles.roleBadgeText}>{MOCK_MEMBER.role}</Text>
      </View>

      {/* Member ID chip */}
      <View style={styles.memberIdChip}>
        <Ionicons name="card-outline" size={12} color={COLORS.textMuted} />
        <Text style={styles.memberIdText}>
          Member ID: {MOCK_MEMBER.id.toUpperCase()} · Chapter{" "}
          {MOCK_MEMBER.chapterId}
        </Text>
      </View>

      {/* Chapter / state / grade / years active */}
      <View style={styles.heroMetaRow}>
        <HeroMetaChip icon="school-outline" label={MOCK_MEMBER.chapter} />
        <HeroMetaChip icon="location-outline" label={MOCK_MEMBER.state} />
      </View>
      <View style={styles.heroMetaRow}>
        <HeroMetaChip icon="person-outline" label={MOCK_MEMBER.grade} />
        <HeroMetaChip
          icon="time-outline"
          label={`${years} yr${years !== 1 ? "s" : ""} active`}
        />
      </View>
    </View>
  );
}

/** Small icon + text chip used inside the hero section */
function HeroMetaChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.heroMetaChip}>
      <Ionicons name={icon as any} size={12} color={COLORS.textSecondary} />
      <Text style={styles.heroMetaChipText}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Stats Bar (3-up quick stats row)
// ─────────────────────────────────────────────────────────────────────────────
function StatsBar() {
  const totalEvents = MOCK_COMPETITIVE_EVENTS.length;
  const totalPlacements = MOCK_COMPETITIVE_EVENTS.filter(
    (e) => e.placement !== undefined,
  ).length;
  const years = yearsActive(MOCK_MEMBER.memberSince);

  const stats = [
    { label: "Events", value: String(totalEvents) },
    { label: "Placements", value: String(totalPlacements) },
    { label: "Years", value: String(years) },
  ];

  return (
    <View style={styles.statsBar}>
      {stats.map((s, idx) => (
        <React.Fragment key={s.label}>
          {idx > 0 && <View style={styles.statsDivider} />}
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Competitive Event Card
// ─────────────────────────────────────────────────────────────────────────────
function CompetitiveEventCard({ record }: { record: CompetitiveEventRecord }) {
  const levelMeta = COMPETITION_LEVEL_META[record.level];
  const placed = record.placement !== undefined;

  return (
    <View style={styles.eventCard}>
      {/* Left: placement indicator */}
      <View
        style={[
          styles.placementBlock,
          placed
            ? { backgroundColor: levelMeta.color + "22" }
            : { backgroundColor: COLORS.cardBorder },
        ]}
      >
        {placed ? (
          <>
            <Text style={[styles.placementNumber, { color: levelMeta.color }]}>
              {ordinal(record.placement!)}
            </Text>
            <Text style={[styles.placementPlace, { color: levelMeta.color }]}>
              Place
            </Text>
          </>
        ) : (
          <Ionicons name="remove" size={16} color={COLORS.textMuted} />
        )}
      </View>

      {/* Right: event details */}
      <View style={styles.eventCardInfo}>
        <Text style={styles.eventCardName} numberOfLines={1}>
          {record.eventName}
        </Text>

        {/* Level badge + year */}
        <View style={styles.eventCardMeta}>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: levelMeta.color + "22" },
            ]}
          >
            <Text style={[styles.levelBadgeText, { color: levelMeta.color }]}>
              {levelMeta.label}
            </Text>
          </View>
          <Text style={styles.eventCardYear}>{record.year}</Text>
        </View>

        {/* Partners (if team event) */}
        {record.partners && record.partners.length > 0 && (
          <View style={styles.partnersRow}>
            <Ionicons
              name="people-outline"
              size={11}
              color={COLORS.textMuted}
            />
            <Text style={styles.partnersText}>
              with {record.partners.join(", ")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Competitive Events Section (with This Year / All Time tabs)
// ─────────────────────────────────────────────────────────────────────────────
function CompetitiveEventsSection() {
  // "current" shows only isCurrentYear=true; "all" shows everything
  const [activeTab, setActiveTab] = useState<"current" | "all">("current");

  const displayed =
    activeTab === "current"
      ? MOCK_COMPETITIVE_EVENTS.filter((e) => e.isCurrentYear)
      : MOCK_COMPETITIVE_EVENTS;

  return (
    <View style={styles.section}>
      <SectionLabel title="Competitive Events" />

      {/* Mini tab row */}
      <View style={styles.miniTabRow}>
        {(["current", "all"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.miniTab, activeTab === tab && styles.miniTabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.miniTabText,
                activeTab === tab && styles.miniTabTextActive,
              ]}
            >
              {tab === "current" ? "This Year" : "All Time"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Event cards */}
      <View style={styles.card}>
        {displayed.length === 0 ? (
          <View style={styles.emptyInCard}>
            <Text style={styles.emptyInCardText}>No events recorded yet.</Text>
          </View>
        ) : (
          displayed.map((record, idx) => (
            <React.Fragment key={record.id}>
              <CompetitiveEventCard record={record} />
              {idx < displayed.length - 1 && (
                <View style={styles.cardDivider} />
              )}
            </React.Fragment>
          ))
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Single Achievement Badge
// ─────────────────────────────────────────────────────────────────────────────
function BadgeItem({ badge }: { badge: AchievementBadge }) {
  return (
    <View style={[styles.badgeItem, badge.isLocked && styles.badgeItemLocked]}>
      {/* Icon circle */}
      <View
        style={[
          styles.badgeIconCircle,
          {
            backgroundColor: badge.isLocked
              ? COLORS.cardBorder
              : badge.color + "22",
          },
        ]}
      >
        <Ionicons
          name={badge.icon as any}
          size={22}
          color={badge.isLocked ? COLORS.textMuted : badge.color}
        />
        {/* Lock overlay for unearned badges */}
        {badge.isLocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={10} color={COLORS.textMuted} />
          </View>
        )}
      </View>

      {/* Badge label */}
      <Text
        style={[styles.badgeTitle, badge.isLocked && styles.badgeTitleLocked]}
        numberOfLines={2}
      >
        {badge.title}
      </Text>

      {/* Earned year */}
      {badge.earnedAt && !badge.isLocked && (
        <Text style={styles.badgeEarned}>{badge.earnedAt}</Text>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Achievements Section
// ─────────────────────────────────────────────────────────────────────────────
function AchievementsSection() {
  const earned = MOCK_BADGES.filter((b) => !b.isLocked);
  const locked = MOCK_BADGES.filter((b) => b.isLocked);

  return (
    <View style={styles.section}>
      <View style={styles.sectionLabelRow}>
        <SectionLabel title="Achievements" />
        <Text style={styles.sectionLabelCount}>
          {earned.length}/{MOCK_BADGES.length} earned
        </Text>
      </View>

      {/* Badge wrap grid */}
      <View style={styles.badgeGrid}>
        {/* Earned badges first */}
        {earned.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
        {/* Locked (aspirational) badges */}
        {locked.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Chapter Info Section
// ─────────────────────────────────────────────────────────────────────────────
function ChapterInfoSection() {
  function handleWebsite() {
    Linking.openURL(MOCK_CHAPTER_INFO.websiteUrl).catch(() =>
      console.warn("[Profile] Cannot open chapter website"),
    );
  }

  function handleEmail() {
    Linking.openURL(`mailto:${MOCK_CHAPTER_INFO.adviserEmail}`).catch(() =>
      console.warn("[Profile] Cannot open email client"),
    );
  }

  return (
    <View style={styles.section}>
      <SectionLabel title="Chapter Information" />
      <View style={styles.card}>
        {/* Chapter name header */}
        <View style={styles.chapterNameRow}>
          <View style={styles.chapterIconWrap}>
            <Ionicons name="business" size={18} color={COLORS.gold} />
          </View>
          <View>
            <Text style={styles.chapterName}>{MOCK_CHAPTER_INFO.name}</Text>
            <Text style={styles.chapterId}>Chapter {MOCK_CHAPTER_INFO.id}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* Detail rows */}
        <ChapterInfoRow
          icon="person-outline"
          label="Adviser"
          value={MOCK_CHAPTER_INFO.adviser}
        />
        <ChapterInfoRow
          icon="location-outline"
          label="Location"
          value={`${MOCK_CHAPTER_INFO.city}, ${MOCK_CHAPTER_INFO.state}`}
        />
        <ChapterInfoRow
          icon="flag-outline"
          label="Region"
          value={MOCK_CHAPTER_INFO.region}
        />
        <ChapterInfoRow
          icon="people-outline"
          label="Members"
          value={`${MOCK_CHAPTER_INFO.totalMembers} active members`}
        />
        <ChapterInfoRow
          icon="calendar-outline"
          label="Founded"
          value={MOCK_CHAPTER_INFO.foundedYear}
        />

        <View style={styles.cardDivider} />

        {/* Action buttons */}
        <View style={styles.chapterActions}>
          <TouchableOpacity
            style={styles.chapterActionBtn}
            onPress={handleEmail}
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={15} color={COLORS.gold} />
            <Text style={styles.chapterActionText}>Email Adviser</Text>
          </TouchableOpacity>

          <View style={styles.chapterActionDivider} />

          <TouchableOpacity
            style={styles.chapterActionBtn}
            onPress={handleWebsite}
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={15} color={COLORS.gold} />
            <Text style={styles.chapterActionText}>Chapter Website</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/** Label + value row inside the chapter info card */
function ChapterInfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.chapterInfoRow}>
      <Ionicons name={icon as any} size={14} color={COLORS.gold} />
      <Text style={styles.chapterInfoLabel}>{label}</Text>
      <Text style={styles.chapterInfoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Settings Section
// ─────────────────────────────────────────────────────────────────────────────
interface SettingsSectionBlockProps {
  section: SettingsSection;
  toggleValues: Record<string, boolean>;
  onToggle: (rowId: string, value: boolean) => void;
  onAction: (row: SettingsRow) => void;
}

function SettingsSectionBlock({
  section,
  toggleValues,
  onToggle,
  onAction,
}: SettingsSectionBlockProps) {
  return (
    <View style={styles.settingsSection}>
      {section.title ? (
        <SectionLabel title={section.title} />
      ) : (
        // Empty title sections still need a little top margin
        <View style={{ height: SPACING.xs }} />
      )}

      <View style={styles.card}>
        {section.rows.map((row, idx) => (
          <React.Fragment key={row.id}>
            <SettingsRowItem
              row={row}
              toggleValue={toggleValues[row.id] ?? row.value ?? false}
              onToggle={(val) => onToggle(row.id, val)}
              onAction={() => onAction(row)}
              isLast={idx === section.rows.length - 1}
            />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

/** Single settings row — handles all four action types */
function SettingsRowItem({
  row,
  toggleValue,
  onToggle,
  onAction,
  isLast,
}: {
  row: SettingsRow;
  toggleValue: boolean;
  onToggle: (val: boolean) => void;
  onAction: () => void;
  isLast: boolean;
}) {
  const isToggle = row.actionType === "toggle";

  return (
    <TouchableOpacity
      style={[styles.settingsRow, isLast && styles.settingsRowLast]}
      onPress={isToggle ? undefined : onAction}
      activeOpacity={isToggle ? 1 : 0.75}
      disabled={isToggle}
    >
      {/* Icon cell */}
      <View
        style={[styles.settingsIcon, { backgroundColor: row.iconColor + "22" }]}
      >
        <Ionicons name={row.icon as any} size={16} color={row.iconColor} />
      </View>

      {/* Label */}
      <Text
        style={[
          styles.settingsLabel,
          row.destructive && styles.settingsLabelDestructive,
        ]}
      >
        {row.label}
      </Text>

      {/* Right-side control */}
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.cardBorder, true: COLORS.gold + "88" }}
          thumbColor={toggleValue ? COLORS.gold : COLORS.gray300}
          ios_backgroundColor={COLORS.cardBorder}
        />
      ) : (
        <Ionicons
          name={
            row.actionType === "link" || row.actionType === "navigate"
              ? "chevron-forward"
              : "chevron-forward"
          }
          size={16}
          color={row.destructive ? COLORS.error : COLORS.textMuted}
        />
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  // ── Toggle state for notification settings ──────────────────────────────────
  // Initialise from the mock data default values.
  const initialToggles = Object.fromEntries(
    MOCK_SETTINGS_SECTIONS.flatMap((sec) =>
      sec.rows
        .filter((r) => r.actionType === "toggle")
        .map((r) => [r.id, r.value ?? false]),
    ),
  );
  const [toggleValues, setToggleValues] =
    useState<Record<string, boolean>>(initialToggles);

  const handleToggle = useCallback((rowId: string, value: boolean) => {
    setToggleValues((prev) => ({ ...prev, [rowId]: value }));
    // TODO: persist preference to AsyncStorage or your backend
    console.log("[Profile] Toggle:", rowId, value);
  }, []);

  const { logout } = useContext(AuthContext);

  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data());
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const updateProfile = async () => {
    const ref = doc(db, "users", user.uid);

    await updateDoc(ref, {
      firstName: "New Name",
    });
  };

  // ── Settings row action dispatcher ─────────────────────────────────────────
  // Add cases here as you build out each settings screen.
  const handleSettingsAction = useCallback((row: SettingsRow) => {
    switch (row.id) {
      case "set_edit_profile":
        // TODO: router.push("/profile/edit")
        Alert.alert("Edit Profile", "Navigate to the Edit Profile screen.");
        break;

      case "set_member_card":
        // TODO: Show digital member card modal
        // The card should display: member name, ID, chapter, QR code
        Alert.alert(
          "Digital Member Card",
          `${MOCK_MEMBER.firstName} ${MOCK_MEMBER.lastName}\n` +
            `ID: ${MOCK_MEMBER.id.toUpperCase()}\n` +
            `Chapter: ${MOCK_MEMBER.chapterId}\n` +
            `${MOCK_MEMBER.chapter}\n` +
            `Member since ${MOCK_MEMBER.memberSince}`,
        );
        break;

      case "set_change_password":
        // TODO: router.push("/profile/change-password")
        Alert.alert(
          "Change Password",
          "Navigate to the Change Password screen.",
        );
        break;

      case "set_signout":
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: () => {
              logout();
            },
          },
        ]);
        break;

      case "set_version":
        // No-op — just a display row
        break;

      default:
        // "link" type rows
        if (row.actionType === "link" && row.url) {
          Linking.openURL(row.url).catch(() =>
            console.warn("[Profile] Cannot open URL:", row.url),
          );
        }
        break;
    }
  }, []);

  // ── Share profile ───────────────────────────────────────────────────────────
  async function handleShareProfile() {
    try {
      await Share.share({
        message:
          `Check out ${MOCK_MEMBER.firstName} ${MOCK_MEMBER.lastName}'s FBLA profile!\n` +
          `${MOCK_MEMBER.role} · ${MOCK_MEMBER.chapter}\n` +
          `Member since ${MOCK_MEMBER.memberSince}`,
        title: "FBLA Member Profile",
      });
    } catch (err) {
      console.warn("[Profile] Share failed:", err);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Profile Hero ──────────────────────────────────────────────── */}
        <ProfileHero onShare={handleShareProfile} />

        {/* Gold divider */}
        <View style={styles.goldBar} />

        {/* ── 2. Stats Bar ─────────────────────────────────────────────────── */}
        <View style={styles.statsBarWrapper}>
          <StatsBar />
        </View>

        {/* ── 3. Competitive Events ────────────────────────────────────────── */}
        <CompetitiveEventsSection />

        {/* ── 4. Achievements ──────────────────────────────────────────────── */}
        {/* <AchievementsSection /> */}

        {/* ── 5. Chapter Info ───────────────────────────────────────────────── */}
        {/* <ChapterInfoSection /> */}

        {/* ── 6. Settings ───────────────────────────────────────────────────── */}
        {/* <View style={styles.section}>
          <SectionLabel title="Settings" />
        </View> */}

        {/* {MOCK_SETTINGS_SECTIONS.map((sec) => (
          <SettingsSectionBlock
            key={sec.id}
            section={sec}
            toggleValues={toggleValues}
            onToggle={handleToggle}
            onAction={handleSettingsAction}
          />
        ))} */}

        {/* App version footer */}
        {/* <View style={styles.versionFooter}>
          <Text style={styles.versionText}>
            FBLA Member App · Version 1.0.0
          </Text>
          <Text style={styles.versionText}>Made with 💙 for FBLA members</Text>
        </View> */}

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
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },

  // ── Shared card ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },

  // ── Section wrappers ──────────────────────────────────────────────────────
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  sectionLabelCount: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gold,
    fontWeight: "600",
  },

  // Gold divider
  goldBar: {
    height: 2,
    backgroundColor: COLORS.gold,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.full,
    opacity: 0.5,
  },

  // ── Profile Hero ──────────────────────────────────────────────────────────
  hero: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  heroShareBtn: {
    position: "absolute",
    top: SPACING.xl,
    right: SPACING.lg,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: {
    position: "relative",
    marginBottom: SPACING.md,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.goldGlow,
  },
  avatarInitials: {
    fontSize: FONT_SIZE["3xl"],
    fontFamily: FONTS.bold,
    color: COLORS.navyDark,
    fontWeight: "700",
  },
  avatarRoleBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  heroName: {
    fontSize: FONT_SIZE["2xl"],
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.gold + "18",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gold + "44",
  },
  roleBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gold,
    fontWeight: "600",
  },
  memberIdChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  memberIdText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
    fontWeight: "400",
    letterSpacing: 0.3,
  },
  heroMetaRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  heroMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  heroMetaChipText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontWeight: "400",
  },

  // ── Stats Bar ─────────────────────────────────────────────────────────────
  statsBarWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: SPACING.md,
    ...SHADOWS.card,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: FONT_SIZE["2xl"],
    fontFamily: FONTS.bold,
    color: COLORS.gold,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontWeight: "400",
    marginTop: 2,
  },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.cardBorder,
  },

  // ── Mini Tab Row (Competitive Events) ─────────────────────────────────────
  miniTabRow: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 3,
    alignSelf: "flex-start",
    marginBottom: SPACING.md,
    gap: 2,
  },
  miniTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  miniTabActive: {
    backgroundColor: COLORS.gold,
  },
  miniTabText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  miniTabTextActive: {
    color: COLORS.navyDark,
    fontWeight: "700",
  },

  // ── Competitive Event Card ─────────────────────────────────────────────────
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    gap: SPACING.md,
  },
  placementBlock: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  placementNumber: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bold,
    fontWeight: "700",
    lineHeight: 18,
  },
  placementPlace: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.medium,
    fontWeight: "600",
    lineHeight: 13,
  },
  eventCardInfo: {
    flex: 1,
    gap: 4,
  },
  eventCardName: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.semibold,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  eventCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  levelBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  levelBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semibold,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  eventCardYear: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontWeight: "400",
  },
  partnersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  partnersText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontWeight: "400",
  },

  // ── Empty in card ─────────────────────────────────────────────────────────
  emptyInCard: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  emptyInCardText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontWeight: "400",
  },

  // ── Badge Grid ────────────────────────────────────────────────────────────
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  badgeItem: {
    // 4 per row: (screenWidth - 2*16px padding - 3*12px gaps) / 4
    // Using percentage to stay flexible across screen sizes
    width: "22%",
    alignItems: "center",
    gap: SPACING.xs,
  },
  badgeItemLocked: {
    opacity: 0.45,
  },
  badgeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  lockOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitle: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 15,
  },
  badgeTitleLocked: {
    color: COLORS.textMuted,
  },
  badgeEarned: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontWeight: "400",
  },

  // ── Chapter Info ──────────────────────────────────────────────────────────
  chapterNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
  },
  chapterIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gold + "18",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chapterName: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.semibold,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  chapterId: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontWeight: "400",
    marginTop: 2,
  },
  chapterInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  chapterInfoLabel: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    fontWeight: "500",
    width: 70,
    flexShrink: 0,
  },
  chapterInfoValue: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    fontWeight: "400",
  },
  chapterActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  chapterActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  chapterActionDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.cardBorder,
  },
  chapterActionText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gold,
    fontWeight: "600",
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  settingsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  settingsRowLast: {
    borderBottomWidth: 0,
  },
  settingsIcon: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  settingsLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    fontWeight: "400",
  },
  settingsLabelDestructive: {
    color: COLORS.error,
  },

  // ── Version footer ────────────────────────────────────────────────────────
  versionFooter: {
    alignItems: "center",
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    gap: SPACING.xs,
  },
  versionText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontWeight: "400",
  },
});
