import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

type ParticleEffectProps = {
  x: number;
  y: number;
  color?: string;
  type?: 'hit' | 'explosion' | 'spark';
};

export default function ParticleEffect({ x, y, color = '#FF0080', type = 'hit' }: ParticleEffectProps) {
  const particles = useRef(
    Array.from({ length: type === 'explosion' ? 12 : 6 }, () => ({
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    particles.forEach((particle, i) => {
      const angle = (i / particles.length) * Math.PI * 2;
      const distance = type === 'explosion' ? 50 : 30;
      
      Animated.parallel([
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: type === 'explosion' ? 800 : 500,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: 0,
          duration: type === 'explosion' ? 800 : 500,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateX, {
          toValue: Math.cos(angle) * distance,
          duration: type === 'explosion' ? 800 : 500,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: Math.sin(angle) * distance,
          duration: type === 'explosion' ? 800 : 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View style={[styles.container, { left: x, top: y }]}>
      {particles.map((particle, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              backgroundColor: color,
              opacity: particle.opacity,
              transform: [
                { scale: particle.scale },
                { translateX: particle.translateX },
                { translateY: particle.translateY },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 10,
    height: 10,
  },
  particle: {
    position: 'absolute',
    width: type === 'explosion' ? 8 : 6,
    height: type === 'explosion' ? 8 : 6,
    borderRadius: type === 'explosion' ? 4 : 3,
  },
});
