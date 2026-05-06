import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Sparkles,
  UserRound,
  WandSparkles,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Design Tokens (match your mockup exactly) ───────────────────────────────
const colors = {
  bg: '#0B1929', // deep navy background
  bgCard: '#0F2235', // slightly lighter card bg
  bgCardBorder: '#1A3050', // card border
  bgInput: '#0F2235', // input background
  primary: '#4A90D9', // blue — circle nodes, links, section headers
  primaryDim: '#1E3A5F', // dimmed blue for timeline line
  primaryGlow: '#4A90D920', // blue glow
  gold: '#C9A84C', // gold — selected tab, active badge
  goldDim: '#C9A84C30', // gold dim bg
  white: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#8BA5C0', // muted blue-grey
  textMuted: '#4A6580', // very muted
  badgeLab: '#1E3A5F', // LAB REPORT badge bg
  badgeLabText: '#7DB3E0', // LAB REPORT badge text
  badgeGenomic: '#1A2F1A', // GENOMIC badge bg
  badgeGenomicText: '#6DBF6D',
  badgeSample: '#2A1F10',
  badgeSampleText: '#C9A84C',
  chevron: '#C9A84C',
  providerLabel: '#4A90D9',
  aiLabel: '#4A90D9',
  separator: '#1A3050',
};

// ─── Types ───────────────────────────────────────────────────────────────────
type BadgeType = 'LAB_REPORT' | 'GENOMIC_TESTING' | 'SAMPLE_COLLECTION';

interface TimelineEntry {
  id: string;
  date: string;
  badgeType: BadgeType;
  title: string;
  provider: string;
  aiSummary: string;
}

interface DetailEntry extends TimelineEntry {
  fileName: string;
  fileSubtitle: string;
  diagnosis: string[];
  requestedTests: string[];
  sampleTypes: string[];
  requestingPhysician: string;
}

// ─── dummy test Data ────────────────────────────────────────────────────────────────
const timelineData: DetailEntry[] = [
  {
    id: '1',
    date: '03, APRIL 2026',
    badgeType: 'LAB_REPORT',
    title: 'TRF LAB TEST',
    provider: 'Dr. Vijay Solanki',
    aiSummary:
      '38-year-old Mumbai patient with locally advanced breast cancer; multiple genomic tests requested using liquid and tissue samples by Dr. Vijay Solanki.',
    fileName: 'Report_TRF.pdf',
    fileSubtitle: 'Report Document',
    diagnosis: ['Locally advanced left breast cancer', 'Prior history of chemotherapy'],
    requestedTests: [
      'OncoIndx L8X | OncoIndx TBX | OncoMonitor | OncoTarget | OncoPredikt | HRD (Homologous Recombination Deficiency)',
    ],
    sampleTypes: ['Liquid biopsy (blood sample)', 'Tissue biopsy', 'FFPE tissue block (archival sample)'],
    requestingPhysician: 'Dr. Vijay Solanki',
  },
  {
    id: '2',
    date: '22, MARCH 2026',
    badgeType: 'GENOMIC_TESTING',
    title: 'COMPREHENSIVE GENOMIC TESTING INITIATED',
    provider: 'Dr. Vishal Jadhav',
    aiSummary:
      '41-year-old Pune patient with locally advanced breast cancer; multiple genomic tests requested using liquid and tissue samples.',
    fileName: 'Genomic_Report.pdf',
    fileSubtitle: 'Genomic Report',
    diagnosis: ['Locally advanced right breast cancer', 'No prior chemotherapy'],
    requestedTests: ['OncoIndx L8X | OncoMonitor | HRD'],
    sampleTypes: ['Liquid biopsy (blood sample)', 'Tissue biopsy'],
    requestingPhysician: 'Dr. Vishal Jadhav',
  },
  {
    id: '3',
    date: '10, FEBRUARY 2026',
    badgeType: 'SAMPLE_COLLECTION',
    title: 'SAMPLE COLLECTION COMPLETED',
    provider: 'Dr. Anita Sharma',
    aiSummary:
      '45-year-old Delhi patient; samples collected for genomic profiling including liquid biopsy and FFPE tissue block.',
    fileName: 'Sample_Collection.pdf',
    fileSubtitle: 'Collection Record',
    diagnosis: ['Stage III breast cancer'],
    requestedTests: ['OncoIndx TBX | OncoPredikt'],
    sampleTypes: ['Liquid biopsy', 'FFPE tissue block'],
    requestingPhysician: 'Dr. Anita Sharma',
  },
];

