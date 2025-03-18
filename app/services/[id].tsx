import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Star, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Service = Database['public']['Tables']['services']['Row'];

// Sample service data to use when database data is not available
const sampleServices = [
  {
    id: '1',
    name: 'Spa & Wellness',
    category: 'Wellness',
    description: 'Relax and rejuvenate with our premium spa services. Our expert therapists offer a range of treatments including massages, facials, body wraps, and more. Experience the ultimate relaxation in our tranquil spa environment designed to soothe your senses and restore your well-being.',
    price: 150,
    duration: 90,
    images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2940&auto=format&fit=crop'],
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Fine Dining',
    category: 'Dining',
    description: 'Experience exquisite cuisine at our restaurants. Our award-winning chefs create culinary masterpieces using the freshest local ingredients. Enjoy a memorable dining experience with stunning views and impeccable service in an elegant atmosphere.',
    price: 120,
    duration: 120,
    images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2940&auto=format&fit=crop'],
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Activities',
    category: 'Recreation',
    description: 'Discover exciting activities and experiences during your stay. From water sports and hiking to cultural tours and cooking classes, we offer a variety of activities to make your stay memorable. Our experienced guides ensure safe and enjoyable experiences for all skill levels.',
    price: 85,
    duration: 180,
    images: ['https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=2940&auto=format&fit=crop'],
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function ServiceScreen() {
  const { id } = useLocalSearchParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Booking form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('1');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from database
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setService(data);
      } else {
        // If not found in database, use sample data
        const sampleService = sampleServices.find(s => s.id === id);
        if (sampleService) {
          setService(sampleService as Service);
        } else {
          // If not found in sample data either, use the first sample service
          setService(sampleServices[0] as Service);
        }
      }
    } catch (err: any) {
      console.error('Error fetching service:', err);
      setError('Failed to load service details. Please try again later.');
      
      // Fallback to sample data
      const sampleService = sampleServices.find(s => s.id === id) || sampleServices[0];
      setService(sampleService as Service);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      // Validate inputs
      if (!date || !time || !guests) {
        Alert.alert('Missing Information', 'Please fill in all required fields');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('service_bookings')
        .insert({
          service_id: id,
          user_id: user.id,
          booking_date: date,
          booking_time: time,
          guest_count: parseInt(guests),
          notes,
          status: 'pending',
        });

      if (error) throw error;

      Alert.alert(
        'Booking Successful',
        'Your service has been booked successfully!',
        [{ text: 'View Bookings', onPress: () => router.push('/bookings') }]
      );
    } catch (err: any) {
      console.error('Booking error:', err);
      setError('Failed to complete booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading service details...</Text>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Service not found</Text>
        <TouchableOpacity
          style={styles.backButtonCentered}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>

        <Image
          source={{ uri: service.images?.[0] || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2940&auto=format&fit=crop' }}
          style={styles.heroImage}
        />

        <View style={styles.details}>
          <View style={styles.header}>
            <View>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceCategory}>{service.category}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#eab308" fill="#eab308" />
              <Text style={styles.rating}>4.8</Text>
            </View>
          </View>

          <View style={styles.serviceInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{service.duration} minutes</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>${service.price}</Text>
            </View>
          </View>

          <Text style={styles.description}>{service.description}</Text>

          <View style={styles.bookingForm}>
            <Text style={styles.sectionTitle}>Book This Service</Text>

            {error && (
              <Text style={styles.error}>{error}</Text>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Time <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Clock size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Number of Guests <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Users size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={guests}
                  onChangeText={setGuests}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Special Notes</Text>
              <TextInput
                style={styles.textArea}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                placeholder="Any special requests or notes?"
              />
            </View>

            <View style={styles.pricing}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>${service.price}</Text>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleBooking}>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingBottom: 24,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  backButtonCentered: {
    marginTop: 20,
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0891b2',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  details: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 16,
    color: '#64748b',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#92400e',
  },
  serviceInfo: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 24,
  },
  bookingForm: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  pricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  priceLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  bookButton: {
    backgroundColor: '#0891b2',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    marginTop: 24,
  },
});
