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
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width, height } = Dimensions.get('window');
const EXPANDED_HEIGHT = 280;
const COLLAPSED_HEIGHT = 80;
const SWIPE_THRESHOLD = 30;

interface SwipeablePlaybackControlsProps {
  sound: Audio.Sound | null;
  currentSong: any;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (position: number) => void;
  onClose: () => void;
}

export function SwipeablePlaybackControls({
  sound,
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onClose,
}: SwipeablePlaybackControlsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const translateY = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(EXPANDED_HEIGHT)).current;

  useEffect(() => {
    if (!sound) return;

    const updateProgress = async () => {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
        }
      } catch (error) {
        console.error('Error getting playback status:', error);
      }
    };

    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [sound]);

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

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;
      console.log('Gesture translationY:', translationY, 'isExpanded:', isExpanded);
      
      if (Math.abs(translationY) > SWIPE_THRESHOLD) {
        if (translationY > 0 && isExpanded) {
          // Swipe down - collapse
          console.log('Collapsing modal');
          setIsExpanded(false);
          Animated.parallel([
            Animated.timing(heightAnim, {
              toValue: COLLAPSED_HEIGHT,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }),
          ]).start();
        } else if (translationY < 0 && !isExpanded) {
          // Swipe up - expand
          console.log('Expanding modal');
          setIsExpanded(true);
          Animated.parallel([
            Animated.timing(heightAnim, {
              toValue: EXPANDED_HEIGHT,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }),
          ]).start();
        } else {
          // Reset position
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      } else {
        // Reset position if threshold not met
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  if (!currentSong) return null;

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View 
        style={[
          styles.container, 
          { 
            backgroundColor: colors.card,
            height: heightAnim,
            transform: [{ translateY }]
          }
        ]}
      >
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '05']}
          style={styles.gradient}
        >
          {/* Swipe Indicator */}
          <View style={styles.swipeIndicator}>
            <View style={[styles.indicator, { backgroundColor: colors.icon }]} />
          </View>

                  {/* Collapsed View */}
        {!isExpanded && (
          <TouchableOpacity 
            style={styles.collapsedView}
            onPress={() => {
              setIsExpanded(true);
              Animated.timing(heightAnim, {
                toValue: EXPANDED_HEIGHT,
                duration: 300,
                useNativeDriver: false,
              }).start();
            }}
            activeOpacity={0.8}
          >
              <View style={styles.collapsedSongInfo}>
                <ThemedText style={[styles.collapsedSongTitle, { color: colors.text }]} numberOfLines={1}>
                  {currentSong.title}
                </ThemedText>
                <ThemedText style={[styles.collapsedArtistName, { color: colors.icon }]} numberOfLines={1}>
                  {currentSong.artist}
                </ThemedText>
              </View>
              
              <View style={styles.collapsedControls}>
                <TouchableOpacity onPress={onPrevious} style={styles.collapsedButton}>
                  <IconSymbol name="backward.fill" size={20} color={colors.icon} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={onPlayPause}
                  style={[styles.collapsedPlayButton, { backgroundColor: colors.primary }]}
                >
                  <IconSymbol 
                    name={isPlaying ? "pause.fill" : "play.fill"} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>
                
                              <TouchableOpacity onPress={onNext} style={styles.collapsedButton}>
                <IconSymbol name="forward.fill" size={20} color={colors.icon} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

          {/* Expanded View */}
          {isExpanded && (
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
          )}
        </LinearGradient>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      web: {
        boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  gradient: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  swipeIndicator: {
    alignItems: 'center',
    marginBottom: 10,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  collapsedView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  collapsedSongInfo: {
    flex: 1,
    marginRight: 20,
  },
  collapsedSongTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  collapsedArtistName: {
    fontSize: 12,
  },
  collapsedControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  collapsedPlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    elevation: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      },
    }),
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