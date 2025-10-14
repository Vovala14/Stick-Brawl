import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type WeaponCardProps = {
  name: string;
  icon: string;
  damage: number;
  rate: number;
  range: number;
  knockback: number;
  ammo: number;
  description: string;
  unlocked: boolean;
  selected: boolean;
  onSelect: () => void;
};

export default function WeaponCard({
  name,
  icon,
  damage,
  rate,
  range,
  knockback,
  ammo,
  description,
  unlocked,
  selected,
  onSelect,
}: WeaponCardProps) {
  return (
    <TouchableOpacity
      onPress={unlocked ? onSelect : undefined}
      disabled={!unlocked}
      activeOpacity={0.8}
      style={styles.container}
    >
      <LinearGradient
        colors={selected ? ['#FF0080', '#7928CA'] : unlocked ? ['#1a1a1a', '#2a2a2a'] : ['#0a0a0a', '#1a1a1a']}
        style={[styles.card, selected && styles.selectedCard]}
      >
        <Image source={{ uri: icon }} style={[styles.icon, !unlocked && styles.lockedIcon]} />
        <Text style={[styles.name, !unlocked && styles.lockedText]}>{name}</Text>
        {unlocked ? (
          <>
            <View style={styles.stats}>
              <StatBar label="DMG" value={damage} max={10} color="#FF0080" />
              <StatBar label="RATE" value={rate} max={10} color="#00D4FF" />
              <StatBar label="RNG" value={range} max={10} color="#FFD700" />
              <StatBar label="KB" value={knockback} max={10} color="#00FF88" />
            </View>
            <Text style={styles.ammo}>AMMO: {ammo === -1 ? '∞' : ammo}</Text>
            <Text style={styles.description}>{description}</Text>
          </>
        ) : (
          <Text style={styles.lockedText}>🔒 LOCKED</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarBg}>
        <View style={[styles.statBarFill, { width: `${(value / max) * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 280, marginHorizontal: 10 },
  card: { padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 3, borderColor: '#333' },
  selectedCard: { borderColor: '#FF0080', elevation: 10 },
  icon: { width: 80, height: 80, marginBottom: 12 },
  lockedIcon: { opacity: 0.3 },
  name: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' },
  stats: { width: '100%', gap: 6, marginBottom: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { color: '#AAA', fontSize: 10, width: 35, fontWeight: 'bold' },
  statBarBg: { flex: 1, height: 8, backgroundColor: '#222', borderRadius: 4 },
  statBarFill: { height: '100%', borderRadius: 4 },
  ammo: { color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  description: { color: '#CCC', fontSize: 12, textAlign: 'center', lineHeight: 16 },
  lockedText: { color: '#666', fontSize: 16, fontWeight: 'bold' },
});
