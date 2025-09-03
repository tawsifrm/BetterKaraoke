import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
}

interface MultiplayerRoomProps {
  roomCode: string;
  players: Player[];
  onStartGame: () => void;
  onLeaveRoom: () => void;
  isHost: boolean;
}

export function MultiplayerRoom({
  roomCode,
  players,
  onStartGame,
  onLeaveRoom,
  isHost,
}: MultiplayerRoomProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    // In a real app, you'd use Clipboard API
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Room Code Copied!', `Room code: ${roomCode}`);
  };

  const canStartGame = players.length >= 2 && players.every(p => p.isReady);

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[colors.primary + '08', colors.accent + '05', 'transparent']}
        style={styles.backgroundGradient}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Multiplayer Room
        </ThemedText>
        <TouchableOpacity onPress={onLeaveRoom} style={styles.leaveButton}>
          <IconSymbol name="xmark.circle.fill" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Room Code Section */}
      <View style={[styles.roomCodeSection, { backgroundColor: colors.card }]}>
        <ThemedText style={[styles.roomCodeLabel, { color: colors.icon }]}>
          Room Code
        </ThemedText>
        <TouchableOpacity onPress={copyRoomCode} style={styles.roomCodeContainer}>
          <ThemedText style={[styles.roomCode, { color: colors.primary }]}>
            {roomCode}
          </ThemedText>
          <IconSymbol 
            name={copied ? "checkmark" : "doc.on.doc"} 
            size={20} 
            color={copied ? colors.primary : colors.icon} 
          />
        </TouchableOpacity>
        <ThemedText style={[styles.roomCodeHint, { color: colors.icon }]}>
          Share this code with friends to join
        </ThemedText>
      </View>

      {/* Players List */}
      <View style={styles.playersSection}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Players ({players.length}/4)
        </ThemedText>
        
        <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
          {players.map((player, index) => (
            <View key={player.id} style={[styles.playerCard, { backgroundColor: colors.card }]}>
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
                  <ThemedText style={[styles.playerStatus, { color: colors.icon }]}>
                    {player.isHost ? 'Host' : player.isReady ? 'Ready' : 'Not Ready'}
                  </ThemedText>
                </View>
                <View style={styles.playerScore}>
                  <ThemedText style={[styles.scoreText, { color: colors.primary }]}>
                    {player.score}
                  </ThemedText>
                </View>
              </View>
              {player.isHost && (
                <View style={[styles.hostBadge, { backgroundColor: colors.primary }]}>
                  <IconSymbol name="crown.fill" size={16} color="white" />
                </View>
              )}
            </View>
          ))}
          
          {/* Empty player slots */}
          {Array.from({ length: 4 - players.length }).map((_, index) => (
            <View key={`empty-${index}`} style={[styles.playerCard, { backgroundColor: colors.surface }]}>
              <View style={styles.playerInfo}>
                <View style={[styles.playerAvatar, { backgroundColor: colors.icon + '20' }]}>
                  <IconSymbol name="person.fill" size={20} color={colors.icon} />
                </View>
                <View style={styles.playerDetails}>
                  <ThemedText style={[styles.playerName, { color: colors.icon }]}>
                    Waiting for player...
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Start Game Button */}
      {isHost && (
        <View style={styles.startGameSection}>
          <TouchableOpacity
            style={[
              styles.startGameButton,
              { 
                backgroundColor: canStartGame ? colors.primary : colors.surface,
                opacity: canStartGame ? 1 : 0.5
              }
            ]}
            onPress={onStartGame}
            disabled={!canStartGame}
          >
            <LinearGradient
              colors={canStartGame ? [colors.primary, colors.secondary] : [colors.surface, colors.surface]}
              style={styles.startGameGradient}
            >
              <IconSymbol name="play.fill" size={24} color="white" />
              <ThemedText style={styles.startGameText}>
                Start Game
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
          
          {!canStartGame && (
            <ThemedText style={[styles.startGameHint, { color: colors.icon }]}>
              Need at least 2 players ready to start
            </ThemedText>
          )}
        </View>
      )}

      {/* Game Rules */}
      <View style={[styles.rulesSection, { backgroundColor: colors.card }]}>
        <ThemedText style={[styles.rulesTitle, { color: colors.text }]}>
          How to Play
        </ThemedText>
        <View style={styles.rulesList}>
          <View style={styles.ruleItem}>
            <IconSymbol name="1.circle.fill" size={20} color={colors.primary} />
            <ThemedText style={[styles.ruleText, { color: colors.text }]}>
              All players sing the same song simultaneously
            </ThemedText>
          </View>
          <View style={styles.ruleItem}>
            <IconSymbol name="2.circle.fill" size={20} color={colors.primary} />
            <ThemedText style={[styles.ruleText, { color: colors.text }]}>
              Your voice is recorded and analyzed for accuracy
            </ThemedText>
          </View>
          <View style={styles.ruleItem}>
            <IconSymbol name="3.circle.fill" size={20} color={colors.primary} />
            <ThemedText style={[styles.ruleText, { color: colors.text }]}>
              Score points for pitch, timing, and lyrics accuracy
            </ThemedText>
          </View>
          <View style={styles.ruleItem}>
            <IconSymbol name="4.circle.fill" size={20} color={colors.primary} />
            <ThemedText style={[styles.ruleText, { color: colors.text }]}>
              Highest score wins the round!
            </ThemedText>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  leaveButton: {
    padding: 8,
  },
  roomCodeSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  roomCodeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 8,
  },
  roomCode: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
    letterSpacing: 2,
  },
  roomCodeHint: {
    fontSize: 12,
    textAlign: 'center',
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
  playersList: {
    flex: 1,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    position: 'relative',
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
    marginBottom: 4,
  },
  playerStatus: {
    fontSize: 14,
  },
  playerScore: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hostBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startGameSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  startGameButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  startGameGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startGameText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  startGameHint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  rulesSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
}); 