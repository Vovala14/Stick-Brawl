import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { LEVELS } from '../data/levels';
import { WEAPONS } from '../data/weapons';
import StickFigure from '../components/StickFigure';
import VirtualControls from '../components/VirtualControls';
import HUD from '../components/HUD';
import PauseMenu from '../components/PauseMenu';
import LevelStartCard from '../components/LevelStartCard';

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const router = useRouter();
  const { state } = useGame();
  const currentLevel = LEVELS[state.currentLevel - 1];
  const selectedWeapon = WEAPONS.find(w => w.id === state.selectedWeapon);

  const [health, setHealth] = useState(100);
  const [armor, setArmor] = useState(state.currentLevel >= 4 ? 50 : 0);
  const [ammo, setAmmo] = useState(selectedWeapon?.ammo || -1);
  const [enemiesLeft, setEnemiesLeft] = useState(currentLevel?.enemies || 1);
  const [playerPos, setPlayerPos] = useState({ x: 100, y: height / 2 });
  const [showTutorial, setShowTutorial] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showLevelStart, setShowLevelStart] = useState(true);


  useEffect(() => {
    if (showTutorial && currentLevel?.tutorial) {
      const timer = setTimeout(() => setShowTutorial(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showTutorial]);

  const handleMove = (direction: string) => {
    const speed = 10;
    setPlayerPos(prev => {
      if (direction === 'left') return { ...prev, x: Math.max(50, prev.x - speed) };
      if (direction === 'right') return { ...prev, x: Math.min(width - 50, prev.x + speed) };
      if (direction === 'up') return { ...prev, y: Math.max(100, prev.y - speed) };
      if (direction === 'down') return { ...prev, y: Math.min(height - 150, prev.y + speed) };
      return prev;
    });
  };

  const handleAttack = () => {
    if (selectedWeapon && selectedWeapon.ammo > 0 && ammo > 0) {
      setAmmo(prev => prev - 1);
    }
    if (Math.random() > 0.7) {
      setEnemiesLeft(prev => Math.max(0, prev - 1));
    }
  };

  useEffect(() => {
    if (enemiesLeft === 0) {
      setTimeout(() => router.push('/results'), 1000);
    }
  }, [enemiesLeft]);

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <HUD
        health={health}
        maxHealth={100}
        armor={armor}
        maxArmor={50}
        ammo={ammo}
        maxAmmo={selectedWeapon?.ammo || -1}
        enemyCount={enemiesLeft}
        weaponIcon={selectedWeapon?.icon}
        showArmor={state.currentLevel >= 4}
      />

      {showTutorial && currentLevel?.tutorial && (
        <View style={styles.tutorialBox}>
          <Text style={styles.tutorialText}>{currentLevel.tutorial}</Text>
        </View>
      )}

      <View style={styles.arena}>
        <View style={[styles.player, { left: playerPos.x, top: playerPos.y }]}>
          <StickFigure
            bodyColor={state.customization.bodyColor}
            armsColor={state.customization.armsColor}
            legsColor={state.customization.legsColor}
            headband={state.customization.headband}
            longHair={state.customization.longHair}
            size={80}
          />
        </View>

        {Array.from({ length: enemiesLeft }).map((_, i) => (
          <View key={i} style={[styles.enemy, { left: width - 150 - i * 60, top: 200 + i * 40 }]}>
            <StickFigure size={70} isEnemy />
          </View>
        ))}
      </View>

      <VirtualControls
        onMove={handleMove}
        onAttack={handleAttack}
        onJump={() => {}}
        onDodge={() => {}}
        onBlock={() => {}}
        onPause={() => setIsPaused(true)}
      />

      {showLevelStart && currentLevel && (
        <LevelStartCard
          levelNumber={currentLevel.id}
          levelName={currentLevel.name}
          tutorial={currentLevel.tutorial}
          onComplete={() => setShowLevelStart(false)}
        />
      )}

      <PauseMenu
        visible={isPaused}
        onResume={() => setIsPaused(false)}
        onRestart={() => {
          setHealth(100);
          setArmor(state.currentLevel >= 4 ? 50 : 0);
          setEnemiesLeft(currentLevel?.enemies || 1);
          setIsPaused(false);
        }}
        onQuit={() => router.push('/menu')}
      />
    </LinearGradient>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  arena: { flex: 1, position: 'relative' },
  player: { position: 'absolute' },
  enemy: { position: 'absolute' },
  tutorialBox: { position: 'absolute', top: 100, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 20, borderRadius: 12, borderWidth: 2, borderColor: '#FFD700', zIndex: 100 },
  tutorialText: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
