import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { WEAPONS } from '../data/weapons';
import WeaponCard from '../components/WeaponCard';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

export default function WeaponSelectScreen() {
  const router = useRouter();
  const { state, selectWeapon } = useGame();
  const scrollRef = useRef<ScrollView>(null);

  const unlockedWeapons = WEAPONS.filter((w) => w.unlockLevel <= state.currentLevel);

  const handleWeaponSelect = (weaponId: string) => {
    selectWeapon(weaponId);
  };

  const handleContinue = () => {
    router.push('/game');
  };

  return (
    <LinearGradient colors={['#000000', '#1a0033', '#000000']} style={styles.container}>
      <Text style={styles.title}>SELECT WEAPON</Text>
      <Text style={styles.subtitle}>Choose your loadout for this level</Text>
      
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        snapToInterval={width}
        decelerationRate="fast"
      >
        {WEAPONS.map((weapon) => (
          <WeaponCard
            key={weapon.id}
            name={weapon.name}
            icon={weapon.icon}
            damage={weapon.damage}
            rate={weapon.rate}
            range={weapon.range}
            knockback={weapon.knockback}
            ammo={weapon.ammo}
            description={weapon.description}
            unlocked={weapon.unlockLevel <= state.currentLevel}
            selected={state.selectedWeapon === weapon.id}
            onSelect={() => handleWeaponSelect(weapon.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.buttonRow}>
        <Button title="BACK" onPress={() => router.back()} variant="secondary" style={styles.button} />
        <Button title="START LEVEL" onPress={handleContinue} variant="primary" style={styles.button} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FF0080', textAlign: 'center', marginBottom: 8, letterSpacing: 2 },
  subtitle: { fontSize: 16, color: '#00D4FF', textAlign: 'center', marginBottom: 30 },
  carousel: { alignItems: 'center', paddingHorizontal: (width - 280) / 2 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 30 },
  button: { width: 180 },
});
