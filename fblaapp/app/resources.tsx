/**
 * app/resources.tsx — Resources Screen
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A searchable, categorized library of FBLA documents, links, and media.
 * Designed to surface the right resource quickly without overwhelming the user.
 *
 * LAYOUT (top → bottom):
 *   1. Search Bar         — live filters all categories and items simultaneously
 *   2. Featured Strip     — horizontal scroll of pinned/high-priority resources
 *   3. Category Accordion — expandable sections, one per resource category
 *      └─ Resource Rows   — each item: icon, title, description, kind badge, open button
 *
 * KEY BEHAVIORS:
 *   • Search filters both category titles and individual resource titles/descriptions.
 *     When a search is active, all matching categories auto-expand.
 *   • Tapping a category header toggles it open/closed (accordion).
 *   • Tapping a resource opens it via Linking.openURL (external) or an in-app
 *     viewer stub (for PDFs — see handleOpenResource).
 *   • The Featured strip only shows when search is empty.
 *
 * MODIFYING:
 *   • Add/edit resources         → constants/mockData.ts (MOCK_RESOURCE_CATEGORIES)
 *   • Change kind icons/colors   → constants/mockData.ts (RESOURCE_KIND_META)
 *   • Add in-app PDF viewer      → replace the stub in handleOpenResource()
 *   • Add download functionality → install expo-file-system + expo-sharing,
 *                                   then implement inside handleOpenResource()
 *   • Change section colors      → each category's `color` field in mockData.ts
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
  TextInput,
  StyleSheet,
  StatusBar,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
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
  MOCK_RESOURCE_CATEGORIES,
  RESOURCE_KIND_META,
  type Resource,
  type ResourceCategory,
} from "../constants/mockdata";

// Android requires this flag to enable LayoutAnimation
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: format ISO date to "Updated Mon YYYY"
// e.g. "2025-09-01" → "Updated Sep 2025"
// ─────────────────────────────────────────────────────────────────────────────
function formatUpdatedDate(iso: string): string {
  const d = new Date(iso);
  return "Updated " + d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: open a resource
// Centralizing this here makes it easy to swap in expo-file-system or
// an in-app PDF viewer later — change only this one function.
// ─────────────────────────────────────────────────────────────────────────────
async function handleOpenResource(resource: Resource) {
  if (resource.kind === "pdf") {
    // TODO: For in-app PDF viewing, install expo-file-system + react-native-pdf
    // and navigate to a PDFViewerScreen passing the resource.url.
    // For now, fall through to Linking.openURL as a browser fallback.
    console.log("[Resources] Open PDF:", resource.id, resource.url);
  }

  // All other kinds (link, doc, video) and PDF fallback → open in browser
  const canOpen = await Linking.canOpenURL(resource.url);
  if (canOpen) {
    Linking.openURL(resource.url);
  } else {
    console.warn("[Resources] Cannot open URL:", resource.url);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Search Bar
// ─────────────────────────────────────────────────────────────────────────────
interface SearchBarProps {
  value:       string;
  onChange:    (text: string) => void;
  onClear:     () => void;
  placeholder: string;
}

function SearchBar({ value, onChange, onClear, placeholder }: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search-outline"
        size={18}
        color={COLORS.textMuted}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"   // We use our own clear button for cross-platform parity
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Resource Kind Badge
// Small pill showing the file/link type (PDF, Link, Video, Document)
// ─────────────────────────────────────────────────────────────────────────────
function KindBadge({ kind }: { kind: Resource["kind"] }) {
  const meta = RESOURCE_KIND_META[kind];
  return (
    <View style={[styles.kindBadge, { backgroundColor: meta.color + "22" }]}>
      <Ionicons name={meta.icon as any} size={10} color={meta.color} />
      <Text style={[styles.kindBadgeText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Featured Resource Card (horizontal strip)
// Shown at the top when no search is active.
// ─────────────────────────────────────────────────────────────────────────────
interface FeaturedCardProps {
  resource: Resource;
  onPress:  () => void;
}

function FeaturedCard({ resource, onPress }: FeaturedCardProps) {
  const kindMeta = RESOURCE_KIND_META[resource.kind];

  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.85}>
      {/* Icon circle */}
      <View style={[styles.featuredIconCircle, { backgroundColor: kindMeta.color + "22" }]}>
        <Ionicons name={kindMeta.icon as any} size={22} color={kindMeta.color} />
      </View>

      {/* Title + badge */}
      <Text style={styles.featuredTitle} numberOfLines={2}>{resource.title}</Text>

      <View style={styles.featuredFooter}>
        <KindBadge kind={resource.kind} />
        {/* File size if applicable */}
        {resource.fileSize && (
          <Text style={styles.featuredFileSize}>{resource.fileSize}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Single Resource Row (inside an accordion section)
// ─────────────────────────────────────────────────────────────────────────────
interface ResourceRowProps {
  resource:       Resource;
  onPress:        () => void;
  isLast:         boolean;   // Suppress bottom border on last item
  searchQuery:    string;    // Used to highlight matching text
}

function ResourceRow({ resource, onPress, isLast, searchQuery }: ResourceRowProps) {
  const kindMeta = RESOURCE_KIND_META[resource.kind];

  return (
    <TouchableOpacity
      style={[styles.resourceRow, isLast && styles.resourceRowLast]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Left icon */}
      <View style={[styles.resourceIconWrap, { backgroundColor: kindMeta.color + "18" }]}>
        <Ionicons name={kindMeta.icon as any} size={18} color={kindMeta.color} />
      </View>

      {/* Middle: title + description + meta */}
      <View style={styles.resourceInfo}>
        <Text style={styles.resourceTitle} numberOfLines={2}>{resource.title}</Text>
        <Text style={styles.resourceDesc} numberOfLines={2}>{resource.description}</Text>

        {/* Bottom row: kind badge + file size + updated date */}
        <View style={styles.resourceMeta}>
          <KindBadge kind={resource.kind} />
          {resource.fileSize && (
            <>
              <View style={styles.metaDot} />
              <Text style={styles.resourceMetaText}>{resource.fileSize}</Text>
            </>
          )}
          <View style={styles.metaDot} />
          <Text style={styles.resourceMetaText}>{formatUpdatedDate(resource.updatedAt)}</Text>
        </View>
      </View>

      {/* Right: open chevron */}
      <Ionicons name="chevron-forward" size={16} color={COLORS.gold} style={styles.resourceChevron} />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Accordion Section (category header + collapsible resource list)
// ─────────────────────────────────────────────────────────────────────────────
interface AccordionSectionProps {
  category:    ResourceCategory;
  isOpen:      boolean;
  onToggle:    () => void;
  resources:   Resource[];    // Already-filtered list (might differ from category.resources during search)
  searchQuery: string;
}

function AccordionSection({
  category,
  isOpen,
  onToggle,
  resources,
  searchQuery,
}: AccordionSectionProps) {
  return (
    <View style={styles.accordionSection}>
      {/* Section header — tap to expand/collapse */}
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        {/* Left: colored icon + title */}
        <View style={styles.accordionHeaderLeft}>
          <View style={[styles.sectionIconWrap, { backgroundColor: category.color + "22" }]}>
            <Ionicons name={category.icon as any} size={18} color={category.color} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>{category.title}</Text>
            <Text style={styles.sectionCount}>
              {resources.length} resource{resources.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Right: chevron rotates when open */}
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>

      {/* Collapsible resource list */}
      {isOpen && (
        <View style={styles.accordionBody}>
          {resources.map((res, idx) => (
            <ResourceRow
              key={res.id}
              resource={res}
              onPress={() => handleOpenResource(res)}
              isLast={idx === resources.length - 1}
              searchQuery={searchQuery}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ResourcesScreen() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [searchQuery,    setSearchQuery]    = useState("");
  // Set of category IDs that are currently expanded
  const [openSections,   setOpenSections]   = useState<Set<string>>(
    new Set([MOCK_RESOURCE_CATEGORIES[0].id]) // First section open by default
  );

  // ── Search filtering ────────────────────────────────────────────────────────
  // Returns only categories (and their matching resources) that match the query.
  // A category matches if its title matches OR any of its resources match.
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      // No search — return all categories with all their resources
      return MOCK_RESOURCE_CATEGORIES.map((cat) => ({
        category:  cat,
        resources: cat.resources,
      }));
    }

    const q = searchQuery.toLowerCase();
    const results: Array<{ category: ResourceCategory; resources: Resource[] }> = [];

    MOCK_RESOURCE_CATEGORIES.forEach((cat) => {
      // Filter resources that match the query in title or description
      const matchingResources = cat.resources.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.kind.toLowerCase().includes(q)
      );

      // Include category if its own title matches OR it has matching resources
      const categoryMatches = cat.title.toLowerCase().includes(q);

      if (categoryMatches) {
        // Show all resources in the category
        results.push({ category: cat, resources: cat.resources });
      } else if (matchingResources.length > 0) {
        // Show only the matching resources
        results.push({ category: cat, resources: matchingResources });
      }
    });

    return results;
  }, [searchQuery]);

  // Auto-expand all sections when searching
  const effectiveOpenSections: Set<string> = useMemo(() => {
    if (searchQuery.trim()) {
      // During a search, expand every category that has results
      return new Set(filteredCategories.map((fc) => fc.category.id));
    }
    return openSections;
  }, [searchQuery, filteredCategories, openSections]);

  // ── Featured resources (only shown when not searching) ──────────────────────
  const featuredResources = useMemo<Resource[]>(() => {
    if (searchQuery.trim()) return [];
    return MOCK_RESOURCE_CATEGORIES.flatMap((cat) =>
      cat.resources.filter((r) => r.isFeatured)
    );
  }, [searchQuery]);

  // ── Toggle accordion section ────────────────────────────────────────────────
  const toggleSection = useCallback((id: string) => {
    // Animate the layout change smoothly
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Clear search ────────────────────────────────────────────────────────────
  function clearSearch() {
    setSearchQuery("");
  }

  // ── Total resource count ────────────────────────────────────────────────────
  const totalResources = MOCK_RESOURCE_CATEGORIES.reduce(
    (sum, cat) => sum + cat.resources.length, 0
  );

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* ─── Intro header ──────────────────────────────────────────────── */}
        <View style={styles.introRow}>
          <View>
            <Text style={styles.introTitle}>Resources</Text>
            <Text style={styles.introSub}>
              {totalResources} documents, links & guides
            </Text>
          </View>
          {/* Gold decorative accent */}
          <View style={styles.introAccent}>
            <Ionicons name="library" size={28} color={COLORS.gold} />
          </View>
        </View>

        {/* Gold divider */}
        <View style={styles.goldBar} />

        {/* ─── Search Bar ────────────────────────────────────────────────── */}
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={clearSearch}
            placeholder="Search resources…"
          />
        </View>

        {/* ─── Search: result count feedback ─────────────────────────────── */}
        {searchQuery.trim().length > 0 && (
          <View style={styles.searchResultRow}>
            <Ionicons name="search" size={13} color={COLORS.textMuted} />
            <Text style={styles.searchResultText}>
              {filteredCategories.reduce((sum, fc) => sum + fc.resources.length, 0)} result
              {filteredCategories.reduce((sum, fc) => sum + fc.resources.length, 0) !== 1 ? "s" : ""}{" "}
              for "{searchQuery}"
            </Text>
          </View>
        )}

        {/* ─── Featured Strip (hidden during search) ─────────────────────── */}
        {featuredResources.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="star" size={14} color={COLORS.gold} />
              <Text style={styles.featuredHeading}>Featured</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredResources.map((res) => (
                <FeaturedCard
                  key={res.id}
                  resource={res}
                  onPress={() => handleOpenResource(res)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Accordion Categories ───────────────────────────────────────── */}
        <View style={styles.accordionWrapper}>
          {filteredCategories.length === 0 ? (
            // Empty search state
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyStateText}>No resources found</Text>
              <Text style={styles.emptyStateSub}>
                Try a different search term or browse by category.
              </Text>
              <TouchableOpacity style={styles.emptyStateClear} onPress={clearSearch}>
                <Text style={styles.emptyStateClearText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredCategories.map(({ category, resources }, idx) => (
              <AccordionSection
                key={category.id}
                category={category}
                isOpen={effectiveOpenSections.has(category.id)}
                onToggle={() => toggleSection(category.id)}
                resources={resources}
                searchQuery={searchQuery}
              />
            ))
          )}
        </View>

        {/* ─── Footer note ────────────────────────────────────────────────── */}
        {!searchQuery && (
          <View style={styles.footer}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.footerText}>
              Resources are sourced from FBLA-PBL national.
              Contact your adviser for chapter-specific documents.
            </Text>
          </View>
        )}

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
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop:     SPACING.lg,
    paddingBottom:  SPACING.sm,
  },
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

  // Gold separator
  goldBar: {
    height:          2,
    backgroundColor: COLORS.gold,
    marginHorizontal: SPACING.lg,
    marginTop:       SPACING.sm,
    marginBottom:    SPACING.lg,
    borderRadius:    RADIUS.full,
    opacity:         0.5,
  },

  // ── Search Bar ────────────────────────────────────────────────────────────
  searchWrapper: {
    paddingHorizontal: SPACING.lg,
    marginBottom:      SPACING.md,
  },
  searchContainer: {
    flexDirection:    "row",
    alignItems:       "center",
    backgroundColor:  COLORS.cardBackground,
    borderRadius:     RADIUS.lg,
    borderWidth:      1,
    borderColor:      COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical:  SPACING.sm + 2,
    gap:              SPACING.sm,
    ...SHADOWS.card,
  },
  searchIcon: {
    // fixed width so the input doesn't jitter when icon shows/hides
  },
  searchInput: {
    flex:       1,
    fontSize:   FONT_SIZE.md,
    fontFamily: FONTS.regular,
    color:      COLORS.textPrimary,
    fontWeight: "400",
    padding:    0,   // remove default RN TextInput padding on Android
  },

  // ── Search result count ────────────────────────────────────────────────────
  searchResultRow: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              SPACING.xs,
    paddingHorizontal: SPACING.lg,
    marginBottom:     SPACING.md,
  },
  searchResultText: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color:      COLORS.textMuted,
    fontWeight: "400",
  },

  // ── Featured Strip ────────────────────────────────────────────────────────
  featuredSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              SPACING.xs,
    paddingHorizontal: SPACING.lg,
    marginBottom:     SPACING.md,
  },
  featuredHeading: {
    fontSize:   FONT_SIZE.lg,
    fontFamily: FONTS.bold,
    color:      COLORS.textPrimary,
    fontWeight: "700",
  },
  featuredScroll: {
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.md,
  },
  featuredCard: {
    width:           160,
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.cardBorder,
    padding:         SPACING.md,
    gap:             SPACING.sm,
    ...SHADOWS.card,
  },
  featuredIconCircle: {
    width:          44,
    height:         44,
    borderRadius:   RADIUS.md,
    alignItems:     "center",
    justifyContent: "center",
  },
  featuredTitle: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    color:      COLORS.textPrimary,
    fontWeight: "600",
    lineHeight: 18,
    flex:       1,
  },
  featuredFooter: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           SPACING.sm,
    flexWrap:      "wrap",
  },
  featuredFileSize: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color:      COLORS.textMuted,
    fontWeight: "400",
  },

  // ── Kind Badge ────────────────────────────────────────────────────────────
  kindBadge: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              3,
    borderRadius:     RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical:  3,
  },
  kindBadgeText: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.semibold,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // ── Accordion ─────────────────────────────────────────────────────────────
  accordionWrapper: {
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.md,
  },
  accordionSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.cardBorder,
    overflow:        "hidden",
    ...SHADOWS.card,
  },
  accordionHeader: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        SPACING.md,
  },
  accordionHeaderLeft: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           SPACING.md,
    flex:          1,
  },
  sectionIconWrap: {
    width:          36,
    height:         36,
    borderRadius:   RADIUS.md,
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },
  sectionTitle: {
    fontSize:   FONT_SIZE.md,
    fontFamily: FONTS.semibold,
    color:      COLORS.textPrimary,
    fontWeight: "600",
  },
  sectionCount: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color:      COLORS.textMuted,
    fontWeight: "400",
    marginTop:  1,
  },

  // ── Accordion Body ────────────────────────────────────────────────────────
  accordionBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },

  // ── Resource Row ──────────────────────────────────────────────────────────
  resourceRow: {
    flexDirection:  "row",
    alignItems:     "flex-start",
    padding:        SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap:            SPACING.md,
  },
  resourceRowLast: {
    borderBottomWidth: 0,   // No divider after the last item
  },
  resourceIconWrap: {
    width:          36,
    height:         36,
    borderRadius:   RADIUS.md,
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
    marginTop:      2,
  },
  resourceInfo: {
    flex: 1,
    gap:  SPACING.xs,
  },
  resourceTitle: {
    fontSize:   FONT_SIZE.md,
    fontFamily: FONTS.semibold,
    color:      COLORS.textPrimary,
    fontWeight: "600",
    lineHeight: 20,
  },
  resourceDesc: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color:      COLORS.textSecondary,
    fontWeight: "400",
    lineHeight: 18,
  },
  resourceMeta: {
    flexDirection: "row",
    alignItems:    "center",
    flexWrap:      "wrap",
    gap:           SPACING.xs,
    marginTop:     2,
  },
  resourceMetaText: {
    fontSize:   FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color:      COLORS.textMuted,
    fontWeight: "400",
  },
  metaDot: {
    width:           3,
    height:          3,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 1,
  },
  resourceChevron: {
    marginTop: 10,
    flexShrink: 0,
  },

  // ── Empty State ───────────────────────────────────────────────────────────
  emptyState: {
    alignItems:    "center",
    paddingVertical: SPACING["3xl"],
    gap:           SPACING.sm,
  },
  emptyStateText: {
    fontSize:   FONT_SIZE.lg,
    fontFamily: FONTS.semibold,
    color:      COLORS.textSecondary,
    fontWeight: "600",
  },
  emptyStateSub: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color:      COLORS.textMuted,
    textAlign:  "center",
    fontWeight: "400",
    paddingHorizontal: SPACING["2xl"],
  },
  emptyStateClear: {
    marginTop:       SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.gold,
    borderRadius:    RADIUS.full,
    ...SHADOWS.goldGlow,
  },
  emptyStateClearText: {
    fontSize:   FONT_SIZE.sm,
    fontFamily: FONTS.bold,
    color:      COLORS.navyDark,
    fontWeight: "700",
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    flexDirection:    "row",
    alignItems:       "flex-start",
    gap:              SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingTop:       SPACING.xl,
    paddingBottom:    SPACING.md,
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