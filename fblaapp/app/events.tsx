/**
 * app/events.tsx — Events & Calendar Screen
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A fully custom monthly calendar + event list, purpose-built for FBLA members.
 * No third-party calendar library needed — the grid is hand-rolled so the dev
 * can style and modify every cell freely.
 *
 * LAYOUT (top → bottom):
 *   1. Month Navigator    — prev/next month arrows + "Month YYYY" title
 *   2. Calendar Grid      — 7-column day grid, dot indicators for events
 *   3. Filter Pills       — filter the list by event type
 *   4. Event List         — scrollable cards for the selected day / filtered month
 *   5. Event Detail Sheet — slides up from bottom when a card is tapped
 *
 * KEY CONCEPTS:
 *   • "selectedDate"  — the day the user has tapped in the grid (or today)
 *   • "viewingMonth"  — the month currently shown in the calendar
 *   • "activeFilter"  — which EventType pill is active ("all" = no filter)
 *   • When a day is tapped, the list scrolls to show only events on that day.
 *     Tapping the same day again clears the selection (shows the full month).
 *
 * MODIFYING:
 *   • Event data          → constants/mockData.ts  (MOCK_ALL_EVENTS)
 *   • Colors / fonts      → constants/theme.ts
 *   • Event type filters  → change FILTER_OPTIONS below
 *   • Detail sheet fields → EventDetailSheet component at the bottom of this file
 *   • Add "Add to Phone Calendar" → install expo-calendar and call
 *       Calendar.createEventAsync() inside handleAddToCalendar()
 *
 * DEPENDENCIES:
 *   npx expo install react-native-safe-area-context @expo/vector-icons
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
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
  MOCK_ALL_EVENTS,
  EVENT_TYPE_META,
  type CalendarEvent,
  type EventType,
} from "../constants/mockdata";

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Config
// ─────────────────────────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Filter pill options — "all" is the catch-all, rest map to EventType values.
// To add a new filter: add an entry here AND add its type to EventType in mockData.ts.
const FILTER_OPTIONS: Array<{ key: "all" | EventType; label: string }> = [
  { key: "all", label: "All" },
  { key: "competition", label: "Competitions" },
  { key: "conference", label: "Conferences" },
  { key: "meeting", label: "Meetings" },
  { key: "workshop", label: "Workshops" },
  { key: "deadline", label: "Deadlines" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Date Utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Returns "YYYY-MM-DD" for a Date in LOCAL time (avoids UTC offset issues). */
function toISOLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse an ISO "YYYY-MM-DD" into a local Date (no timezone shift). */
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "April 2026" */
function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** "Sunday, April 5" */
function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Days in a given month. */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Day-of-week (0=Sun) the 1st of the month falls on. */
function firstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Month Navigator
// ─────────────────────────────────────────────────────────────────────────────
interface MonthNavProps {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
}

