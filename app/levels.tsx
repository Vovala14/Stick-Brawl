import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { LEVELS } from '../data/levels';
import Button from '../components/Button';

export default function LevelsScreen() {
  const router = useRouter();
  const { state } = useGame();

  const handleLevelSelect = (levelId: number) => {
    if (levelId <= state.currentLevel) {
      if (levelId >= 5) {
        router.push('/weapon-select');
      } else {
        router.push('/game');
      }
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a0033', '#000000']} style={styles.container}>
      <Text style={styles.title}>SELECT LEVEL</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.levelGrid}>
          {LEVELS.map((level) => {
            const unlocked = level.id <= state.currentLevel;
            const completed = state.levelProgress[level.id];
            return (
              <TouchableOpacity
                key={level.id}
                onPress={() => handleLevelSelect(level.id)}
                disabled={!unlocked}
                style={styles.levelCard}
              >
                <LinearGradient
                  colors={unlocked ? ['#FF0080', '#7928CA'] : ['#333', '#222']}
                  style={[styles.cardGradient, !unlocked && styles.lockedCard]}
                >
                  <Text style={styles.levelNumber}>{level.id}</Text>
                  <Text style={styles.levelName}>{level.name}</Text>
                  {completed && <Text style={styles.rank}>★ {completed.rank}</Text>}
                  {!unlocked && <Text style={styles.locked}>🔒</Text>}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <Button title="BACK" onPress={() => router.back()} variant="secondary" style={styles.backButton} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FF0080', textAlign: 'center', marginBottom: 20, letterSpacing: 2 },
  scrollContent: { paddingBottom: 20 },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  levelCard: { width: 140, height: 140 },
  cardGradient: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  lockedCard: { opacity: 0.5, borderColor: '#555' },
  levelNumber: { fontSize: 36, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  levelName: { fontSize: 12, color: '#FFF', textAlign: 'center', fontWeight: '600' },
  rank: { fontSize: 16, color: '#FFD700', marginTop: 8, fontWeight: 'bold' },
  locked: { fontSize: 24, marginTop: 8 },
  backButton: { marginTop: 20, alignSelf: 'center', width: 200 },
});
