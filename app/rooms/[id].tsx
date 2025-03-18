// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useLocalSearchParams, router } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import {
//   ArrowLeft,
//   Star,
//   Users,
//   Wifi,
//   Coffee,
//   Tv,
//   Wind,
//   Utensils,
//   Calendar,
//   ChevronRight,
// } from 'lucide-react-native';

// type Room = {
//   id: string;
//   room_number: string;
//   room_type: string;
//   description: string;
//   capacity: number;
//   price_per_night: number;
//   amenities: any;
//   images: string[] | null;
//   is_available: boolean | null;
// };

// export default function RoomDetailScreen() {
//   const { id } = useLocalSearchParams();
//   const [room, setRoom] = useState<Room | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeImageIndex, setActiveImageIndex] = useState(0);

//   useEffect(() => {
//     fetchRoomDetails();
//   }, [id]);

//   const fetchRoomDetails = async () => {
//     try {
//       setLoading(true);

//       const { data, error } = await supabase
//         .from('rooms')
//         .select('*')
//         .eq('id', id)
//         .single();

//       if (error) throw error;

//       setRoom(data);
//     } catch (err: any) {
//       console.error('Error fetching room details:', err);
//       setError(err.message || 'Failed to load room details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBookNow = () => {
//     if (!room) return;

//     // In a real app, you would navigate to a booking form
//     // For now, we'll just show an alert
//     Alert.alert(
//       'Book Room',
//       `Would you like to book ${room.room_type} (Room ${room.room_number})?`,
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Book Now',
//           onPress: () => {
//             // Navigate to booking form or show confirmation
//             Alert.alert(
//               'Booking Initiated',
//               'Your booking is being processed.'
//             );
//           },
//         },
//       ]
//     );
//   };

//   const renderAmenityIcon = (amenity: string) => {
//     switch (amenity.toLowerCase()) {
//       case 'wifi':
//         return <Wifi size={20} color="#64748b" />;
//       case 'breakfast':
//         return <Coffee size={20} color="#64748b" />;
//       case 'tv':
//         return <Tv size={20} color="#64748b" />;
//       case 'air conditioning':
//         return <Wind size={20} color="#64748b" />;
//       case 'room service':
//         return <Utensils size={20} color="#64748b" />;
//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#0891b2" />
//           <Text style={styles.loadingText}>Loading room details...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !room) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backButton}
//           >
//             <ArrowLeft size={24} color="#1e293b" />
//           </TouchableOpacity>
//         </View>
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorTitle}>Error</Text>
//           <Text style={styles.errorMessage}>{error || 'Room not found'}</Text>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backButtonAlt}
//           >
//             <Text style={styles.backButtonAltText}>Go Back</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const defaultImage =
//     'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2940&auto=format&fit=crop';
//   const images =
//     room.images && room.images.length > 0 ? room.images : [defaultImage];

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//       >
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backButton}
//           >
//             <ArrowLeft size={24} color="#1e293b" />
//           </TouchableOpacity>
//         </View>

//         {/* Image Gallery */}
//         <View style={styles.imageGallery}>
//           <Image
//             source={{ uri: images[activeImageIndex] }}
//             style={styles.mainImage}
//             resizeMode="cover"
//           />

//           {images.length > 1 && (
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={styles.thumbnailContainer}
//               contentContainerStyle={styles.thumbnailContent}
//             >
//               {images.map((image, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   onPress={() => setActiveImageIndex(index)}
//                   style={[
//                     styles.thumbnailButton,
//                     activeImageIndex === index && styles.activeThumbnail,
//                   ]}
//                 >
//                   <Image
//                     source={{ uri: image }}
//                     style={styles.thumbnail}
//                     resizeMode="cover"
//                   />
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           )}
//         </View>

//         {/* Room Details */}
//         <View style={styles.detailsContainer}>
//           <View style={styles.roomHeader}>
//             <View>
//               <Text style={styles.roomType}>{room.room_type}</Text>
//               <Text style={styles.roomNumber}>Room {room.room_number}</Text>
//             </View>
//             <View style={styles.priceContainer}>
//               <Text style={styles.price}>${room.price_per_night}</Text>
//               <Text style={styles.priceSubtext}>per night</Text>
//             </View>
//           </View>

