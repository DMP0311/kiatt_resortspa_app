import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { MapPin } from 'lucide-react-native';

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  location?: string;
};

type Category = {
  name: string;
  icon: React.ReactNode;
};

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      setServices(data || []);
      
      // Extract unique categories
      if (data) {
        const uniqueCategories = Array.from(new Set(data.map(service => service.category)));
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = selectedCategory 
    ? services.filter(service => service.category === selectedCategory)
    : services;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0891b2" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.subtitle}>Explore our premium services</Text>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === null && styles.selectedCategoryButton
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === null && styles.selectedCategoryButtonText
          ]}>All</Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.selectedCategoryButtonText
            ]}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Services List */}
      <ScrollView style={styles.servicesContainer} contentContainerStyle={styles.servicesContent}>
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <Link key={service.id} href={`/service/${service.id}`} asChild>
              <TouchableOpacity style={styles.serviceCard}>
                <Image
                  source={{ 
                    uri: service.image_url || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2940&auto=format&fit=crop' 
                  }}
                  style={styles.serviceImage}
                />
                <View style={styles.serviceContent}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{service.category}</Text>
                  </View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription} numberOfLines={2}>
                    {service.description}
                  </Text>
                  <View style={styles.serviceFooter}>
                    <Text style={styles.servicePrice}>${service.price}</Text>
                    {service.location && (
                      <View style={styles.locationContainer}>
                        <MapPin size={14} color="#64748b" />
                        <Text style={styles.locationText}>{service.location}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No services found</Text>
            <Text style={styles.emptyStateText}>
              {selectedCategory 
                ? `No services available in the ${selectedCategory} category` 
                : 'No services available at the moment'}
            </Text>
            {selectedCategory && (
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.resetButtonText}>Show all services</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  categoriesContainer: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#0891b2',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  selectedCategoryButtonText: {
    color: '#ffffff',
  },
  servicesContainer: {
    flex: 1,
  },
  servicesContent: {
    padding: 16,
    paddingTop: 0,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceImage: {
    width: '100%',
    height: 180,
  },
  serviceContent: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#0891b2',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: '500',
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
