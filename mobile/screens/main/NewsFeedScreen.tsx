import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';

interface NewsArticle {
  id: string;
  category: string;
  headline: string;
  description: string;
  source: string;
  verified: boolean;
  trending: boolean;
  timeAgo: string;
  url: string;
}

const CATEGORIES = ['All', 'Technology', 'Health', 'Politics', 'Sports', 'Science'];

const CATEGORY_COLORS: { [key: string]: string } = {
  Technology: '#3b82f6',
  Health: '#10b981',
  Politics: '#ef4444',
  Sports: '#f59e0b',
  Science: '#8b5cf6',
};

const MOCK_NEWS: NewsArticle[] = [
  {
    id: '1',
    category: 'Technology',
    headline: 'AI Breakthrough in Natural Language Processing',
    description: 'Researchers announce major advancement in machine learning models that can detect misinformation with 95% accuracy.',
    source: 'TechCrunch',
    verified: true,
    trending: true,
    timeAgo: '15 min ago',
    url: 'https://example.com',
  },
  {
    id: '2',
    category: 'Health',
    headline: 'New Study Reveals Benefits of Mediterranean Diet',
    description: 'Long-term research shows significant health improvements in participants following Mediterranean eating patterns.',
    source: 'Health News Daily',
    verified: true,
    trending: false,
    timeAgo: '1 hour ago',
    url: 'https://example.com',
  },
  {
    id: '3',
    category: 'Politics',
    headline: 'Global Climate Summit Reaches Historic Agreement',
    description: 'World leaders commit to ambitious carbon reduction targets in landmark international accord.',
    source: 'Reuters',
    verified: true,
    trending: true,
    timeAgo: '2 hours ago',
    url: 'https://example.com',
  },
  {
    id: '4',
    category: 'Sports',
    headline: 'Championship Finals Set Record Viewership',
    description: 'Historic game draws millions of viewers worldwide, breaking previous streaming records.',
    source: 'ESPN',
    verified: true,
    trending: false,
    timeAgo: '3 hours ago',
    url: 'https://example.com',
  },
  {
    id: '5',
    category: 'Science',
    headline: 'Scientists Discover New Exoplanet in Habitable Zone',
    description: 'Astronomers identify potentially Earth-like planet orbiting nearby star system.',
    source: 'Space.com',
    verified: true,
    trending: true,
    timeAgo: '5 hours ago',
    url: 'https://example.com',
  },
  {
    id: '6',
    category: 'Technology',
    headline: 'Quantum Computing Milestone Achieved',
    description: 'New quantum processor demonstrates unprecedented processing capabilities for complex calculations.',
    source: 'MIT Technology Review',
    verified: true,
    trending: false,
    timeAgo: '6 hours ago',
    url: 'https://example.com',
  },
];

export default function NewsFeedScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredNews =
    selectedCategory === 'All'
      ? MOCK_NEWS
      : MOCK_NEWS.filter((article) => article.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || '#2563eb';
  };

  const renderNewsCard = ({ item }: { item: NewsArticle }) => (
    <TouchableOpacity style={styles.newsCard}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(item.category) + '20' },
          ]}
        >
          <Text
            style={[styles.categoryText, { color: getCategoryColor(item.category) }]}
          >
            {item.category}
          </Text>
        </View>
        {item.trending && (
          <View style={styles.trendingIcon}>
            <Text style={styles.trendingText}>↗</Text>
          </View>
        )}
      </View>

      <Text style={styles.timeAgo}>{item.timeAgo}</Text>

      <Text style={styles.headline}>{item.headline}</Text>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.sourceContainer}>
          <Text style={styles.sourceName}>{item.source}</Text>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.linkIcon}>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                selectedCategory === category && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.filterChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredNews}
        renderItem={renderNewsCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.newsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef444420',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  filterContainer: {
    paddingBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a2942',
    borderWidth: 1,
    borderColor: '#2d4263',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b9dc3',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  newsList: {
    padding: 24,
    paddingTop: 0,
  },
  newsCard: {
    backgroundColor: '#1a2942',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2d4263',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef444420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  timeAgo: {
    fontSize: 12,
    color: '#8b9dc3',
    marginBottom: 8,
  },
  headline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#8b9dc3',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2d4263',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sourceName: {
    fontSize: 14,
    color: '#8b9dc3',
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkIconText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
  },
});
