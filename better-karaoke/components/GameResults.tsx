import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

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

interface GameResultsProps {
  results: Player[];
  songTitle: string;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onBackToSongs: () => void;
}

export function GameResults({
  results,
  songTitle,
  onPlayAgain,
  onBackToLobby,
  onBackToSongs,
}: GameResultsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const winner = results[0];
  const isTie = results.length > 1 && results[0].score === results[1].score;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return 'crown.fill';
      case 2:
        return 'medal.fill';
      case 3:
        return 'trophy.fill';
      default:
        return 'star.fill';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return colors.primary;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[colors.primary + '15', colors.accent + '10', colors.background]}
        style={styles.backgroundGradient}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Game Results
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
          {songTitle}
        </ThemedText>
      </View>

      {/* Winner Section */}
      <View style={[styles.winnerSection, { backgroundColor: colors.card }]}>
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FF8C00']}
          style={styles.winnerGradient}
        >
          <View style={styles.winnerContent}>
            <View style={styles.winnerIcon}>
              <IconSymbol name="crown.fill" size={40} color="white" />
            </View>
            <ThemedText style={styles.winnerTitle}>
              {isTie ? "It's a Tie!" : "Winner!"}
            </ThemedText>
            {!isTie && (
              <ThemedText style={styles.winnerName}>
                {winner.name}
              </ThemedText>
            )}
            <ThemedText style={styles.winnerScore}>
              {winner.score} points
            </ThemedText>
          </View>
        </LinearGradient>
      </View>

      {/* Results List */}
      <ScrollView style={styles.resultsSection} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Final Rankings
        </ThemedText>
        
        {results.map((player, index) => (
          <View key={player.id} style={[styles.resultCard, { backgroundColor: colors.card }]}>
            <View style={styles.rankSection}>
              <View style={[styles.rankBadge, { backgroundColor: getRankColor(index + 1) }]}>
                <IconSymbol name={getRankIcon(index + 1)} size={20} color="white" />
              </View>
              <ThemedText style={[styles.rankText, { color: colors.text }]}>
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
                <View style={styles.performanceStats}>
                  <View style={styles.statItem}>
                    <IconSymbol name="music.note" size={12} color={colors.primary} />
                    <ThemedText style={[styles.statText, { color: colors.icon }]}>
                      Pitch: {Math.round(player.pitchAccuracy)}%
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <IconSymbol name="clock" size={12} color={colors.primary} />
                    <ThemedText style={[styles.statText, { color: colors.icon }]}>
                      Timing: {Math.round(player.timingAccuracy)}%
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.scoreSection}>
              <ThemedText style={[styles.finalScore, { color: colors.primary }]}>
                {player.score}
              </ThemedText>
              <ThemedText style={[styles.scoreLabel, { color: colors.icon }]}>
                pts
              </ThemedText>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={onPlayAgain}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.buttonGradient}
          >
            <IconSymbol name="arrow.clockwise" size={20} color="white" />
            <ThemedText style={styles.primaryButtonText}>
              Play Again
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { backgroundColor: colors.surface }]}
            onPress={onBackToLobby}
          >
            <IconSymbol name="person.2.fill" size={20} color={colors.primary} />
            <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
              New Room
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { backgroundColor: colors.surface }]}
            onPress={onBackToSongs}
          >
            <IconSymbol name="music.note.list" size={20} color={colors.primary} />
            <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Choose Song
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  winnerSection: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  winnerGradient: {
    padding: 30,
    alignItems: 'center',
  },
  winnerContent: {
    alignItems: 'center',
  },
  winnerIcon: {
    marginBottom: 16,
  },
  winnerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  winnerName: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  winnerScore: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  rankSection: {
    alignItems: 'center',
    marginRight: 16,
    width: 50,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  playerInitial: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  performanceStats: {
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
  },
  scoreSection: {
    alignItems: 'center',
  },
  finalScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
  },
  actionButtons: {
    padding: 20,
    gap: 16,
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
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
}); 