//           <View style={styles.ratingContainer}>
//             <View style={styles.stars}>
//               <Star size={16} color="#f59e0b" fill="#f59e0b" />
//               <Star size={16} color="#f59e0b" fill="#f59e0b" />
//               <Star size={16} color="#f59e0b" fill="#f59e0b" />
//               <Star size={16} color="#f59e0b" fill="#f59e0b" />
//               <Star size={16} color="#f59e0b" fill="#f59e0b" />
//             </View>
//             <Text style={styles.ratingText}>5.0 (24 reviews)</Text>
//           </View>

//           <View style={styles.capacityContainer}>
//             <Users size={20} color="#64748b" />
//             <Text style={styles.capacityText}>
//               {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'} max
//             </Text>
//           </View>

//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Description</Text>
//             <Text style={styles.description}>{room.description}</Text>
//           </View>

//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Amenities</Text>
//             <View style={styles.amenitiesContainer}>
//               {room.amenities && Array.isArray(room.amenities) ? (
//                 room.amenities.map((amenity: string, index: number) => (
//                   <View key={index} style={styles.amenityItem}>
//                     {renderAmenityIcon(amenity)}
//                     <Text style={styles.amenityText}>{amenity}</Text>
//                   </View>
//                 ))
//               ) : (
//                 <Text style={styles.noAmenitiesText}>No amenities listed</Text>
//               )}
//             </View>
//           </View>

//           <TouchableOpacity style={styles.availabilityButton}>
//             <Calendar size={20} color="#0891b2" />
//             <Text style={styles.availabilityText}>Check Availability</Text>
//             <ChevronRight size={20} color="#0891b2" />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={[
//             styles.bookButton,
//             !room.is_available && styles.disabledButton,
//           ]}
//           onPress={handleBookNow}
//           disabled={!room.is_available}
//         >
//           <Text style={styles.bookButtonText}>
//             {room.is_available ? 'Book Now' : 'Not Available'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 80,
//   },
//   header: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//     padding: 16,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   imageGallery: {
//     width: '100%',
//   },
//   mainImage: {
//     width: '100%',
//     height: 300,
//   },
//   thumbnailContainer: {
//     marginTop: 8,
//     maxHeight: 70,
//   },
//   thumbnailContent: {
//     paddingHorizontal: 16,
//   },
//   thumbnailButton: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: 8,
//     borderWidth: 2,
//     borderColor: 'transparent',
//     overflow: 'hidden',
//   },
//   activeThumbnail: {
//     borderColor: '#0891b2',
//   },
//   thumbnail: {
//     width: '100%',
//     height: '100%',
//   },
//   detailsContainer: {
//     padding: 16,
//   },
//   roomHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   roomType: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1e293b',
//   },
//   roomNumber: {
//     fontSize: 16,
//     color: '#64748b',
//   },
//   priceContainer: {
//     alignItems: 'flex-end',
//   },
//   price: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#0891b2',
//   },
//   priceSubtext: {
//     fontSize: 14,
//     color: '#64748b',
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   stars: {
//     flexDirection: 'row',
//     marginRight: 8,
//   },
//   ratingText: {
//     fontSize: 14,
//     color: '#64748b',
//   },
//   capacityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f1f5f9',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   capacityText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: '#1e293b',
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1e293b',
//     marginBottom: 8,
//   },
//   description: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#64748b',
//   },
//   amenitiesContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   amenityItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8fafc',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   amenityText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: '#1e293b',
//   },
//   noAmenitiesText: {
//     fontSize: 14,
//     color: '#94a3b8',
//     fontStyle: 'italic',
//   },
//   availabilityButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#e0f2fe',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//   },
//   availabilityText: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#0891b2',
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#ffffff',
//     borderTopWidth: 1,
//     borderTopColor: '#e2e8f0',
//     padding: 16,
//   },
//   bookButton: {
//     backgroundColor: '#0891b2',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   disabledButton: {
//     backgroundColor: '#cbd5e1',
//   },
//   bookButtonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 16,
//     color: '#64748b',
//     fontSize: 16,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
//   errorTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#ef4444',
//     marginBottom: 8,
//   },
//   errorMessage: {
//     fontSize: 16,
//     color: '#64748b',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   backButtonAlt: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     backgroundColor: '#0891b2',
//     borderRadius: 8,
//   },
//   backButtonAltText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });
