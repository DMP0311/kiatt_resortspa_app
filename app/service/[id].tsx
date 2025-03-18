import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Star, Clock, MapPin, Calendar, ChevronRight } from 'lucide-react-native';

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  duration: number | null;
  location: string | null;
};

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setService(data);
    } catch (err: any) {
      console.error('Error fetching service details:', err);
      setError(err.message || 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = () => {
    if (!service) return;
    
    // In a real app, you would navigate to a booking form
    // For now, we'll just show an alert
    Alert.alert(
      'Book Service',
      `Would you like to book ${service.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Book Now',
          onPress: () => {
            // Navigate to booking form or show confirmation
            Alert.alert('Booking Initiated', 'Your service booking is being processed.');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0891b2" />
          <Text style={styles.loadingText}>Loading service details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error || 'Service not found'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonAlt}>
            <Text style={styles.backButtonAltText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2940&auto=format&fit=crop';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>

        {/* Service Image */}
        <Image
          source={{ uri: service.image_url || defaultImage }}
          style={styles.serviceImage}
          resizeMode="cover"
        />

        {/* Service Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{service.category}</Text>
          </View>
          
          <Text style={styles.serviceName}>{service.name}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
            </View>
            <Text style={styles.ratingText}>5.0 (18 reviews)</Text>
          </View>

          <View style={styles.infoContainer}>
            {service.duration && (
              <View style={styles.infoItem}>
                <Clock size={20} color="#64748b" />
                <Text style={styles.infoText}>{service.duration} minutes</Text>
              </View>
            )}
            
            {service.location && (
              <View style={styles.infoItem}>
                <MapPin size={20} color="#64748b" />
                <Text style={styles.infoText}>{service.location}</Text>
              </View>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>${service.price}</Text>
            <Text style={styles.priceSubtext}>per session</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>

          <TouchableOpacity style={styles.availabilityButton}>
            <Calendar size={20} color="#0891b2" />
            <Text style={styles.availabilityText}>Check Availability</Text>
            <ChevronRight size={20} color="#0891b2" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBookService}
        >
          <Text style={styles.bookButtonText}>Book Service</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceImage: {
    width: '100%',
    height: 300,
  },
  detailsContainer: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#64748b',
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1e293b',
  },
  priceContainer: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  priceSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#64748b',
  },
  availabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e0f2fe',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  availabilityText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#0891b2',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 16,
  },
  bookButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButtonAlt: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0891b2',
    borderRadius: 8,
  },
  backButtonAltText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
