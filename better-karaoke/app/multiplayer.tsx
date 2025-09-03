import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MultiplayerRoom } from '@/components/MultiplayerRoom';
import { MultiplayerVersusGame } from '@/components/MultiplayerVersusGame';
import { GameResults } from '@/components/GameResults';

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

type MultiplayerState = 'lobby' | 'game' | 'results';

export default function MultiplayerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [multiplayerState, setMultiplayerState] = useState<MultiplayerState>('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [gameResults, setGameResults] = useState<Player[]>([]);

  // Generate room code on mount
  useEffect(() => {
    generateRoomCode();
    generatePlayerName();
  }, []);

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomCode(result);
  };

  const generatePlayerName = () => {
    const names = ['Rock Star', 'Voice Master', 'Karaoke King', 'Melody Maker', 'Harmony Hero'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    setPlayerName(randomName);
  };

  const createRoom = () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsHost(true);
    const newPlayer: Player = {
      id: '1',
      name: playerName,
      isReady: true,
      isHost: true,
      score: 0,
      currentLyric: '',
      isSinging: false,
      pitchAccuracy: 85,
      timingAccuracy: 80,
    };

    setPlayers([newPlayer]);
    setMultiplayerState('lobby');
  };

  const joinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      Alert.alert('Error', 'Please enter both your name and room code');
      return;
    }

    setIsHost(false);
    const newPlayer: Player = {
      id: '2',
      name: playerName,
      isReady: true,
      isHost: false,
      score: 0,
      currentLyric: '',
      isSinging: false,
      pitchAccuracy: 78,
      timingAccuracy: 82,
    };

    // Simulate joining an existing room
    const existingPlayers: Player[] = [
      {
        id: '1',
        name: 'Room Host',
        isReady: true,
        isHost: true,
        score: 0,
        currentLyric: '',
        isSinging: false,
        pitchAccuracy: 85,
        timingAccuracy: 80,
      }
    ];

    setPlayers([...existingPlayers, newPlayer]);
    setMultiplayerState('lobby');
  };

  const startGame = () => {
    // For demo purposes, use a sample song
    const sampleSong: Song = {
      id: '1',
      title: 'Uptown Funk',
      artist: 'Bruno Mars',
      fileName: 'Bruno Mars - Uptown Funk.mp3',
      duration: '4:30',
      audioSource: require('@/assets/audio/Bruno Mars - Uptown Funk.mp3'),
    };

    setCurrentSong(sampleSong);
    setMultiplayerState('game');
  };

  const handleGameEnd = (results: Player[]) => {
    setGameResults(results);
    setMultiplayerState('results');
  };

  const handleBackToLobby = () => {
    setMultiplayerState('lobby');
    setCurrentSong(null);
    setGameResults([]);
  };

  const handleBackToSongs = () => {
    router.back();
  };

  const handlePlayAgain = () => {
    setMultiplayerState('game');
    setGameResults([]);
  };

  if (multiplayerState === 'lobby') {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={[colors.primary + '08', colors.accent + '05', 'transparent']}
          style={styles.backgroundGradient}
        />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            Multiplayer
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Player Setup */}
        <View style={styles.setupSection}>
          <View style={[styles.inputCard, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
              Your Name
            </ThemedText>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.primary + '30'
              }]}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Enter your name"
              placeholderTextColor={colors.icon}
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={createRoom}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.buttonGradient}
              >
                <IconSymbol name="plus.circle.fill" size={24} color="white" />
                <ThemedText style={styles.primaryButtonText}>
                  Create Room
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.icon }]} />
              <ThemedText style={[styles.dividerText, { color: colors.icon }]}>
                or
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: colors.icon }]} />
            </View>

            <View style={styles.joinSection}>
              <View style={[styles.inputCard, { backgroundColor: colors.card }]}>
                <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                  Room Code
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.primary + '30'
                  }]}
                  value={roomCode}
                  onChangeText={setRoomCode}
                  placeholder="Enter room code"
                  placeholderTextColor={colors.icon}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton, { backgroundColor: colors.accent }]}
                onPress={joinRoom}
              >
                <LinearGradient
                  colors={[colors.accent, colors.secondary]}
                  style={styles.buttonGradient}
                >
                  <IconSymbol name="person.2.fill" size={24} color="white" />
                  <ThemedText style={styles.secondaryButtonText}>
                    Join Room
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresSection}>
          <ThemedText style={[styles.featuresTitle, { color: colors.text }]}>
            Versus Mode Features
          </ThemedText>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol name="person.2.fill" size={20} color={colors.primary} />
              <ThemedText style={[styles.featureText, { color: colors.text }]}>
                Up to 4 players compete simultaneously
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="music.note" size={20} color={colors.primary} />
              <ThemedText style={[styles.featureText, { color: colors.text }]}>
                Real-time pitch and timing analysis
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="chart.bar.fill" size={20} color={colors.primary} />
              <ThemedText style={[styles.featureText, { color: colors.text }]}>
                Live scoring and performance tracking
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="trophy.fill" size={20} color={colors.primary} />
              <ThemedText style={[styles.featureText, { color: colors.text }]}>
                Competitive rankings and results
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Room Display */}
        {players.length > 0 && (
          <MultiplayerRoom
            roomCode={roomCode}
            players={players}
            onStartGame={startGame}
            onLeaveRoom={() => {
              setPlayers([]);
              setMultiplayerState('lobby');
            }}
            isHost={isHost}
          />
        )}
      </ThemedView>
    );
  }

  if (multiplayerState === 'game' && currentSong) {
    return (
      <MultiplayerVersusGame
        song={currentSong}
        players={players}
        onGameEnd={handleGameEnd}
        onBackToLobby={handleBackToLobby}
      />
    );
  }

  if (multiplayerState === 'results' && gameResults.length > 0) {
    return (
      <GameResults
        results={gameResults}
        songTitle={currentSong?.title || ''}
        onPlayAgain={handlePlayAgain}
        onBackToLobby={handleBackToLobby}
        onBackToSongs={handleBackToSongs}
      />
    );
  }

  return null;
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 44,
  },
  setupSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  actionButtons: {
    gap: 20,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButton: {
    height: 56,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  joinSection: {
    gap: 16,
  },
  secondaryButton: {
    height: 56,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
});
