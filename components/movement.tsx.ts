import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

type DodgeTrailProps = {
  x: number;
  y: number;
  color: string;
  visible: boolean;
};

export function DodgeTrail({ x, y, color, visible }: DodgeTrailProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0.8);
      scale.setValue(1);
      
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, x, y]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.dodgeTrail,
        {
          left: x,
          top: y,
          opacity,
          transform: [{ scale }],
          backgroundColor: color,
        },
      ]}
    />
  );
}

type JumpParticlesProps = {
  x: number;
  y: number;
  visible: boolean;
  isDoubleJump?: boolean;
};

export function JumpParticles({ x, y, visible, isDoubleJump }: JumpParticlesProps) {
  const particles = useRef(
    Array.from({ length: isDoubleJump ? 8 : 5 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      angle: Math.random() * Math.PI * 2,
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      particles.forEach((particle, i) => {
        particle.opacity.setValue(1);
        particle.x.setValue(0);
        particle.y.setValue(0);

        const distance = 30 + Math.random() * 20;
        const angle = particle.angle;

        Animated.parallel([
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: Math.cos(angle) * distance,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: Math.sin(angle) * distance,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [visible, x, y]);

  if (!visible) return null;

  return (
    <View style={[styles.particleContainer, { left: x + 30, top: y + 60 }]}>
      {particles.map((particle, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              opacity: particle.opacity,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
              ],
              backgroundColor: isDoubleJump ? '#FFD700' : '#00D4FF',
            },
          ]}
        />
      ))}
    </View>
  );
}

type BlockShieldProps = {
  x: number;
  y: number;
  visible: boolean;
  isPerfectParry?: boolean;
};

export function BlockShield({ x, y, visible, isPerfectParry }: BlockShieldProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.5);
      opacity.setValue(1);

      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const rotateZ = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <Animated.View
      style={[
        styles.blockShield,
        {
          left: x - 10,
          top: y - 10,
          opacity,
          transform: [{ scale }, { rotateZ }],
          borderColor: isPerfectParry ? '#FFD700' : '#00D4FF',
          borderWidth: isPerfectParry ? 4 : 3,
        },
      ]}
    >
      {isPerfectParry && (
        <View style={styles.parryFlash}>
          <View style={styles.parryRing} />
        </View>
      )}
    </Animated.View>
  );
}

type DodgeIndicatorProps = {
  cooldownPercent: number;
  visible: boolean;
};

export function DodgeIndicator({ cooldownPercent, visible }: DodgeIndicatorProps) {
  if (!visible || cooldownPercent >= 100) return null;

  return (
    <View style={styles.cooldownIndicator}>
      <View style={styles.cooldownBg}>
        <View style={[styles.cooldownFill, { width: `${cooldownPercent}%` }]} />
      </View>
    </View>
  );
}

type MovementStateIndicatorProps = {
  isJumping: boolean;
  isDodging: boolean;
  isBlocking: boolean;
  canDoubleJump: boolean;
};

export function MovementStateIndicator({
  isJumping,
  isDodging,
  isBlocking,
  canDoubleJump,
}: MovementStateIndicatorProps) {
  return (
    <View style={styles.stateIndicator}>
      {isJumping && <View style={[styles.stateDot, { backgroundColor: '#00D4FF' }]} />}
      {isDodging && <View style={[styles.stateDot, { backgroundColor: '#FF0080' }]} />}
      {isBlocking && <View style={[styles.stateDot, { backgroundColor: '#FFD700' }]} />}
      {canDoubleJump && <View style={[styles.stateDot, { backgroundColor: '#00FF88' }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  dodgeTrail: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.6,
  },
  particleContainer: {
    position: 'absolute',
    width: 1,
    height: 1,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  blockShield: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
  },
  parryFlash: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parryRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  cooldownIndicator: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    width: 100,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
  },
  cooldownBg: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  cooldownFill: {
    height: '100%',
    backgroundColor: '#FF0080',
  },
  stateIndicator: {
    position: 'absolute',
    top: 80,
    left: 20,
    flexDirection: 'row',
    gap: 6,
  },
  stateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