const FILTER_TABS: { label: string; value: BadgeType | 'ALL' }[] = [
  { label: 'ALL', value: 'ALL' },
  { label: 'LAB REPORT', value: 'LAB_REPORT' },
  { label: 'GENOMIC TESTING', value: 'GENOMIC_TESTING' },
  { label: 'SAMPLE COLLECTION', value: 'SAMPLE_COLLECTION' },
];

// ─── Badge config ─────────────────────────────────────────────────────────────
const badgeConfig: Record<BadgeType, { bg: string; text: string; label: string }> = {
  LAB_REPORT: { bg: colors.badgeLab, text: colors.badgeLabText, label: 'LAB REPORT' },
  GENOMIC_TESTING: { bg: colors.badgeGenomic, text: colors.badgeGenomicText, label: 'GENOMIC TESTING' },
  SAMPLE_COLLECTION: { bg: colors.badgeSample, text: colors.badgeSampleText, label: 'SAMPLE COLLECTION' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const CategoryBadge = ({ type }: { type: BadgeType }) => {
  const cfg = badgeConfig[type];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
};

const ProviderRow = ({ name }: { name: string }) => (
  <View style={styles.providerRow}>
    <View style={styles.providerIcon}>
      <UserRound size={16} color={colors.white} />
    </View>
    <View>
      <Text style={styles.providerLabel}>PROVIDER</Text>
      <Text style={styles.providerName}>{name}</Text>
    </View>
  </View>
);

// ─── Detail View ──────────────────────────────────────────────────────────────
const DetailView = ({ item, onBack }: { item: DetailEntry; onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'full'>('summary');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
        <View>
          <Text style={styles.detailTitle}>Clinical Timeline</Text>
          <Text style={styles.detailSubtitle}>PATIENT RECORD</Text>
        </View>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.detailCloseBtn} onPress={onBack} activeOpacity={0.8}>
          <ChevronLeft size={16} color={colors.textSecondary} strokeWidth={2.2} />
          <Text style={styles.detailCloseBtnText}>Back to Timeline</Text>
        </TouchableOpacity>

        {/* Badge */}
        <CategoryBadge type={item.badgeType} />
        <Text style={styles.detailCardTitle}>{item.title}</Text>

        {/* File attachment */}
        <View style={styles.fileRow}>
          <View style={styles.fileIcon}>
            <FileText size={18} color={colors.white} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.fileName}>{item.fileName}</Text>
            <Text style={styles.fileSubtitle}>{item.fileSubtitle}</Text>
          </View>
          <TouchableOpacity style={styles.viewBtn}>
            <View style={styles.inlineIconText}>
              <Eye size={14} color={colors.gold} strokeWidth={2} />
              <Text style={styles.viewBtnText}>View</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Provider */}
        <View style={styles.detailProviderRow}>
          <View style={styles.providerIconLg}>
            <UserRound size={22} color={colors.white} />
          </View>
          <View>
            <Text style={styles.providerLabel}>PROVIDER</Text>
            <Text style={styles.providerNameLg}>{item.provider}</Text>
          </View>
        </View>

        {/* Segmented tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'summary' && styles.tabActive]}
            onPress={() => setActiveTab('summary')}
          >
            <View style={styles.tabLabelRow}>
              <Sparkles size={14} color={activeTab === 'summary' ? colors.bg : colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>Summary</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'full' && styles.tabActive]}
            onPress={() => setActiveTab('full')}
          >
            <View style={styles.tabLabelRow}>
              <WandSparkles size={14} color={activeTab === 'full' ? colors.bg : colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.tabText, activeTab === 'full' && styles.tabTextActive]}>Full Content</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* AI Summary */}
        <Text style={styles.sectionHeader}>AI SUMMARY</Text>
        <Text style={styles.bodyText}>{item.aiSummary}</Text>

        {/* Patient & Test Summary */}
        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>PATIENT & TEST SUMMARY</Text>

        <Text style={styles.subsectionHeader}>Diagnosis</Text>
        {item.diagnosis.map((d, i) => (
          <Text key={i} style={styles.bulletItem}>
            • {d}
          </Text>
        ))}

        <Text style={styles.subsectionHeader}>Requested Tests</Text>
        {item.requestedTests.map((t, i) => (
          <Text key={i} style={styles.bulletItem}>
            • {t}
          </Text>
        ))}

        <Text style={styles.subsectionHeader}>Sample Types</Text>
        {item.sampleTypes.map((s, i) => (
          <Text key={i} style={styles.bulletItem}>
            • {s}
          </Text>
        ))}

        <Text style={styles.subsectionHeader}>Requesting Physician</Text>
        <Text style={styles.bodyText}>{item.requestingPhysician}</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Timeline Item ────────────────────────────────────────────────────────────
const TimelineItem = ({ item, isLast, onPress }: { item: DetailEntry; isLast: boolean; onPress: () => void }) => (
  <View style={styles.timelineRow}>
    {/* Left spine */}
    <View style={styles.spineCol}>
      {/* Circle node */}
      <View style={styles.nodeOuter}>
        <View style={styles.nodeInner} />
      </View>
      {/* Vertical line — hidden for last item */}
      {!isLast && <View style={styles.spineLine} />}
    </View>

    {/* Right content */}
    <View style={styles.timelineContent}>
      {/* Date + badge */}
      <View style={styles.dateBadgeRow}>
        <Text style={styles.dateText}>{item.date}</Text>
        <CategoryBadge type={item.badgeType} />
      </View>

      {/* Card */}
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <ChevronRight size={20} color={colors.gold} strokeWidth={2.2} />
        </View>
        <View style={styles.separator} />
        <ProviderRow name={item.provider} />
        <View style={styles.separator} />
        <View style={styles.aiSummaryBlock}>
          <Text style={styles.aiLabel}>AI SUMMARY</Text>
          <Text style={styles.aiText} numberOfLines={4}>
            {item.aiSummary}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ClinicalTimeline() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<BadgeType | 'ALL'>('ALL');
  const [selectedItem, setSelectedItem] = useState<DetailEntry | null>(null);

  if (selectedItem) {
    return <DetailView item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  const filtered = timelineData.filter(item => {
    const matchFilter = activeFilter === 'ALL' || item.badgeType === activeFilter;
    const matchSearch =
      search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.provider.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Clinical Timeline</Text>
          <Text style={styles.headerSubtitle}>PATIENT RECORD</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <View style={styles.searchIconWrap}>
            <Sparkles size={15} color={colors.textSecondary} strokeWidth={2} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search records..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <CalendarDays size={17} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.filterChip, activeFilter === tab.value && styles.filterChipActive]}
            onPress={() => setActiveFilter(tab.value)}
          >
            <Text style={[styles.filterChipText, activeFilter === tab.value && styles.filterChipTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timeline list */}
      <ScrollView style={styles.flex} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((item, index) => (
          <TimelineItem
            key={item.id}
            item={item}
            isLast={index === filtered.length - 1}
            onPress={() => setSelectedItem(item)}
          />
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '500',
    marginTop: 1,
  },

  // Search
  searchRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIconWrap: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    height: 44,
  },

  // Filter chips
  filterScroll: { maxHeight: 44 },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  filterChipTextActive: {
    color: colors.primary,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Timeline row
  timelineRow: {
    flexDirection: 'row',
  },

  // Spine (left column)
  spineCol: {
    width: 32,
    alignItems: 'center',
    marginTop: 2,
  },
  nodeOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primaryDim,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  nodeInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  spineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.primaryDim,
    marginTop: 4,
    minHeight: 40,
  },

  // Timeline content (right)
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
  },
  dateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    marginTop: 0,
  },
  dateText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Card
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
    marginRight: 8,
  },
  chevron: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '300',
  },
  separator: {
    height: 1,
    backgroundColor: colors.separator,
    marginHorizontal: 14,
  },

  // Provider row (inside card)
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  providerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerIconText: { fontSize: 16 },
  providerLabel: {
    color: colors.providerLabel,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  providerName: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
  },

  // AI Summary (inside card)
  aiSummaryBlock: { padding: 14 },
  aiLabel: {
    color: colors.aiLabel,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  aiText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
  },

  // ── Detail View styles ───────────────────────────────────────────────────

  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  detailTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  detailSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '500',
    marginTop: 1,
  },
  detailContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  detailCloseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 10,
  },
  detailCloseBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  detailCardTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 10,
    marginBottom: 16,
  },

  // File row
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: 12,
    gap: 12,
    marginBottom: 14,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  fileSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  viewBtn: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewBtnText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  inlineIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Detail provider
  detailProviderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: 14,
    marginBottom: 16,
  },
  providerIconLg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerNameLg: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },

  // Segmented tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.gold,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabTextActive: {
    color: colors.bg,
  },

  // Detail text content
  sectionHeader: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  subsectionHeader: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 6,
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  bulletItem: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 4,
  },
});
