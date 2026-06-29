import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Filter, RefreshCcw, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import BackButton from '@/components/ui/BackButton';
import {
  fetchPublications,
  FILTER_OPTIONS,
  type FilterKey,
  type Publication,
  type PublicationFilters,
} from '@/services/publications';

const FILTER_LABELS: Record<FilterKey, string> = {
  content_type: 'Content Type',
  cancer_type: 'Cancer Type',
  test_type: 'Test Type',
  use_case: 'Use Case',
  biomarker: 'Biomarker',
};

function TagPill({
  label,
  borderColor,
  bgColor,
  textColor,
}: {
  label: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <View className="rounded-full border px-2.5 py-1" style={{ borderColor, backgroundColor: bgColor }}>
      <AppText className="text-xs" style={{ color: textColor }}>
        {label}
      </AppText>
    </View>
  );
}

function FilterChip({
  filterKey,
  selectedValues,
  onPress,
}: {
  filterKey: FilterKey;
  selectedValues?: string[];
  onPress: () => void;
}) {
  const count = selectedValues?.length ?? 0;
  const active = count > 0;

  let chipLabel = FILTER_LABELS[filterKey];
  if (count === 1) {
    chipLabel = selectedValues![0];
  } else if (count > 1) {
    chipLabel = `${FILTER_LABELS[filterKey]} (${count})`;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center gap-1 rounded-full border px-3 py-[7px] ${
        active ? 'border-[#DAA520] bg-[#FFF8E7]' : 'border-gray-200 bg-white'
      }`}
    >
      <AppText
        weight={active ? 'semibold' : 'regular'}
        className={`text-xs ${active ? 'text-[#B8860B]' : 'text-gray-500'}`}
        numberOfLines={1}
      >
        {chipLabel}
      </AppText>
      <ChevronDown size={12} color={active ? '#B8860B' : '#9CA3AF'} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

function FilterDropdown({
  filterKey,
  selectedValues,
  onApply,
  onClose,
}: {
  filterKey: FilterKey;
  selectedValues: string[];
  onApply: (values: string[]) => void;
  onClose: () => void;
}) {
  const options = FILTER_OPTIONS[filterKey] as readonly string[];
  const [localSelected, setLocalSelected] = useState<string[]>(selectedValues);

  function toggleOption(option: string) {
    setLocalSelected(prev => (prev.includes(option) ? prev.filter(v => v !== option) : [...prev, option]));
  }

  function selectAll() {
    setLocalSelected([]);
  }

  function handleApply() {
    onApply(localSelected);
    onClose();
  }

  const allSelected = localSelected.length === 0;

  return (
    <View className="absolute inset-0 z-[100]">
      {/* Backdrop */}
      <Pressable onPress={onClose} className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />

      {/* Sheet */}
      <View
        className="absolute left-4 right-4 top-14 max-h-[420px] rounded-xl bg-white py-2"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-2">
          <AppText weight="semibold" className="text-sm text-gray-800">
            {FILTER_LABELS[filterKey]}
          </AppText>
          <View className="flex-row items-center gap-3">
            {localSelected.length > 0 && (
              <TouchableOpacity onPress={selectAll}>
                <AppText weight="medium" className="text-xs text-red-400">
                  Clear
                </AppText>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose}>
              <X size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[310px]">
          {/* "All" option */}
          <FilterOption label="All" selected={allSelected} onPress={selectAll} isCheckbox />

          {options.map(option => (
            <FilterOption
              key={option}
              label={option}
              selected={localSelected.includes(option)}
              onPress={() => toggleOption(option)}
              isCheckbox
            />
          ))}
        </ScrollView>

        {/* Apply button */}
        <View className="border-t border-gray-100 px-4 pb-2 pt-3">
          <TouchableOpacity
            onPress={handleApply}
            className="items-center rounded-lg bg-[#1A365D] py-2.5"
            activeOpacity={0.8}
          >
            <AppText weight="semibold" className="text-sm text-white">
              Apply{localSelected.length > 0 ? ` (${localSelected.length})` : ''}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function FilterOption({
  label,
  selected,
  onPress,
  isCheckbox,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  isCheckbox?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-4 py-3 ${selected ? 'bg-[#FFF8E7]' : 'bg-transparent'}`}
    >
      {isCheckbox && (
        <View
          className={`mr-3 h-[20px] w-[20px] items-center justify-center rounded-[5px] border ${
            selected ? 'border-[#DAA520] bg-[#DAA520]' : 'border-gray-300 bg-white'
          }`}
        >
          {selected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
        </View>
      )}
      <AppText
        weight={selected ? 'semibold' : 'regular'}
        className={`flex-1 text-sm ${selected ? 'text-[#B8860B]' : 'text-gray-700'}`}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const PublicationCard = React.memo(function PublicationCard({
  item,
  onPress,
}: {
  item: Publication;
  onPress: (url: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(item.url)}
      className="mb-4 overflow-hidden rounded-xl border border-[#E2E5E9] bg-white"
    >
      <View className="h-[140px] w-full overflow-hidden bg-[#1A2F4A]">
        <ExpoImage
          source={item.image}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={300}
          cachePolicy="disk"
        />

        {item.event && (
          <View className="absolute left-3 top-3 rounded-full bg-[#F3B416] px-3 py-[5px]">
            <AppText weight="semibold" className="text-xs text-white">
              {item.event}
            </AppText>
          </View>
        )}

        {item.content_type && (
          <View
            className="absolute right-3 top-3 rounded-full px-2.5 py-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <AppText weight="medium" className="text-xs text-white">
              {item.content_type}
            </AppText>
          </View>
        )}
      </View>

      <View className="px-4 pb-3.5 pt-3.5">
        {(item.date || item.reading_time) && (
          <View className="mb-2 flex-row items-center gap-3">
            {item.date && <AppText className="text-xs text-gray-400">{item.date}</AppText>}
            {item.reading_time && <AppText className="text-xs text-gray-400">• {item.reading_time}</AppText>}
          </View>
        )}

        <AppText weight="regular" className="mb-2.5 text-sm leading-[21px] text-gray-700" numberOfLines={3}>
          {item.title}
        </AppText>

        <View className="mb-3 flex-row flex-wrap gap-1.5">
          {item.cancer_type?.map(ct => (
            <TagPill key={`cancer-${ct}`} label={ct} borderColor="#DBEAFE" bgColor="#EFF6FF" textColor="#3B82F6" />
          ))}
          {item.test_type?.map(tt => (
            <TagPill key={`test-${tt}`} label={tt} borderColor="#E0E7FF" bgColor="#EEF2FF" textColor="#6366F1" />
          ))}
          {item.biomarker?.map(bm => (
            <TagPill key={`bio-${bm}`} label={bm} borderColor="#E5E7EB" bgColor="#F9FAFB" textColor="#6B7280" />
          ))}
        </View>

        <View className="flex-row items-center justify-end">
          <AppText weight="semibold" className="text-sm text-[#DAA520]">
            View details
          </AppText>
          <ChevronRight size={14} color="#DAA520" strokeWidth={2.5} />
        </View>
      </View>
    </Pressable>
  );
});

export default function PublicationsScreen() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PublicationFilters>({});
  const [activeDropdown, setActiveDropdown] = useState<FilterKey | null>(null);

  const isFetching = useRef(false);
  const activeFilterCount = Object.values(filters).filter(v => v && v.length > 0).length;

  const loadPublications = useCallback(async (pageNum: number, currentFilters: PublicationFilters, append = false) => {
    if (isFetching.current) return;
    isFetching.current = true;

    append ? setLoadingMore(true) : setLoading(true);
    setError(null);

    try {
      const response = await fetchPublications(pageNum, currentFilters);
      setPublications(prev => (append ? [...prev, ...response.posts] : response.posts));
      setTotal(response.total);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load publications. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    loadPublications(1, {});
  }, []);

  function handleFilterChange(key: FilterKey, values: string[]) {
    const next = { ...filters };
    values.length > 0 ? (next[key] = values) : delete next[key];
    setFilters(next);
    setPublications([]);
    loadPublications(1, next);
  }

  function clearAllFilters() {
    setFilters({});
    setPublications([]);
    loadPublications(1, {});
  }

  function handleLoadMore() {
    if (loadingMore || loading || publications.length >= total) return;
    loadPublications(page + 1, filters, true);
  }

  const openItem = useCallback((url: string) => {
    WebBrowser.openBrowserAsync(url);
  }, []);

  function renderFooter() {
    if (loadingMore) {
      return (
        <View className="items-center py-5">
          <ActivityIndicator size="small" color="#DAA520" />
          <AppText className="mt-1.5 text-xs text-gray-400">Loading more…</AppText>
        </View>
      );
    }

    if (publications.length > 0 && publications.length >= total) {
      return (
        <View className="items-center py-4">
          <AppText className="text-xs text-gray-400">Showing all {total} publications</AppText>
        </View>
      );
    }

    return null;
  }

  function renderEmpty() {
    if (loading) return null;

    return (
      <View className="items-center pt-20">
        <AppText weight="medium" className="mb-2 text-base text-gray-500">
          No publications found.
        </AppText>
        {activeFilterCount > 0 && (
          <TouchableOpacity onPress={clearAllFilters}>
            <AppText weight="semibold" className="text-sm text-[#DAA520]">
              Clear all filters
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#1A365D]" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A365D" />

      <View className="px-5 pb-6 pt-3">
        <View className="flex-row items-center">
          <BackButton />
          <AppText weight="bold" className="mr-[42px] flex-1 text-center text-xl text-white">
            Publications
          </AppText>
        </View>
      </View>

      <View className="flex-1 overflow-hidden rounded-t-3xl bg-[#FCFCFC]">
        <View className="border-b border-gray-100 pb-3 pt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            <View className="flex-row items-center pr-1">
              <Filter size={16} color="#6B7280" />
              {activeFilterCount > 0 && (
                <View className="ml-1 h-[18px] w-[18px] items-center justify-center rounded-[10px] bg-[#DAA520]">
                  <AppText weight="bold" className="text-xs text-white">
                    {activeFilterCount}
                  </AppText>
                </View>
              )}
            </View>

            {(Object.keys(FILTER_OPTIONS) as FilterKey[]).map(key => (
              <FilterChip
                key={key}
                filterKey={key}
                selectedValues={filters[key]}
                onPress={() => setActiveDropdown(prev => (prev === key ? null : key))}
              />
            ))}

            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={clearAllFilters} className="flex-row items-center gap-1 px-2.5 py-[7px]">
                <X size={12} color="#EF4444" />
                <AppText weight="medium" className="text-xs text-red-500">
                  Clear
                </AppText>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Loading */}
        {loading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#DAA520" />
            <AppText className="mt-3 text-sm text-gray-500">Loading publications…</AppText>
          </View>
        )}

        {/* Error */}
        {error && !loading && (
          <View className="flex-1 items-center justify-center p-5">
            <AppText weight="medium" className="mb-4 text-center text-base text-red-500">
              {error}
            </AppText>
            <TouchableOpacity
              onPress={() => loadPublications(page, filters)}
              className="flex-row items-center gap-2 rounded-lg bg-[#1A365D] px-5 py-2.5"
            >
              <RefreshCcw size={16} color="#FFFFFF" />
              <AppText weight="semibold" className="text-sm text-white">
                Retry
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        {!loading && !error && (
          <FlatList
            data={publications}
            keyExtractor={(_, index) => `pub-${index}`}
            renderItem={({ item }) => <PublicationCard item={item} onPress={openItem} />}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
          />
        )}

        {/* Dropdown overlay */}
        {activeDropdown && (
          <FilterDropdown
            filterKey={activeDropdown}
            selectedValues={filters[activeDropdown] ?? []}
            onApply={values => handleFilterChange(activeDropdown, values)}
            onClose={() => setActiveDropdown(null)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
