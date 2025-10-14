import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';

export default function ResultsScreen() {
  const router = useRouter();
  const { state, completeLevel, unlockWeapon } = useGame();
  const [rank, setRank] = useState('A');
  const [stars, setStars] = useState(3);
  const [time, setTime] = useState(45);

  useEffect(() => {
    const randomRank = ['S', 'A', 'B', 'C'][Math.floor(Math.random() * 4)];
    const randomStars = Math.floor(Math.random() * 3) + 1;
    const randomTime = Math.floor(Math.random() * 60) + 30;
    setRank(randomRank);
    setStars(randomStars);
    setTime(randomTime);
    completeLevel(state.currentLevel, randomRank, randomTime, randomStars);
  }, []);

  const handleNext = () => {
    router.push('/levels');
  };

  const handleRetry = () => {
    router.push('/game');
  };

  return (
    <LinearGradient colors={['#000000', '#1a0033', '#000000']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>LEVEL COMPLETE!</Text>
        
        <View style={styles.rankContainer}>
          <Text style={styles.rankLabel}>RANK</Text>
          <Text style={[styles.rankText, { color: rank === 'S' ? '#FFD700' : rank === 'A' ? '#00FF88' : rank === 'B' ? '#00D4FF' : '#FF0080' }]}>
            {rank}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>TIME:</Text>
            <Text style={styles.statValue}>{time}s</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>STARS:</Text>
            <Text style={styles.statValue}>{'★'.repeat(stars)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>COINS:</Text>
            <Text style={styles.statValue}>+{stars * 10}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="NEXT LEVEL" onPress={handleNext} variant="primary" style={styles.button} />
          <Button title="RETRY" onPress={handleRetry} variant="secondary" style={styles.button} />
          <Button title="MENU" onPress={() => router.push('/menu')} variant="secondary" style={styles.button} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', padding: 40 },
  title: { fontSize: 40, fontWeight: 'bold', color: '#FF0080', marginBottom: 40, letterSpacing: 2 },
  rankContainer: { alignItems: 'center', marginBottom: 40 },
  rankLabel: { fontSize: 20, color: '#FFF', marginBottom: 10, letterSpacing: 2 },
  rankText: { fontSize: 120, fontWeight: 'bold', textShadowColor: '#000', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10 },
  statsContainer: { width: '100%', maxWidth: 400, gap: 16, marginBottom: 40 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12 },
  statLabel: { color: '#00D4FF', fontSize: 18, fontWeight: 'bold' },
  statValue: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  buttonContainer: { width: '100%', maxWidth: 400, gap: 12 },
  button: { width: '100%' },
});
