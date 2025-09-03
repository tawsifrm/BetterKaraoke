import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { mixAudioTracks, startRecording, stopRecording } from '@/utils/audioUtils';

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
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, [sound]);

  // Removed the separate promptForRecording function as it's now inline

  const startSongPlayback = async (song: Song, shouldRecord: boolean) => {
    try {
      setIsLoading(song.id);

      // Stop current audio if playing
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setCurrentlyPlaying(null);
      }

      // Start recording if requested
      let recordingUri: string | null = null;
      if (shouldRecord) {
        try {
          const newRecording = await startRecording();
          recordingRef.current = newRecording;
        } catch (err) {
          console.error('Failed to start recording', err);
          Alert.alert('Error', 'Could not start recording');
          setIsLoading(null);
          return;
        }
      }

      // Load and play new audio
      const { sound: newSound } = await Audio.Sound.createAsync(song.audioSource);
      
      setSound(newSound);
      setCurrentlyPlaying(song.id);
      
      // Set up playback status update
      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            // Stop recording if active
            if (recordingRef.current) {
              try {
                recordingUri = await stopRecording(recordingRef.current);
                
                if (recordingUri) {
                  // Mix the recording with the song
                  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
                  const outputFileName = `karaoke-${song.title.replace(/\s+/g, '-')}-${timestamp}`;
                  
                  await mixAudioTracks(
                    song.audioSource.uri || song.audioSource,
                    recordingUri,
                    outputFileName
                  );
                  
                  Alert.alert(
                    'Recording Saved',
                    'Your performance has been saved to your media library!',
                    [{ text: 'OK' }]
                  );
                }
              } catch (err) {
                console.error('Error processing recording', err);
                Alert.alert('Error', 'Could not save your recording');
              } finally {
                recordingRef.current = null;
              }
            }
            
            setCurrentlyPlaying(null);
            setSound(null);
          }
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
      
      // Clean up recording if there was an error
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } finally {
      setIsLoading(null);
    }
  };

  const playAudio = async (song: Song, shouldRecord: boolean) => {
    console.log('playAudio called with song:', song.title, 'shouldRecord:', shouldRecord);
    startSongPlayback(song, shouldRecord);
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setCurrentlyPlaying(null);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.primary + '08', colors.accent + '05', 'transparent']}
        style={styles.backgroundGradient}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={goBack}
          activeOpacity={0.8}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            Choose Your Song
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            {SONGS.length} songs available
          </ThemedText>
        </View>
        <TouchableOpacity 
          style={[styles.multiplayerButton, { backgroundColor: colors.accent }]}
          onPress={() => router.push('/multiplayer' as any)}
          activeOpacity={0.8}
        >
          <IconSymbol name="person.2.fill" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Songs List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SONGS.map((song, index) => {
          return (
            <View key={song.id} style={styles.songCardContainer}>
              <View
                style={[
                  styles.songCard,
                  { backgroundColor: colors.card },
                  currentlyPlaying === song.id && { borderColor: colors.primary, borderWidth: 2 }
                ]}
              >
                <View style={styles.songCardGradient}>
                  <View style={styles.songInfo}>
                    <View style={[styles.songNumber, { backgroundColor: colors.primary + '15' }]}>
                      <ThemedText style={[styles.numberText, { color: colors.primary }]}>
                        {String(index + 1).padStart(2, '0')}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.songDetails}>
                      <ThemedText style={[styles.songTitle, { color: colors.text }]}>
                        {song.title}
                      </ThemedText>
                      <ThemedText style={[styles.artistName, { color: colors.icon }]}>
                        {song.artist}
                      </ThemedText>
                    </View>

                    <TouchableOpacity 
                      style={styles.playButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        console.log('Play button pressed for:', song.title);
                        if (currentlyPlaying === song.id) {
                          console.log('Stopping audio from play button');
                          stopAudio();
                        } else {
                          console.log('Starting audio from play button');
                          Alert.alert(
                            'Karaoke Mode',
                            'Would you like to record your performance?',
                            [
                              {
                                text: 'Just Play',
                                onPress: () => {
                                  console.log('User chose: Just Play');
                                  playAudio(song, false);
                                },
                              },
                              {
                                text: 'Record & Play',
                                onPress: () => {
                                  console.log('User chose: Record & Play');
                                  playAudio(song, true);
                                },
                              },
                              {
                                text: 'Cancel',
                                style: 'cancel',
                                onPress: () => {
                                  console.log('User chose: Cancel');
                                },
                              },
                            ]
                          );
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      {isLoading === song.id ? (
                        <View style={[styles.loadingIndicator, { backgroundColor: colors.primary }]} />
                      ) : (
                        <IconSymbol 
                          name={currentlyPlaying === song.id ? "stop.fill" : "play.fill"} 
                          size={24} 
                          color={currentlyPlaying === song.id ? colors.primary : colors.icon}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Now Playing Bar */}
      {currentlyPlaying && (
        <View style={[styles.nowPlayingBar, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary, colors.accent]}
            style={styles.nowPlayingGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.nowPlayingContent}>
              <View style={styles.nowPlayingIcon}>
                <IconSymbol name="music.note" size={20} color="white" />
              </View>
              <View style={styles.nowPlayingTextContainer}>
                <ThemedText style={styles.nowPlayingText}>
                  Now Playing
                </ThemedText>
                <ThemedText style={styles.nowPlayingSong}>
                  {SONGS.find(s => s.id === currentlyPlaying)?.title}
                </ThemedText>
              </View>
              <TouchableOpacity onPress={stopAudio} style={styles.stopButton}>
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
  songCardContainer: {
    marginBottom: 12,
  },
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  multiplayerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
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
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  nowPlayingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowPlayingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nowPlayingSong: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
