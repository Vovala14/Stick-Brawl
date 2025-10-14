import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Projectile } from '../utils/projectiles';
import Svg, { Circle, Line, Rect, Polygon } from 'react-native-svg';

// Muzzle flash effect when firing
type MuzzleFlashProps = {
  x: number;
  y: number;
  facingRight: boolean;
  visible: boolean;
  color?: string;
};

export function MuzzleFlash({ x, y, facingRight, visible, color = '#FFD700' }: MuzzleFlashProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.5);
      opacity.setValue(1);

      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, x, y]);

  if (!visible) return null;

  const offset = facingRight ? 40 : -40;

  return (
    <Animated.View
      style={[
        styles.muzzleFlash,
        {
          left: x + offset,
          top: y + 15,
          opacity,
          transform: [{ scale }, { scaleX: facingRight ? 1 : -1 }],
        },
      ]}
    >
      <Svg width={30} height={30} viewBox="0 0 30 30">
        <Polygon
          points="15,5 20,15 15,25 10,15"
          fill={color}
          opacity={0.8}
        />
        <Circle cx="15" cy="15" r="8" fill="#FFF" opacity={0.6} />
        <Circle cx="15" cy="15" r="4" fill={color} />
      </Svg>
    </Animated.View>
  );
}

// Projectile rendering
type ProjectileRenderProps = {
  projectile: Projectile;
};

export function ProjectileRender({ projectile }: ProjectileRenderProps) {
  const getProjectileColor = () => {
    switch (projectile.type) {
      case 'bullet': return '#FFD700';
      case 'shotgun': return '#FF8C00';
      case 'rocket': return '#FF0000';
      case 'knife': return '#C0C0C0';
      case 'laser': return '#00D4FF';
      case 'energy': return '#FF00FF';
      default: return '#FFF';
    }
  };

  const size = projectile.type === 'rocket' ? 12 : projectile.type === 'knife' ? 8 : 6;

  return (
    <View style={[styles.projectile, { left: projectile.x, top: projectile.y }]}>
      <Svg width={size * 2} height={size * 2} viewBox={`0 0 ${size * 2} ${size * 2}`}>
        {projectile.type === 'rocket' && (
          <>
            <Rect
              x={size / 2}
              y={size / 2}
              width={size}
              height={size}
              fill={getProjectileColor()}
              rx={2}
            />
            <Circle cx={size} cy={size} r={size / 3} fill="#FF4500" />
          </>
        )}
        {projectile.type === 'knife' && (
          <Polygon
            points={`${size},2 ${size * 1.5},${size} ${size},${size * 2 - 2} ${size / 2},${size}`}
            fill={getProjectileColor()}
          />
        )}
        {(projectile.type === 'bullet' || projectile.type === 'shotgun') && (
          <Circle cx={size} cy={size} r={size / 2} fill={getProjectileColor()} />
        )}
        {projectile.type === 'laser' && (
          <Rect
            x={size / 4}
            y={size / 2}
            width={size * 1.5}
            height={size / 2}
            fill={getProjectileColor()}
            opacity={0.8}
          />
        )}
        {projectile.type === 'energy' && (
          <>
            <Circle cx={size} cy={size} r={size / 1.5} fill={getProjectileColor()} opacity={0.6} />
            <Circle cx={size} cy={size} r={size / 3} fill="#FFF" />
          </>
        )}
      </Svg>

      {/* Trail for rockets and lasers */}
      {projectile.trail && (
        <Svg
          width={40}
          height={8}
          viewBox="0 0 40 8"
          style={[
            styles.trail,
            {
              left: projectile.facingRight ? -30 : 0,
              transform: [{ scaleX: projectile.facingRight ? 1 : -1 }],
            },
          ]}
        >
          <Line
            x1="0"
            y1="4"
            x2="40"
            y2="4"
            stroke={getProjectileColor()}
            strokeWidth="3"
            opacity={0.4}
          />
        </Svg>
      )}
    </View>
  );
}

// Impact effect when projectile hits
type ImpactEffectProps = {
  x: number;
  y: number;
  visible: boolean;
  type?: 'normal' | 'explosive' | 'pierce';
};

