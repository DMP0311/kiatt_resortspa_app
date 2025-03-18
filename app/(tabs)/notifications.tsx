import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Bell, CheckCircle, Clock, AlertTriangle, Info, MessageSquare } from 'lucide-react-native';

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'promotion' | 'system' | 'message';
  is_read: boolean;
  created_at: string;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      setUserId(user.id);
    } catch (err) {
      console.error('Error checking user:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // This is a mock implementation since we don't have a notifications table yet
      // In a real app, you would fetch from a notifications table
      const mockNotifications: Notification[] = [
        {
          id: '1',
          user_id: userId,
          title: 'Booking Confirmed',
          message: 'Your booking for Deluxe Room has been confirmed for May 15-18, 2023.',
          type: 'booking',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        },
        {
          id: '2',
          user_id: userId,
          title: 'Special Offer',
          message: 'Enjoy 20% off on all spa services this weekend!',
          type: 'promotion',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          user_id: userId,
          title: 'System Maintenance',
          message: 'Our app will be under maintenance on June 1st from 2-4 AM.',
          type: 'system',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
        {
          id: '4',
          user_id: userId,
          title: 'New Message',
          message: 'You have a new message from the hotel concierge.',
          type: 'message',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, is_read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, is_read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <CheckCircle size={24} color="#16a34a" />;
      case 'promotion':
        return <Bell size={24} color="#f59e0b" />;
      case 'system':
        return <AlertTriangle size={24} color="#ef4444" />;
      case 'message':
        return <MessageSquare size={24} color="#0891b2" />;
      default:
        return <Info size={24} color="#64748b" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0891b2" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length > 0 ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.is_read && styles.unreadCard
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationIconContainer}>
                {getNotificationIcon(notification.type)}
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationTime}>
                    {formatTimeAgo(notification.created_at)}
                  </Text>
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
              </View>
              {!notification.is_read && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Bell size={48} color="#cbd5e1" />
          <Text style={styles.emptyStateTitle}>No notifications</Text>
          <Text style={styles.emptyStateText}>
            You don't have any notifications at the moment
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e0f2fe',
    borderRadius: 16,
  },
  markAllText: {
    color: '#0891b2',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  unreadCard: {
    backgroundColor: '#f0f9ff',
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0891b2',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
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
