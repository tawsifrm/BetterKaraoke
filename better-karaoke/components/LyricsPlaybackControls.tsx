import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getLyricsForSong, getCurrentLyric } from '@/utils/lyricParser';

const { width, height } = Dimensions.get('window');

interface LyricsPlaybackControlsProps {
  sound: Audio.Sound | null;
  currentSong: any;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (position: number) => void;
  onClose: () => void;
}

export function LyricsPlaybackControls({
  sound,
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onClose,
}: LyricsPlaybackControlsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [currentLyric, setCurrentLyric] = useState('');
  const [nextLyric, setNextLyric] = useState('');
  const [lyricProgress, setLyricProgress] = useState(0);
  
  const lyricOpacity = useRef(new Animated.Value(1)).current;

  // Get lyrics for current song
  const lyrics = currentSong ? getLyricsForSong(currentSong.fileName) : null;

  useEffect(() => {
    if (!sound) return;

    const updateProgress = async () => {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const currentTime = status.positionMillis || 0;
          setPosition(currentTime);
          setDuration(status.durationMillis || 0);
          
          // Update lyrics
          if (lyrics) {
            const lyricInfo = getCurrentLyric(lyrics, currentTime);
            setCurrentLyric(lyricInfo.current);
            setNextLyric(lyricInfo.next);
            setLyricProgress(lyricInfo.progress);
            

            
            // Animate lyric transition
            if (lyricInfo.progress > 0.8) {
              Animated.timing(lyricOpacity, {
                toValue: 0.3,
                duration: 200,
                useNativeDriver: true,
              }).start();
            } else {
              Animated.timing(lyricOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }).start();
            }
          }
        }
      } catch (error) {
        console.error('Error getting playback status:', error);
      }
    };

    const interval = setInterval(updateProgress, 100); // Update more frequently for smooth lyrics
    return () => clearInterval(interval);
  }, [sound, lyrics, lyricOpacity]);

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = async (seekPosition: number) => {
    if (!sound) return;
    
    try {
      setIsSeeking(true);
      await sound.setPositionAsync(seekPosition);
      setPosition(seekPosition);
    } catch (error) {
      console.error('Error seeking:', error);
      Alert.alert('Error', 'Unable to seek to this position');
    } finally {
      setIsSeeking(false);
    }
  };

  const seekToPercentage = (percentage: number) => {
    const newPosition = (duration * percentage) / 100;
    handleSeek(newPosition);
  };

  if (!currentSong) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '08', colors.background]}
          style={styles.gradient}
        >

            <View style={styles.expandedView}>
              {/* Song Info */}
              <View style={styles.songInfo}>
                <View style={styles.songText}>
                  <ThemedText style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
                    {currentSong.title}
                  </ThemedText>
                  <ThemedText style={[styles.artistName, { color: colors.icon }]} numberOfLines={1}>
                    {currentSong.artist}
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <IconSymbol name="xmark" size={20} color={colors.icon} />
                </TouchableOpacity>
              </View>

              {/* Lyrics Display */}
              {lyrics && (
                <View style={styles.lyricsContainer}>
                  <Animated.View style={[styles.currentLyricContainer, { opacity: lyricOpacity }]}>
                    <ThemedText style={[styles.currentLyric, { color: colors.text }]}>
                      {currentLyric || "🎤 Ready to sing?"}
                    </ThemedText>
                  </Animated.View>
                  
                  {nextLyric && (
                    <View style={styles.nextLyricContainer}>
                      <ThemedText style={[styles.nextLyric, { color: colors.icon }]}>
                        {nextLyric}
                      </ThemedText>
                    </View>
                  )}
                  
                  {/* Lyric Progress Bar */}
                  <View style={[styles.lyricProgressBar, { backgroundColor: colors.surface }]}>
                    <View 
                      style={[
                        styles.lyricProgressFill, 
                        { 
                          backgroundColor: colors.primary,
                          width: `${lyricProgress * 100}%`
                        }
                      ]} 
                    />
                  </View>
                </View>
              )}



              {/* Bottom Controls Section */}
              <View style={styles.bottomControls}>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          backgroundColor: colors.primary,
                          width: `${duration > 0 ? (position / duration) * 100 : 0}%`
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.timeContainer}>
                    <ThemedText style={[styles.timeText, { color: colors.icon }]}>
                      {formatTime(position)}
                    </ThemedText>
                    <ThemedText style={[styles.timeText, { color: colors.icon }]}>
                      {formatTime(duration)}
                    </ThemedText>
                  </View>
                </View>

                {/* Main Controls */}
                <View style={styles.controlsContainer}>
                  <TouchableOpacity 
                    onPress={onPrevious}
                    style={[styles.controlButton, styles.secondaryButton]}
                    disabled={isSeeking}
                  >
                    <IconSymbol name="backward.fill" size={24} color={colors.icon} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={onPlayPause}
                    style={[styles.controlButton, styles.playButton, { backgroundColor: colors.primary }]}
                    disabled={isSeeking}
                  >
                    <IconSymbol 
                      name={isPlaying ? "pause.fill" : "play.fill"} 
                      size={32} 
                      color="white" 
                    />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={onNext}
                    style={[styles.controlButton, styles.secondaryButton]}
                    disabled={isSeeking}
                  >
                    <IconSymbol name="forward.fill" size={24} color={colors.icon} />
                  </TouchableOpacity>
                </View>

                {/* Seek Controls */}
                <View style={styles.seekContainer}>
                  <TouchableOpacity 
                    onPress={() => seekToPercentage(Math.max(0, (position / duration) * 100 - 10))}
                    style={styles.seekButton}
                    disabled={isSeeking}
                  >
                    <IconSymbol name="gobackward.10" size={20} color={colors.icon} />
                    <ThemedText style={[styles.seekText, { color: colors.icon }]}>10</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => seekToPercentage(Math.min(100, (position / duration) * 100 + 10))}
                    style={styles.seekButton}
                    disabled={isSeeking}
                  >
                    <ThemedText style={[styles.seekText, { color: colors.icon }]}>10</ThemedText>
                    <IconSymbol name="goforward.10" size={20} color={colors.icon} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        </LinearGradient>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      web: {
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  gradient: {
    flex: 1,
    padding: 40,
    paddingTop: 60,
  },

  expandedView: {
    flex: 1,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  songText: {
    flex: 1,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
  },
  lyricsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  currentLyricContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  currentLyric: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    paddingHorizontal: 20,
  },
  nextLyricContainer: {
    marginBottom: 20,
  },
  nextLyric: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: 24,
  },
  lyricProgressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 20,
    width: '80%',
  },
  lyricProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginHorizontal: 30,
    elevation: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  seekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  seekText: {
    fontSize: 12,
    marginHorizontal: 4,
  },
}); 