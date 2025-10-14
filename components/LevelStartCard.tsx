import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type LevelStartCardProps = {
  levelNumber: number;
  levelName: string;
  tutorial?: string;
  onComplete: () => void;
};

export default function LevelStartCard({ levelNumber, levelName, tutorial, onComplete }: LevelStartCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient colors={['#FF0080', '#7928CA']} style={styles.card}>
        <Text style={styles.levelNumber}>LEVEL {levelNumber}</Text>
        <Text style={styles.levelName}>{levelName}</Text>
        {tutorial && (
          <View style={styles.tutorialBox}>
            <Text style={styles.tutorialLabel}>NEW MECHANIC:</Text>
            <Text style={styles.tutorialText}>{tutorial}</Text>
          </View>
        )}
        <Text style={styles.goal}>DEFEAT ALL ENEMIES</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
  },
  card: {
    width: '80%',
    maxWidth: 600,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    letterSpacing: 2,
  },
  levelName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  tutorialBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  tutorialLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tutorialText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  goal: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
