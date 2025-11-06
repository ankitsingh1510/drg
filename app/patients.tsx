import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, View } from 'react-native';
import { EmptyState, FilterModal, LoadingIndicator, PatientHeader, PatientRow } from '@/components/patient';
import { useAuth } from '@/context/AuthContext';
import { type Patient, patientsAPI } from '@/services/patients';

export default function Patients() {
  const { logout, user, usersStudyList } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPatients = useCallback(
    async (pageNum: number, filterValue: string, searchQuery: string, append = false) => {
      try {
        const response = await patientsAPI.fetchTestsDetails({
          studyFilter: usersStudyList,
          page: pageNum,
          count: 10,
          searchQuery: searchQuery,
          workflowStatusFilter: filterValue,
        });
        console.log('Fetch called');
        setTotalCount(response.totalCount);

        if (append) {
          setPatients(prev => [...prev, ...(response.data || [])]);
          setPage(pageNum);
        } else {
          setPatients(response.data || []);
          setPage(pageNum);
        }

        setHasMore((response.data || []).length === 10);
      } catch (error: any) {
        if (!append) {
          setPatients([]);
        }
        console.error('Error fetching patients:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch patient data. Please try again.';
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [usersStudyList]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    console.log('Refresh called');
    fetchPatients(1, filter, query);
  }, [filter, query, fetchPatients]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading && !refreshing) {
      setLoadingMore(true);
      fetchPatients(page + 1, filter, query, true);
    }
  }, [page, filter, query, loadingMore, hasMore, loading, refreshing, fetchPatients]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (usersStudyList.length > 0) {
        setLoading(true);
        fetchPatients(1, filter, query);
      }
    }, 500); // Increased to 500ms for better UX

    return () => clearTimeout(timeoutId);
  }, [query, filter]); // Runs on mount and when query/filter changes

  const handleFilterChange = useCallback(
    (newFilter: string) => {
      setFilter(newFilter);
      setShowFilterModal(false);
      setLoading(true);
      fetchPatients(1, newFilter, query);
    },
    [query, fetchPatients]
  );

  // Render functions
  const renderPatient = useCallback(({ item }: { item: Patient }) => <PatientRow patient={item} />, []);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return <LoadingIndicator type="footer" />;
  }, [loadingMore]);

  const renderEmptyComponent = useCallback(() => {
    if (loading) return null;
    return <EmptyState type="no-patients" />;
  }, [loading]);

  // Early returns for different states
  if (usersStudyList.length === 0 && !loading) {
    return <EmptyState type="no-studies" onLogout={logout} />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <PatientHeader
        user={user}
        totalCount={totalCount}
        query={query}
        filter={filter}
        onSearch={handleSearch}
        onFilterPress={() => setShowFilterModal(true)}
        onLogout={logout}
      />

      <View className="flex-1">
        <FlatList
          data={patients}
          renderItem={renderPatient}
          keyExtractor={(item, index) => `${item.sampleBarcode}-${index}`}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#daa521"
              colors={['#daa521']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />

        {loading && !refreshing && (
          <View className="absolute inset-0 items-center justify-center bg-gray-50/80">
            <ActivityIndicator size="large" color="#daa521" />
            <Text className="mt-2 text-lg text-slate-600">Loading patients...</Text>
          </View>
        )}
      </View>

      <FilterModal
        visible={showFilterModal}
        currentFilter={filter}
        onClose={() => setShowFilterModal(false)}
        onFilterChange={handleFilterChange}
      />
    </View>
  );
}
