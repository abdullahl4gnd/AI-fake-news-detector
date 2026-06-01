import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Linking, RefreshControl,
} from 'react-native';

const NEWS_API_KEY = 'db117eb1c310400b843688e0798a518e';
const BASE_URL = 'https://newsapi.org/v2/top-headlines';

interface NewsArticle {
  id: string;
  category: string;
  headline: string;
  description: string;
  source: string;
  timeAgo: string;
  url: string;
}

const CATEGORIES = ['All', 'Technology', 'Health', 'Politics', 'Sports', 'Science'];
const CATEGORY_MAP: { [key: string]: string } = {
  Technology: 'technology', Health: 'health',
  Politics: 'politics', Sports: 'sports', Science: 'science',
};

function getTimeAgo(publishedAt: string): string {
  const diffMs = new Date().getTime() - new Date(publishedAt).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function NewsFeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async (category: string) => {
    try {
      const categoryParam = category === 'All' ? 'general' : CATEGORY_MAP[category] || 'general';
      const response = await fetch(`${BASE_URL}?category=${categoryParam}&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`);
      const data = await response.json();
      if (data.articles) {
        setNews(data.articles
          .filter((a: any) => a.title && a.title !== '[Removed]')
          .map((a: any, i: number) => ({
            id: String(i),
            category: category === 'All' ? 'General' : category,
            headline: a.title,
            description: a.description || 'No description available.',
            source: a.source?.name || 'Unknown',
            timeAgo: getTimeAgo(a.publishedAt),
            url: a.url,
          })));
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); fetchNews(selectedCategory); }, [selectedCategory]);

  const handleRefresh = () => { setRefreshing(true); fetchNews(selectedCategory); };

  const renderNewsCard = ({ item }: { item: NewsArticle }) => (
    <TouchableOpacity style={styles.newsCard} onPress={() => Linking.openURL(item.url)}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.timeAgo}>{item.timeAgo}</Text>
      </View>
      <Text style={styles.headline}>{item.headline}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.sourceContainer}>
          <Text style={styles.sourceName}>{item.source}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.linkIcon} onPress={() => Linking.openURL(item.url)}>
          <Text style={styles.linkIconText}>↗</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Latest News</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item: category }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedCategory === category && styles.filterChipActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.filterChipText, selectedCategory === category && styles.filterChipTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.newsList}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#ffffff" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No news available</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { padding: 24, paddingTop: 60, paddingBottom: 16 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef444420', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  liveText: { fontSize: 12, fontWeight: '600', color: '#ef4444' },
  filterContainer: { paddingBottom: 16 },
  filterScroll: { paddingHorizontal: 24, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', marginRight: 8 },
  filterChipActive: { backgroundColor: '#ffffff', borderColor: '#ffffff' },
  filterChipText: { fontSize: 14, fontWeight: '600', color: '#888888' },
  filterChipTextActive: { color: '#000000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 16, color: '#888888' },
  newsList: { padding: 24, paddingTop: 0 },
  newsCard: { backgroundColor: '#111111', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333333' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, backgroundColor: '#ffffff15' },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#aaaaaa' },
  timeAgo: { fontSize: 12, color: '#888888' },
  headline: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginBottom: 8, lineHeight: 22 },
  description: { fontSize: 14, color: '#888888', lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#222222' },
  sourceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  sourceName: { fontSize: 14, color: '#888888', fontWeight: '600' },
  verifiedBadge: { backgroundColor: '#10b98120', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  verifiedText: { fontSize: 11, color: '#10b981', fontWeight: '600' },
  linkIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ffffff15', alignItems: 'center', justifyContent: 'center' },
  linkIconText: { fontSize: 16, color: '#ffffff', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', padding: 48 },
  emptyText: { fontSize: 16, color: '#888888' },
});