function MonthNav({ date, onPrev, onNext }: MonthNavProps) {
  return (
    <View style={styles.monthNav}>
      <TouchableOpacity
        onPress={onPrev}
        style={styles.navArrow}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="chevron-back" size={22} color={COLORS.gold} />
      </TouchableOpacity>
      <Text style={styles.monthTitle}>{formatMonthYear(date)}</Text>
      <TouchableOpacity
        onPress={onNext}
        style={styles.navArrow}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="chevron-forward" size={22} color={COLORS.gold} />
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Calendar Grid
// ─────────────────────────────────────────────────────────────────────────────
interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  selectedDate: string | null; // "YYYY-MM-DD" | null
  eventDates: Record<string, EventType[]>; // date → event types on that day
  todayStr: string;
  onDayPress: (dateStr: string) => void;
}

function CalendarGrid({
  year,
  month,
  selectedDate,
  eventDates,
  todayStr,
  onDayPress,
}: CalendarGridProps) {
  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfWeek(year, month);

  // Flat array: null = empty cell, number = day of month
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={styles.calendarGrid}>
      {/* Weekday header */}
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      {/* Day cells */}
      <View style={styles.daysGrid}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} style={styles.dayCell} />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayEvents = eventDates[dateStr] ?? [];
          const hasEvents = dayEvents.length > 0;

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isToday && !isSelected && styles.dayCellToday,
              ]}
              onPress={() => onDayPress(dateStr)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  isToday && !isSelected && styles.dayNumberToday,
                ]}
              >
                {day}
              </Text>

              {/* Colored event dots — one per unique type (max 3) */}
              {hasEvents && (
                <View style={styles.dotRow}>
                  {dayEvents.slice(0, 3).map((type, dotIdx) => (
                    <View
                      key={dotIdx}
                      style={[
                        styles.eventDot,
                        { backgroundColor: EVENT_TYPE_META[type].color },
                        isSelected && { backgroundColor: COLORS.navyDark },
                      ]}
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Filter Pills (horizontal scroll)
// ─────────────────────────────────────────────────────────────────────────────
interface FilterPillsProps {
  active: "all" | EventType;
  onChange: (key: "all" | EventType) => void;
}

function FilterPills({ active, onChange }: FilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {FILTER_OPTIONS.map(({ key, label }) => {
        const isActive = key === active;
        const color =
          key === "all" ? COLORS.gold : EVENT_TYPE_META[key as EventType].color;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterPill,
              isActive && { backgroundColor: color, borderColor: color },
            ]}
            onPress={() => onChange(key)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterPillText,
                isActive && styles.filterPillTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Event List Card
// ─────────────────────────────────────────────────────────────────────────────
interface EventListCardProps {
  event: CalendarEvent;
  onPress: () => void;
}

function EventListCard({ event, onPress }: EventListCardProps) {
  const meta = EVENT_TYPE_META[event.type];
  const date = parseLocalDate(event.date);

  return (
    <TouchableOpacity
      style={styles.eventListCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Left color bar */}
      <View style={[styles.eventColorBar, { backgroundColor: meta.color }]} />

      {/* Date column */}
      <View style={styles.eventListDate}>
        <Text style={styles.eventListDateMonth}>
          {date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
        </Text>
        <Text style={styles.eventListDateDay}>{date.getDate()}</Text>
      </View>

      {/* Content */}
      <View style={styles.eventListContent}>
        <View style={styles.eventListBadgeRow}>
          <View
            style={[styles.typeBadge, { backgroundColor: meta.color + "22" }]}
          >
            <Ionicons name={meta.icon as any} size={10} color={meta.color} />
            <Text style={[styles.typeBadgeText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
          {event.isRegistered && (
            <View style={styles.registeredBadge}>
              <Ionicons
                name="checkmark-circle"
                size={10}
                color={COLORS.success}
              />
              <Text style={styles.registeredText}>Registered</Text>
            </View>
          )}
        </View>

        <Text style={styles.eventListTitle} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.eventListMeta}>
          <Ionicons
            name="time-outline"
            size={12}
            color={COLORS.textSecondary}
          />
          <Text style={styles.eventListMetaText}>
            {event.allDay ? "All Day" : event.time}
          </Text>
          <View style={styles.metaDot} />
          <Ionicons
            name="location-outline"
            size={12}
            color={COLORS.textSecondary}
          />
          <Text style={styles.eventListMetaText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
      </View>

      {/* Right: reminder + chevron */}
      <View style={styles.eventListRight}>
        <Ionicons
          name={event.isReminder ? "notifications" : "notifications-outline"}
          size={18}
          color={event.isReminder ? COLORS.gold : COLORS.textMuted}
        />
        <Ionicons
          name="chevron-forward"
          size={14}
          color={COLORS.textMuted}
          style={{ marginTop: 4 }}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Detail Sheet — row helper
// ─────────────────────────────────────────────────────────────────────────────
function SheetDetailRow({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sheetDetailRow}>
      <View style={styles.sheetDetailIconWrap}>
        <Ionicons name={icon as any} size={16} color={COLORS.gold} />
      </View>
      <View style={styles.sheetDetailText}>
        <Text style={styles.sheetDetailLabel}>{label}</Text>
        <Text style={styles.sheetDetailValue}>{children}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Event Detail Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────
interface EventDetailSheetProps {
  event: CalendarEvent | null;
  visible: boolean;
  onClose: () => void;
}

function EventDetailSheet({ event, visible, onClose }: EventDetailSheetProps) {
  if (!event) return null;

  const meta = EVENT_TYPE_META[event.type];
  const date = parseLocalDate(event.date);

  function handleRegister() {
    if (event?.registrationUrl) Linking.openURL(event.registrationUrl);
  }

  function handleAddToCalendar() {
    // TODO: Install expo-calendar, then:
    //   const { status } = await Calendar.requestCalendarPermissionsAsync();
    //   if (status === "granted") { await Calendar.createEventAsync(...); }
    console.log("Add to calendar:", event?.id);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.sheetBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Panel */}
      <View style={styles.sheetPanel}>
        <View style={styles.sheetHandle} />

        <TouchableOpacity style={styles.sheetClose} onPress={onClose}>
          <Ionicons name="close" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Type badge */}
          <View
            style={[
              styles.sheetTypeBadge,
              { backgroundColor: meta.color + "22" },
            ]}
          >
            <Ionicons name={meta.icon as any} size={13} color={meta.color} />
            <Text style={[styles.sheetTypeBadgeText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.sheetTitle}>{event.title}</Text>

          {/* Gold accent bar */}
          <View style={styles.sheetDivider} />

          {/* Detail rows */}
          <View style={styles.sheetDetailList}>
            <SheetDetailRow icon="calendar-outline" label="Date">
              {formatFullDate(date)}
            </SheetDetailRow>
            <SheetDetailRow icon="time-outline" label="Time">
              {event.allDay ? "All Day" : event.time}
            </SheetDetailRow>
            <SheetDetailRow icon="location-outline" label="Location">
              {event.location}
            </SheetDetailRow>
            <SheetDetailRow icon="person-outline" label="Organizer">
              {event.organizer}
            </SheetDetailRow>
          </View>

          {/* Description */}
          <Text style={styles.sheetDescHeading}>About This Event</Text>
          <Text style={styles.sheetDescription}>{event.description}</Text>

          {/* Status chips */}
          <View style={styles.sheetStatusRow}>
            {event.isRegistered && (
              <View style={styles.registeredChip}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={COLORS.success}
                />
                <Text style={styles.registeredChipText}>You're registered</Text>
              </View>
            )}
            {event.isReminder && (
              <View style={styles.reminderChip}>
                <Ionicons name="notifications" size={14} color={COLORS.gold} />
                <Text style={styles.reminderChipText}>Reminder set</Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.sheetActions}>
            {!event.isRegistered && event.registrationUrl && (
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleRegister}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={COLORS.navyDark}
                />
                <Text style={styles.btnPrimaryText}>Register Now</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleAddToCalendar}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={16} color={COLORS.gold} />
              <Text style={styles.btnSecondaryText}>Add to Calendar</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: SPACING["2xl"] }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function EventsScreen() {
  const today = new Date();
  const todayStr = toISOLocal(today);

  // The month shown in the calendar
  const [viewingMonth, setViewingMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  // Tapped day; null = show all events in the month
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  // Active filter pill
  const [activeFilter, setActiveFilter] = useState<"all" | EventType>("all");
  // Detail sheet
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Month navigation
  function goToPrevMonth() {
    setViewingMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
    setSelectedDate(null);
  }
  function goToNextMonth() {
    setViewingMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
    setSelectedDate(null);
  }

  // Tapping a day toggles selection
  function handleDayPress(dateStr: string) {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  }

  // Build date → event types map for dot indicators
  const eventDateMap = useMemo<Record<string, EventType[]>>(() => {
    const map: Record<string, EventType[]> = {};
    MOCK_ALL_EVENTS.forEach((evt) => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt.type);
    });
    return map;
  }, []);

  // Filter events for the list below the calendar
  const filteredEvents = useMemo<CalendarEvent[]>(() => {
    const y = viewingMonth.getFullYear();
    const m = viewingMonth.getMonth();
    return MOCK_ALL_EVENTS.filter((evt) => {
      const d = parseLocalDate(evt.date);
      if (d.getFullYear() !== y || d.getMonth() !== m) return false;
      if (selectedDate && evt.date !== selectedDate) return false;
      if (activeFilter !== "all" && evt.type !== activeFilter) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [viewingMonth, selectedDate, activeFilter]);

  // Section heading for the event list
  const listHeading = selectedDate
    ? formatFullDate(parseLocalDate(selectedDate))
    : `All Events — ${viewingMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.introRow}>
          <View>
            <Text style={styles.introTitle}>Event & Calendar</Text>
            <Text style={styles.introSub}></Text>
          </View>
          {/* Gold decorative accent */}
          <View style={styles.introAccent}>
            <Ionicons name="calendar-outline" size={28} color={COLORS.gold} />
          </View>
        </View>

        <View style={styles.goldBar} />

        {/* Month Navigator */}
        <MonthNav
          date={viewingMonth}
          onPrev={goToPrevMonth}
          onNext={goToNextMonth}
        />

        {/* Calendar Grid */}
        <CalendarGrid
          year={viewingMonth.getFullYear()}
          month={viewingMonth.getMonth()}
          selectedDate={selectedDate}
          eventDates={eventDateMap}
          todayStr={todayStr}
          onDayPress={handleDayPress}
        />

        {/* Separator */}
        <View style={styles.goldBar} />

        {/* Filter Pills */}
        <FilterPills active={activeFilter} onChange={setActiveFilter} />

        {/* Event List */}
        <View style={styles.listSection}>
          <View style={styles.listHeadingRow}>
            <Text style={styles.listHeading} numberOfLines={1}>
              {listHeading}
            </Text>
            {selectedDate && (
              <TouchableOpacity
                onPress={() => setSelectedDate(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.eventCount}>
            {filteredEvents.length} event
            {filteredEvents.length !== 1 ? "s" : ""}
          </Text>

          {filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={40}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyStateText}>No events found</Text>
              <Text style={styles.emptyStateSub}>
                {selectedDate
                  ? "Nothing scheduled on this day."
                  : "No events match the selected filter."}
              </Text>
            </View>
          ) : (
            filteredEvents.map((evt) => (
              <EventListCard
                key={evt.id}
                event={evt}
                onPress={() => {
                  setDetailEvent(evt);
                  setSheetVisible(true);
                }}
              />
            ))
          )}
        </View>

        <View style={{ height: SPACING["2xl"] }} />
      </ScrollView>

      {/* Detail Bottom Sheet */}
      <EventDetailSheet
        event={detailEvent}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },

  // ── Intro header ──────────────────────────────────────────────────────────
  introRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  introTitle: {
    fontSize: FONT_SIZE["2xl"],
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  introSub: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: "400",
  },
  introAccent: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.gold + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  // Month Nav
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: FONT_SIZE.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Calendar Grid
  calendarGrid: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    alignSelf: "center",
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  weekdayRow: { flexDirection: "row", marginBottom: SPACING.sm },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: "14.285714%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    paddingVertical: 2,
  },
  dayCellSelected: { backgroundColor: COLORS.gold },
  dayCellToday: { borderWidth: 1.5, borderColor: COLORS.gold },
  dayNumber: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  dayNumberSelected: { color: COLORS.navyDark, fontWeight: "700" },
  dayNumberToday: { color: COLORS.gold, fontWeight: "700" },
  dotRow: { flexDirection: "row", gap: 2, marginTop: 2 },
  eventDot: { width: 4, height: 4, borderRadius: RADIUS.full },

  // Separator
  goldBar: {
    height: 2,
    backgroundColor: COLORS.gold,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.full,
    opacity: 0.5,
  },

  // Filters
  filterRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterPillText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  filterPillTextActive: { color: COLORS.navyDark, fontWeight: "700" },

  // Event List
  listSection: { paddingHorizontal: SPACING.lg },
  listHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  listHeading: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    fontWeight: "700",
    flex: 1,
    marginRight: SPACING.sm,
  },
  clearText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gold,
    fontWeight: "600",
  },
  eventCount: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    fontWeight: "400",
  },

  // Event List Card
  eventListCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  eventColorBar: { width: 4 },
  eventListDate: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: COLORS.cardBorder,
  },
  eventListDateMonth: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bold,
    color: COLORS.gold,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  eventListDateDay: {
    fontSize: FONT_SIZE["2xl"],
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    fontWeight: "700",
    lineHeight: 28,
  },
  eventListContent: { flex: 1, padding: SPACING.md },
  eventListBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semibold,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  registeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.success + "20",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  registeredText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semibold,
    color: COLORS.success,
    fontWeight: "600",
  },
  eventListTitle: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.semibold,
    color: COLORS.textPrimary,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 4,
  },
  eventListMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "nowrap",
  },
  eventListMetaText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontWeight: "400",
    flexShrink: 1,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 2,
  },
  eventListRight: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING["3xl"],
    gap: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.semibold,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  emptyStateSub: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: "center",
    fontWeight: "400",
  },

  // Bottom Sheet
  sheetBackdrop: { flex: 1, backgroundColor: COLORS.overlay },
  sheetPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    maxHeight: "85%",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    ...SHADOWS.elevated,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.cardBorder,
    borderRadius: RADIUS.full,
    alignSelf: "center",
    marginBottom: SPACING.md,
  },
  sheetClose: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.lg,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  sheetTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  sheetTypeBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  sheetTitle: {
    fontSize: FONT_SIZE["2xl"],
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    fontWeight: "700",
    lineHeight: 30,
    marginBottom: SPACING.md,
    paddingRight: SPACING["2xl"],
  },
  sheetDivider: {
    height: 2,
    backgroundColor: COLORS.gold,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.full,
    opacity: 0.5,
    width: 48,
  },
  sheetDetailList: { gap: SPACING.md, marginBottom: SPACING.lg },
  sheetDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  sheetDetailIconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gold + "18",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sheetDetailText: { flex: 1, justifyContent: "center" },
  sheetDetailLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    fontWeight: "500",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  sheetDetailValue: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    fontWeight: "400",
    lineHeight: 20,
  },
  sheetDescHeading: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.semibold,
    color: COLORS.textPrimary,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  sheetDescription: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: "400",
    marginBottom: SPACING.lg,
  },
  sheetStatusRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    flexWrap: "wrap",
  },
  registeredChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.success + "18",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  registeredChipText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.success,
    fontWeight: "600",
  },
  reminderChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.gold + "18",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  reminderChipText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gold,
    fontWeight: "600",
  },
  sheetActions: { gap: SPACING.sm },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md + 2,
    ...SHADOWS.goldGlow,
  },
  btnPrimaryText: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bold,
    color: COLORS.navyDark,
    fontWeight: "700",
  },
  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md + 2,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  btnSecondaryText: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bold,
    color: COLORS.gold,
    fontWeight: "700",
  },
});
