import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

type HUDProps = {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  ammo: number;
  maxAmmo: number;
  enemyCount: number;
  weaponIcon?: string;
  showArmor?: boolean;
};

export default function HUD({
  health,
  maxHealth,
  armor,
  maxArmor,
  ammo,
  maxAmmo,
  enemyCount,
  weaponIcon,
  showArmor = false,
}: HUDProps) {
  const healthPercent = (health / maxHealth) * 100;
  const armorPercent = showArmor ? (armor / maxArmor) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.topLeft}>
        <View style={styles.barContainer}>
          <Text style={styles.label}>HP</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, styles.healthBar, { width: `${healthPercent}%` }]} />
          </View>
          <Text style={styles.value}>{health}/{maxHealth}</Text>
        </View>
        {showArmor && (
          <View style={styles.barContainer}>
            <Text style={styles.label}>ARMOR</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, styles.armorBar, { width: `${armorPercent}%` }]} />
            </View>
            <Text style={styles.value}>{armor}/{maxArmor}</Text>
          </View>
        )}
      </View>
      <View style={styles.topRight}>
        <View style={styles.enemyCounter}>
          <Text style={styles.enemyText}>ENEMIES: {enemyCount}</Text>
        </View>
        {weaponIcon && (
          <View style={styles.weaponDisplay}>
            <Image source={{ uri: weaponIcon }} style={styles.weaponIcon} />
            <Text style={styles.ammoText}>{ammo}/{maxAmmo}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  topLeft: { gap: 8 },
  topRight: { alignItems: 'flex-end', gap: 8 },
  barContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { color: '#FFF', fontSize: 12, fontWeight: 'bold', width: 50 },
  barBg: { width: 150, height: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: '#333' },
  barFill: { height: '100%', borderRadius: 8 },
  healthBar: { backgroundColor: '#00FF88' },
  armorBar: { backgroundColor: '#00D4FF' },
  value: { color: '#FFF', fontSize: 12, fontWeight: 'bold', minWidth: 50 },
  enemyCounter: { backgroundColor: 'rgba(255,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  enemyText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  weaponDisplay: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  weaponIcon: { width: 40, height: 40 },
  ammoText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
});