export function ImpactEffect({ x, y, visible, type = 'normal' }: ImpactEffectProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.3);
      opacity.setValue(1);

      const duration = type === 'explosive' ? 300 : 150;
      const finalScale = type === 'explosive' ? 3 : 1.2;

      Animated.parallel([
        Animated.timing(scale, {
          toValue: finalScale,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, x, y]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.impactEffect,
        {
          left: x,
          top: y,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      {type === 'explosive' ? (
        <Svg width={80} height={80} viewBox="0 0 80 80">
          <Circle cx="40" cy="40" r="35" fill="#FF4500" opacity={0.6} />
          <Circle cx="40" cy="40" r="25" fill="#FF8C00" opacity={0.8} />
          <Circle cx="40" cy="40" r="15" fill="#FFD700" />
        </Svg>
      ) : (
        <Svg width={20} height={20} viewBox="0 0 20 20">
          <Circle cx="10" cy="10" r="8" fill="#FFF" opacity={0.8} />
          <Circle cx="10" cy="10" r="4" fill="#FFD700" />
        </Svg>
      )}
    </Animated.View>
  );
}

// Shell casing ejection (for guns)
type ShellCasingProps = {
  x: number;
  y: number;
  facingRight: boolean;
  visible: boolean;
};

export function ShellCasing({ x, y, facingRight, visible }: ShellCasingProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateX.setValue(0);
      translateY.setValue(0);
      rotation.setValue(0);
      opacity.setValue(1);

      const ejectDirection = facingRight ? -1 : 1;

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: ejectDirection * (20 + Math.random() * 10),
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 10,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotation, {
          toValue: Math.random() * 360,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, x, y]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.shellCasing,
        {
          left: x,
          top: y,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { rotate: rotation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              })},
          ],
        },
      ]}
    >
      <View style={styles.shell} />
    </Animated.View>
  );
}

// Reload indicator
type ReloadIndicatorProps = {
  progress: number; // 0-1
  visible: boolean;
  x: number;
  y: number;
};

export function ReloadIndicator({ progress, visible, x, y }: ReloadIndicatorProps) {
  if (!visible) return null;

  return (
    <View style={[styles.reloadIndicator, { left: x, top: y - 40 }]}>
      <View style={styles.reloadBg}>
        <View style={[styles.reloadFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.reloadIcon}>
        <Svg width={20} height={20} viewBox="0 0 20 20">
          <Circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            strokeDasharray={`${progress * 50}, 50`}
          />
        </Svg>
      </View>
    </View>
  );
}

// Ammo counter with visual feedback
type AmmoCounterProps = {
  current: number;
  max: number;
  reserve: number;
  isReloading: boolean;
};

export function AmmoCounter({ current, max, reserve, isReloading }: AmmoCounterProps) {
  const lowAmmo = current / max < 0.3;
  const outOfAmmo = current === 0;

  return (
    <View style={styles.ammoCounter}>
      <View style={styles.ammoDisplay}>
        <View style={styles.magazineVisual}>
          {Array.from({ length: max }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.bullet,
                i < current && styles.bulletFilled,
                outOfAmmo && styles.bulletEmpty,
              ]}
            />
          ))}
        </View>
        <View style={styles.ammoText}>
          <View style={styles.ammoRow}>
            <View style={[styles.currentAmmo, lowAmmo && styles.lowAmmo, outOfAmmo && styles.noAmmo]}>
              {Array.from(String(current).padStart(2, '0')).map((digit, i) => (
                <View key={i} style={styles.digit}>
                  <View style={styles.digitText}>
                    {/* This would be Text component but keeping it simple */}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.separator} />
            <View style={styles.reserveAmmo}>
              {/* Reserve count */}
            </View>
          </View>
        </View>
      </View>
      {isReloading && (
        <View style={styles.reloadingLabel}>
          {/* RELOADING text */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  muzzleFlash: {
    position: 'absolute',
    zIndex: 100,
  },
  projectile: {
    position: 'absolute',
    zIndex: 50,
  },
  trail: {
    position: 'absolute',
    top: 0,
  },
  impactEffect: {
    position: 'absolute',
    zIndex: 101,
  },
  shellCasing: {
    position: 'absolute',
    zIndex: 49,
  },
  shell: {
    width: 4,
    height: 8,
    backgroundColor: '#DAA520',
    borderRadius: 1,
  },
  reloadIndicator: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
  },
  reloadBg: {
    width: 60,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  reloadFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  reloadIcon: {
    width: 20,
    height: 20,
  },
  ammoCounter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  ammoDisplay: {
    flexDirection: 'row',
    gap: 10,
  },
  magazineVisual: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 40,
    gap: 2,
  },
  bullet: {
    width: 3,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 1,
  },
  bulletFilled: {
    backgroundColor: '#FFD700',
  },
  bulletEmpty: {
    backgroundColor: '#FF0000',
  },
  ammoText: {
    justifyContent: 'center',
  },
  ammoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentAmmo: {
    flexDirection: 'row',
  },
  lowAmmo: {
    opacity: 0.7,
  },
  noAmmo: {
    opacity: 0.3,
  },
  digit: {
    width: 12,
    height: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    marginHorizontal: 1,
  },
  digitText: {
    width: '100%',
    height: '100%',
  },
  separator: {
    width: 2,
    height: 12,
    backgroundColor: '#FFD700',
  },
  reserveAmmo: {
    flexDirection: 'row',
  },
  reloadingLabel: {
    marginTop: 4,
    alignItems: 'center',
  },
});
