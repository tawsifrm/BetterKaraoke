import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Song {
  id: string;
  title: string;
  artist: string;
  fileName: string;
  duration?: string;
  audioSource: any;
}

// Audio file mappings
const audioAssets = {
  'Bruno Mars - Uptown Funk.mp3': require('@/assets/audio/Bruno Mars - Uptown Funk.mp3'),
  'Drake - One Dance.mp3': require('@/assets/audio/Drake - One Dance.mp3'),
  'Ed Sheeran - Perfect.mp3': require('@/assets/audio/Ed Sheeran - Perfect.mp3'),
  'Justin Bieber - Baby.mp3': require('@/assets/audio/Justin Bieber - Baby.mp3'),
  'Mariah Carey  - All I Want for Christmas is You.mp3': require('@/assets/audio/Mariah Carey  - All I Want for Christmas is You.mp3'),
  'Michael Jackson - Billie Jean.mp3': require('@/assets/audio/Michael Jackson - Billie Jean.mp3'),
  'The Weeknd - Die for You.mp3': require('@/assets/audio/The Weeknd - Die for You.mp3'),
  'TRAVIS SCOTT - SICKO MODE (INSTRUMENTAL).mp3': require('@/assets/audio/TRAVIS SCOTT - SICKO MODE (INSTRUMENTAL).mp3'),
};

const SONGS: Song[] = [
  {
    id: '1',
    title: 'Uptown Funk',
    artist: 'Bruno Mars',
    fileName: 'Bruno Mars - Uptown Funk.mp3',
    duration: '4:30',
    audioSource: audioAssets['Bruno Mars - Uptown Funk.mp3'],
  },
  {
    id: '2',
    title: 'One Dance',
    artist: 'Drake',
    fileName: 'Drake - One Dance.mp3',
    duration: '2:54',
    audioSource: audioAssets['Drake - One Dance.mp3'],
  },
  {
    id: '3',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    fileName: 'Ed Sheeran - Perfect.mp3',
    duration: '4:23',
    audioSource: audioAssets['Ed Sheeran - Perfect.mp3'],
  },
  {
    id: '4',
    title: 'Baby',
    artist: 'Justin Bieber',
    fileName: 'Justin Bieber - Baby.mp3',
    duration: '3:36',
    audioSource: audioAssets['Justin Bieber - Baby.mp3'],
  },
  {
    id: '5',
    title: 'All I Want for Christmas is You',
    artist: 'Mariah Carey',
    fileName: 'Mariah Carey  - All I Want for Christmas is You.mp3',
    duration: '4:01',
    audioSource: audioAssets['Mariah Carey  - All I Want for Christmas is You.mp3'],
  },
  {
    id: '6',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    fileName: 'Michael Jackson - Billie Jean.mp3',
    duration: '4:54',
    audioSource: audioAssets['Michael Jackson - Billie Jean.mp3'],
  },
  {
    id: '7',
    title: 'Die for You',
    artist: 'The Weeknd',
    fileName: 'The Weeknd - Die for You.mp3',
    duration: '4:20',
    audioSource: audioAssets['The Weeknd - Die for You.mp3'],
  },
  {
    id: '8',
    title: 'SICKO MODE (Instrumental)',
    artist: 'Travis Scott',
    fileName: 'TRAVIS SCOTT - SICKO MODE (INSTRUMENTAL).mp3',
    duration: '5:13',
    audioSource: audioAssets['TRAVIS SCOTT - SICKO MODE (INSTRUMENTAL).mp3'],
  },
];

export default function SongsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playAudio = async (song: Song) => {
    try {
      setIsLoading(song.id);

      // Stop current audio if playing
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setCurrentlyPlaying(null);
      }

      // Load and play new audio
      const { sound: newSound } = await Audio.Sound.createAsync(song.audioSource);
      
      setSound(newSound);
      setCurrentlyPlaying(song.id);
      
      // Set up playback status update
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setCurrentlyPlaying(null);
          setSound(null);
        }
      });

      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert(
        'Playback Error',
        'Unable to play this song. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(null);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setCurrentlyPlaying(null);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            🎵 Song Library
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            {SONGS.length} songs available • Tap to play
          </ThemedText>
        </View>
      </View>

      {/* Songs List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SONGS.map((song, index) => (
          <TouchableOpacity
            key={song.id}
            style={[
              styles.songCard,
              { backgroundColor: colors.card },
              currentlyPlaying === song.id && { borderColor: colors.primary, borderWidth: 2 }
            ]}
            onPress={() => currentlyPlaying === song.id ? stopAudio() : playAudio(song)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={currentlyPlaying === song.id 
                ? [colors.primary + '20', colors.accent + '10'] 
                : ['transparent', 'transparent']
              }
              style={styles.songCardGradient}
            >
              <View style={styles.songInfo}>
                <View style={styles.songNumber}>
                  <ThemedText style={[styles.numberText, { color: colors.primary }]}>
                    {String(index + 1).padStart(2, '0')}
                  </ThemedText>
                </View>
                
                <View style={styles.songDetails}>
                  <ThemedText style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
                    {song.title}
                  </ThemedText>
                  <View style={styles.songMeta}>
                    <ThemedText style={[styles.artistName, { color: colors.icon }]} numberOfLines={1}>
                      {song.artist}
                    </ThemedText>
                    {song.duration && (
                      <>
                        <View style={[styles.dot, { backgroundColor: colors.icon }]} />
                        <ThemedText style={[styles.duration, { color: colors.icon }]}>
                          {song.duration}
                        </ThemedText>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.playButton}>
                  {isLoading === song.id ? (
                    <View style={[styles.loadingIndicator, { backgroundColor: colors.primary }]} />
                  ) : (
                    <IconSymbol 
                      name={currentlyPlaying === song.id ? "pause.fill" : "play.fill"} 
                      size={24} 
                      color={currentlyPlaying === song.id ? colors.primary : colors.icon}
                    />
                  )}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Now Playing Bar */}
      {currentlyPlaying && (
        <View style={[styles.nowPlayingBar, { backgroundColor: colors.primary }]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.nowPlayingGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.nowPlayingContent}>
              <IconSymbol name="music.note" size={20} color="white" />
              <ThemedText style={styles.nowPlayingText}>
                Now Playing: {SONGS.find(s => s.id === currentlyPlaying)?.title}
              </ThemedText>
              <TouchableOpacity onPress={stopAudio}>
                <IconSymbol name="xmark" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100, // Extra space for now playing bar
  },
  songCard: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  songCardGradient: {
    padding: 16,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistName: {
    fontSize: 14,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 8,
  },
  duration: {
    fontSize: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.6,
  },
  nowPlayingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  nowPlayingGradient: {
    flex: 1,
    justifyContent: 'center',
  },
  nowPlayingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  nowPlayingText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
});
