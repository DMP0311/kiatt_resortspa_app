import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Search, Star, Calendar, Space as Spa, Bed } from 'lucide-react-native';

type Room = {
  id: string;
  room_number: string;
  room_type: string;
  description: string;
  price_per_night: number;
  images: string[] | null;
};

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
};

export default function HomeScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    fetchFeaturedRooms();
    fetchPopularServices();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(data);
    } catch (err) {
      console.error('Error checking user:', err);
    }
  };

  const fetchFeaturedRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .order('price_per_night', { ascending: false })
        .limit(5);

      if (error) throw error;
      setFeaturedRooms(data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchPopularServices = async () => {
    try {
      // Assuming you have a services table
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .limit(5);

      if (error) throw error;
      setPopularServices(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching services:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0891b2" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {profile?.full_name || 'Guest'}
            </Text>
            <Text style={styles.welcomeText}>
              Welcome to Kiatt Resort & Spa
            </Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={24} color="#0891b2" />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2940&auto=format&fit=crop',
            }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Special Offer</Text>
            <Text style={styles.bannerSubtitle}>20% off on luxury rooms</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Link href="/(tabs)/explore" asChild>
            <TouchableOpacity style={styles.quickActionItem}>
              <View
                style={[styles.quickActionIcon, { backgroundColor: '#e0f2fe' }]}
              >
                <Bed size={24} color="#0891b2" />
              </View>
              <Text style={styles.quickActionText}>Rooms</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/services" asChild>
            <TouchableOpacity style={styles.quickActionItem}>
              <View
                style={[styles.quickActionIcon, { backgroundColor: '#f0fdf4' }]}
              >
                <Spa size={24} color="#16a34a" />
              </View>
              <Text style={styles.quickActionText}>Services</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/bookings" asChild>
            <TouchableOpacity style={styles.quickActionItem}>
              <View
                style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}
              >
                <Calendar size={24} color="#d97706" />
              </View>
              <Text style={styles.quickActionText}>Bookings</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Featured Rooms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Rooms</Text>
            <Link href="/(tabs)/explore" asChild>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          >
            {featuredRooms.length > 0 ? (
              featuredRooms.map((room) => (
                <Link key={room.id} href={`./room/${room.id}`} asChild>
                  <TouchableOpacity style={styles.roomCard}>
                    <Image
                      source={{
                        uri:
                          room.images && room.images.length > 0
                            ? room.images[0]
                            : 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2940&auto=format&fit=crop',
                      }}
                      style={styles.roomImage}
                    />
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomType}>{room.room_type}</Text>
                      <Text style={styles.roomNumber}>
                        Room {room.room_number}
                      </Text>
                      <Text style={styles.roomPrice}>
                        ${room.price_per_night}/night
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No rooms available</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Popular Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
            <Link href="/services" asChild>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          >
            {popularServices.length > 0 ? (
              popularServices.map((service) => (
                <Link key={service.id} href={`/service/${service.id}`} asChild>
                  <TouchableOpacity style={styles.serviceCard}>
                    <Image
                      source={{
                        uri:
                          service.image_url ||
                          'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2940&auto=format&fit=crop',
                      }}
                      style={styles.serviceImage}
                    />
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceCategory}>
                        {service.category}
                      </Text>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.servicePrice}>${service.price}</Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No services available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerContent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#f1f5f9',
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0891b2',
  },
  horizontalList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  roomCard: {
    width: 240,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roomImage: {
    width: '100%',
    height: 140,
  },
  roomInfo: {
    padding: 12,
  },
  roomType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  roomNumber: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  roomPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0891b2',
  },
  serviceCard: {
    width: 200,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceImage: {
    width: '100%',
    height: 120,
  },
  serviceInfo: {
    padding: 12,
  },
  serviceCategory: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0891b2',
  },
  emptyState: {
    width: 240,
    height: 180,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
});
