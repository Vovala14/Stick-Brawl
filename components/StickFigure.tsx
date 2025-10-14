import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

type StickFigureProps = {
  bodyColor?: string;
  armsColor?: string;
  legsColor?: string;
  headband?: boolean;
  longHair?: boolean;
  size?: number;
  animate?: boolean;
  isEnemy?: boolean;
};

export default function StickFigure({
  bodyColor = '#00D4FF',
  armsColor = '#00D4FF',
  legsColor = '#00D4FF',
  headband = false,
  longHair = false,
  size = 100,
  animate = false,
  isEnemy = false,
}: StickFigureProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const color = isEnemy ? '#000000' : bodyColor;
  const armColor = isEnemy ? '#000000' : armsColor;
  const legColor = isEnemy ? '#000000' : legsColor;

  useEffect(() => {
    if (animate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -5, duration: 500, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [animate]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: bounceAnim }] }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="20" r="10" fill={color} stroke={color} strokeWidth="3" />
        {headband && !isEnemy && <Line x1="42" y1="18" x2="58" y2="18" stroke="#FFD700" strokeWidth="3" />}
        {longHair && !isEnemy && <Path d="M 45 25 Q 40 35 42 40" stroke={color} strokeWidth="2" fill="none" />}
        <Line x1="50" y1="30" x2="50" y2="60" stroke={color} strokeWidth="4" />
        <Line x1="50" y1="35" x2="30" y2="50" stroke={armColor} strokeWidth="3" />
        <Line x1="50" y1="35" x2="70" y2="50" stroke={armColor} strokeWidth="3" />
        <Line x1="50" y1="60" x2="35" y2="85" stroke={legColor} strokeWidth="3" />
        <Line x1="50" y1="60" x2="65" y2="85" stroke={legColor} strokeWidth="3" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
