import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getLyricsForSong, getCurrentLyric } from '@/utils/lyricParser';
import { startRecording, stopRecording } from '@/utils/audioUtils';

const { width, height } = Dimensions.get('window');

interface Player {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
  avatar?: string;
  currentLyric: string;
  isSinging: boolean;
  pitchAccuracy: number;
  timingAccuracy: number;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  fileName: string;
  duration?: string;
  audioSource: any;
}

interface MultiplayerVersusGameProps {
  song: Song;
  players: Player[];
  onGameEnd: (results: Player[]) => void;
  onBackToLobby: () => void;
}

export function MultiplayerVersusGame({
  song,
  players,
  onGameEnd,
  onBackToLobby,
}: MultiplayerVersusGameProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [gameTime, setGameTime] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLyric, setCurrentLyric] = useState('');
  const [nextLyric, setNextLyric] = useState('');
  const [lyricProgress, setLyricProgress] = useState(0);
  const [gamePlayers, setGamePlayers] = useState<Player[]>(players);
  const [recordingRef] = useState(useRef<Audio.Recording | null>(null));
  
  const lyrics = getLyricsForSong(song.fileName);
  const countdownAnimation = useRef(new Animated.Value(1)).current;
  const gameProgressAnimation = useRef(new Animated.Value(0)).current;

  // Countdown timer
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        
        // Animate countdown
        Animated.sequence([
          Animated.timing(countdownAnimation, {
            toValue: 1.5,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(countdownAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      startGame();
    }
  }, [countdown, gameState]);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setGameTime(prev => prev + 100);
      }, 100);
      
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const startGame = async () => {
    try {
      setGameState('playing');
      
      // Start recording for all players
      const newRecording = await startRecording();
      recordingRef.current = newRecording;
      
      // Load and play song
      const { sound: newSound } = await Audio.Sound.createAsync(song.audioSource);
      setSound(newSound);
      
      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          
          if (status.didJustFinish) {
            endGame();
          } else if (status.isPlaying) {
            // Update lyrics
            if (lyrics) {
              const currentTime = status.positionMillis || 0;
              const lyricInfo = getCurrentLyric(lyrics, currentTime);
              setCurrentLyric(lyricInfo.current);
              setNextLyric(lyricInfo.next);
              setLyricProgress(lyricInfo.progress);
              
              // Update game progress animation
              Animated.timing(gameProgressAnimation, {
                toValue: (currentTime / (status.durationMillis || 1)) * 100,
                duration: 100,
                useNativeDriver: false,
              }).start();
            }
          }
        }
      });
      
      await newSound.playAsync();
      
      // Simulate real-time scoring updates
      startScoringSimulation();
      
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game');
    }
  };

  const startScoringSimulation = () => {
    const scoringInterval = setInterval(() => {
      setGamePlayers(prevPlayers => 
        prevPlayers.map(player => ({
          ...player,
          pitchAccuracy: Math.min(100, player.pitchAccuracy + (Math.random() - 0.5) * 10),
          timingAccuracy: Math.min(100, player.timingAccuracy + (Math.random() - 0.5) * 10),
          score: Math.floor(
            (player.pitchAccuracy * 0.6 + player.timingAccuracy * 0.4) * 0.1
          ),
        }))
      );
    }, 500);
    
    // Store interval reference for cleanup
    (window as any).scoringInterval = scoringInterval;
  };

  const endGame = async () => {
    try {
      setGameState('finished');
      
      // Stop recording
      if (recordingRef.current) {
        const recordingUri = await stopRecording(recordingRef.current);
        recordingRef.current = null;
      }
      
      // Stop audio
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      // Clear scoring simulation
      if ((window as any).scoringInterval) {
        clearInterval((window as any).scoringInterval);
      }
      
      // Sort players by score
      const sortedResults = [...gamePlayers].sort((a, b) => b.score - a.score);
      
      // Show results after a short delay
      setTimeout(() => {
        onGameEnd(sortedResults);
      }, 2000);
      
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (gameState === 'countdown') {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={[colors.primary + '20', colors.accent + '15', colors.background]}
          style={styles.backgroundGradient}
        />
        
        <View style={styles.countdownContainer}>
          <Animated.View style={[styles.countdownNumber, { transform: [{ scale: countdownAnimation }] }]}>
            <ThemedText style={[styles.countdownText, { color: colors.primary }]}>
              {countdown}
            </ThemedText>
          </Animated.View>
          <ThemedText style={[styles.countdownLabel, { color: colors.text }]}>
            Get Ready to Sing!
          </ThemedText>
          <ThemedText style={[styles.songTitle, { color: colors.icon }]}>
            {song.title} - {song.artist}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (gameState === 'finished') {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={[colors.primary + '20', colors.accent + '15', colors.background]}
          style={styles.backgroundGradient}
        />
        
        <View style={styles.finishedContainer}>
          <IconSymbol name="checkmark.circle.fill" size={80} color={colors.primary} />
          <ThemedText style={[styles.finishedTitle, { color: colors.text }]}>
            Game Complete!
          </ThemedText>
          <ThemedText style={[styles.finishedSubtitle, { color: colors.icon }]}>
            Calculating final scores...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[colors.primary + '08', colors.accent + '05', 'transparent']}
        style={styles.backgroundGradient}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToLobby} style={styles.backButton}>
          <IconSymbol name="xmark.circle.fill" size={24} color={colors.accent} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <ThemedText style={[styles.gameTitle, { color: colors.text }]}>
            Versus Mode
          </ThemedText>
          <ThemedText style={[styles.gameTime, { color: colors.icon }]}>
            {formatTime(gameTime)}
          </ThemedText>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Game Progress Bar */}
      <View style={styles.progressSection}>
        <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                width: gameProgressAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                })
              }
            ]} 
          />
        </View>
      </View>

      {/* Current Lyric Display */}
      <View style={styles.lyricsSection}>
        <ThemedText style={[styles.currentLyric, { color: colors.text }]}>
          {currentLyric || "🎤 Ready to sing?"}
        </ThemedText>
        {nextLyric && (
          <ThemedText style={[styles.nextLyric, { color: colors.icon }]}>
            {nextLyric}
          </ThemedText>
        )}
      </View>

      {/* Players Performance */}
      <ScrollView style={styles.playersSection} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Live Performance
        </ThemedText>
        
        {gamePlayers.map((player, index) => (
          <View key={player.id} style={[styles.playerCard, { backgroundColor: colors.card }]}>
            <View style={styles.playerHeader}>
              <View style={styles.playerRank}>
                <ThemedText style={[styles.rankText, { color: colors.primary }]}>
                  #{index + 1}
                </ThemedText>
              </View>
              <View style={styles.playerInfo}>
                <View style={[styles.playerAvatar, { backgroundColor: colors.primary + '20' }]}>
                  <ThemedText style={[styles.playerInitial, { color: colors.primary }]}>
                    {player.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <View style={styles.playerDetails}>
                  <ThemedText style={[styles.playerName, { color: colors.text }]}>
                    {player.name}
                  </ThemedText>
                  <View style={styles.accuracyContainer}>
                    <View style={styles.accuracyItem}>
                      <IconSymbol name="music.note" size={12} color={colors.primary} />
                      <ThemedText style={[styles.accuracyText, { color: colors.icon }]}>
                        {Math.round(player.pitchAccuracy)}%
                      </ThemedText>
                    </View>
                    <View style={styles.accuracyItem}>
                      <IconSymbol name="clock" size={12} color={colors.primary} />
                      <ThemedText style={[styles.accuracyText, { color: colors.icon }]}>
                        {Math.round(player.timingAccuracy)}%
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.scoreContainer}>
                <ThemedText style={[styles.scoreText, { color: colors.primary }]}>
                  {player.score}
                </ThemedText>
                <ThemedText style={[styles.scoreLabel, { color: colors.icon }]}>
                  pts
                </ThemedText>
              </View>
            </View>
            
            {/* Performance Bars */}
            <View style={styles.performanceBars}>
              <View style={styles.performanceBar}>
                <View style={styles.performanceLabel}>
                  <ThemedText style={[styles.performanceText, { color: colors.icon }]}>
                    Pitch
                  </ThemedText>
                </View>
                <View style={[styles.performanceBarBg, { backgroundColor: colors.surface }]}>
                  <View 
                    style={[
                      styles.performanceBarFill, 
                      { 
                        backgroundColor: colors.primary,
                        width: `${player.pitchAccuracy}%`
                      }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.performanceBar}>
                <View style={styles.performanceLabel}>
                  <ThemedText style={[styles.performanceText, { color: colors.icon }]}>
                    Timing
                  </ThemedText>
                </View>
                <View style={[styles.performanceBarBg, { backgroundColor: colors.surface }]}>
                  <View 
                    style={[
                      styles.performanceBarFill, 
                      { 
                        backgroundColor: colors.secondary,
                        width: `${player.timingAccuracy}%`
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  gameTime: {
    fontSize: 14,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  lyricsSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  currentLyric: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  nextLyric: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 24,
  },
  playersSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  playerCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerRank: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playerInitial: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accuracyContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  accuracyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accuracyText: {
    fontSize: 12,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
  },
  performanceBars: {
    gap: 12,
  },
  performanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceLabel: {
    width: 60,
  },
  performanceText: {
    fontSize: 12,
  },
  performanceBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  performanceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownNumber: {
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
  },
  countdownLabel: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  songTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  finishedSubtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
}); 