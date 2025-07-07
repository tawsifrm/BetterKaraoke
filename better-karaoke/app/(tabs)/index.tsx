import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const navigateToSongs = () => {
    router.push('/(tabs)/explore');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
          🎤 Better Karaoke
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.text }]}>
          Sing your heart out with style
        </ThemedText>
      </View>

      {/* Main Action Button */}
      <TouchableOpacity 
        style={[styles.mainButton, { backgroundColor: colors.primary }]}
        onPress={navigateToSongs}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconSymbol name="music.note" size={40} color="white" />
          <ThemedText style={styles.buttonText}>Start Singing</ThemedText>
          <ThemedText style={styles.buttonSubtext}>Choose your song</ThemedText>
        </LinearGradient>
      </TouchableOpacity>

      {/* Feature Cards */}
      <View style={styles.featuresContainer}>
        <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
          <IconSymbol name="waveform" size={24} color={colors.primary} />
          <ThemedText style={[styles.featureTitle, { color: colors.text }]}>
            Real-time Scoring
          </ThemedText>
          <ThemedText style={[styles.featureDesc, { color: colors.icon }]}>
            Get instant feedback on your performance
          </ThemedText>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
          <IconSymbol name="text.alignleft" size={24} color={colors.primary} />
          <ThemedText style={[styles.featureTitle, { color: colors.text }]}>
            Synced Lyrics
          </ThemedText>
          <ThemedText style={[styles.featureDesc, { color: colors.icon }]}>
            Follow along with perfectly timed lyrics
          </ThemedText>
        </View>
      </View>

      {/* Stats Section */}
      <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: colors.primary }]}>8</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.icon }]}>Songs Available</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: colors.primary }]}>∞</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.icon }]}>Fun Guaranteed</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  mainButton: {
    borderRadius: 20,
    marginBottom: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  buttonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 15,
  },
  featureCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 'auto',
    marginBottom: 40,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(8, 145, 178, 0.2)',
    marginHorizontal: 20,
  },
});
