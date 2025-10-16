import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
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
const GROUND_Y = height - 200;
const PLAYER_SIZE = 60;
const ENEMY_SIZE = 60;
const MOVE_SPEED = 5;
const ENEMY_SPEED = 2;
const ATTACK_RANGE = 80;
const ATTACK_DAMAGE = 15;
const ENEMY_DAMAGE = 10;

type Enemy = {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  isAttacking: boolean;
  attackCooldown: number;
  facingRight: boolean;
  hitFlash: boolean;
};

export default function GameScreen() {
  const router = useRouter();
  const { state } = useGame();
  const currentLevel = LEVELS[state.currentLevel - 1];
  const selectedWeapon = WEAPONS.find(w => w.id === state.selectedWeapon);

  // Player state
  const [playerX, setPlayerX] = useState(150);
  const [playerY] = useState(GROUND_Y);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerArmor, setPlayerArmor] = useState(state.currentLevel >= 4 ? 50 : 0);
  const [playerFacingRight, setPlayerFacingRight] = useState(true);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [playerHitFlash, setPlayerHitFlash] = useState(false);
  
  // Enemies
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  
  // UI state
  const [showTutorial, setShowTutorial] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showLevelStart, setShowLevelStart] = useState(true);
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);

  // Animation values
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const gameLoopRef = useRef<NodeJS.Timeout>();

  // Initialize enemies
  useEffect(() => {
    const enemyCount = currentLevel?.enemies || 3;
    const newEnemies: Enemy[] = [];
    
    for (let i = 0; i < enemyCount; i++) {
      newEnemies.push({
        id: `enemy-${i}`,
        x: width - 150 - (i * 100),
        y: GROUND_Y,
        health: 50,
        maxHealth: 50,
        isAlive: true,
        isAttacking: false,
        attackCooldown: 0,
        facingRight: false,
        hitFlash: false,
      });
    }
    
    setEnemies(newEnemies);
  }, [currentLevel]);

  // Tutorial timer
  useEffect(() => {
    if (showTutorial && currentLevel?.tutorial) {
      const timer = setTimeout(() => setShowTutorial(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showTutorial]);

  // Main game loop
  useEffect(() => {
    if (isPaused || showLevelStart || showVictory || showDefeat) return;

    gameLoopRef.current = setInterval(() => {
      // Update enemies
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isAlive) return enemy;

        const distanceToPlayer = Math.abs(enemy.x - playerX);
        let updated = { ...enemy };

        // Move toward player
        if (distanceToPlayer > ATTACK_RANGE) {
          if (enemy.x > playerX) {
            updated.x -= ENEMY_SPEED;
            updated.facingRight = false;
          } else {
            updated.x += ENEMY_SPEED;
            updated.facingRight = true;
          }
        }

        // Attack player if in range
        if (distanceToPlayer < ATTACK_RANGE && updated.attackCooldown === 0) {
          updated.isAttacking = true;
          updated.attackCooldown = 60; // 1 second at 60fps

          // Deal damage to player
          setPlayerHealth(h => {
            const newHealth = Math.max(0, h - ENEMY_DAMAGE);
            if (newHealth <= 0) {
              setTimeout(() => setShowDefeat(true), 500);
            }
            return newHealth;
          });
          
          // Flash player red
          setPlayerHitFlash(true);
          setTimeout(() => setPlayerHitFlash(false), 100);
          
          // Screen shake
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
          ]).start();
        }

        // Cooldowns
        if (updated.attackCooldown > 0) {
          updated.attackCooldown--;
        }
        if (updated.attackCooldown === 0) {
          updated.isAttacking = false;
        }

        return updated;
      }));
    }, 1000 / 60); // 60 FPS

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPaused, showLevelStart, showVictory, showDefeat, playerX]);

  // Check victory
  useEffect(() => {
    const aliveEnemies = enemies.filter(e => e.isAlive).length;
    if (aliveEnemies === 0 && enemies.length > 0 && !showVictory) {
      setTimeout(() => {
        setShowVictory(true);
        setTimeout(() => router.push('/results'), 2000);
      }, 500);
    }
  }, [enemies]);

  const handleMove = (direction: string) => {
    if (showVictory || showDefeat) return;

    const speed = MOVE_SPEED;
    if (direction === 'left') {
      setPlayerX(prev => Math.max(50, prev - speed));
      setPlayerFacingRight(false);
    } else if (direction === 'right') {
      setPlayerX(prev => Math.min(width - 50, prev + speed));
      setPlayerFacingRight(true);
    }
  };

  const handleAttack = () => {
    if (isPlayerAttacking || showVictory || showDefeat) return;

    setIsPlayerAttacking(true);
    
    // Check collision with enemies
    const attackX = playerFacingRight ? playerX + PLAYER_SIZE : playerX - ATTACK_RANGE;
    
    setEnemies(prev => prev.map(enemy => {
      if (!enemy.isAlive) return enemy;
      
      const enemyCenterX = enemy.x + ENEMY_SIZE / 2;
      const inRange = enemyCenterX > attackX && enemyCenterX < attackX + ATTACK_RANGE;
      
      if (inRange) {
        const newHealth = Math.max(0, enemy.health - ATTACK_DAMAGE);
        
        // Flash enemy white
        const flashedEnemy = { 
          ...enemy, 
          health: newHealth, 
          isAlive: newHealth > 0,
          hitFlash: true 
        };
        
        setTimeout(() => {
          setEnemies(e => e.map(en => 
            en.id === enemy.id ? { ...en, hitFlash: false } : en
          ));
        }, 100);
        
        return flashedEnemy;
      }
      
      return enemy;
    }));

    // Attack animation duration
    setTimeout(() => setIsPlayerAttacking(false), 300);
  };

  const handleRestart = () => {
    // Reset player
    setPlayerX(150);
    setPlayerHealth(100);
    setPlayerArmor(state.currentLevel >= 4 ? 50 : 0);
    setPlayerFacingRight(true);
    setShowDefeat(false);
    setShowVictory(false);
    
    // Reset enemies
    const enemyCount = currentLevel?.enemies || 3;
    const newEnemies: Enemy[] = [];
    
    for (let i = 0; i < enemyCount; i++) {
      newEnemies.push({
        id: `enemy-${i}`,
        x: width - 150 - (i * 100),
        y: GROUND_Y,
        health: 50,
        maxHealth: 50,
        isAlive: true,
        isAttacking: false,
        attackCooldown: 0,
        facingRight: false,
        hitFlash: false,
      });
    }
    
    setEnemies(newEnemies);
    setIsPaused(false);
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <Animated.View style={[styles.gameArea, { transform: [{ translateX: shakeAnim }] }]}>
        <HUD
          health={playerHealth}
          maxHealth={100}
          armor={playerArmor}
          maxArmor={50}
          ammo={-1}
          maxAmmo={-1}
          enemyCount={enemies.filter(e => e.isAlive).length}
          weaponIcon={selectedWeapon?.icon}
          showArmor={state.currentLevel >= 4}
        />

        {showTutorial && currentLevel?.tutorial && (
          <View style={styles.tutorialBox}>
            <Text style={styles.tutorialText}>{currentLevel.tutorial}</Text>
          </View>
        )}

        <View style={styles.arena}>
          {/* Player */}
          <View style={[
            styles.entity, 
            { left: playerX, top: playerY },
            isPlayerAttacking && styles.attacking,
            playerHitFlash && styles.hitFlash
          ]}>
            <StickFigure
              bodyColor={state.customization.bodyColor}
              armsColor={state.customization.armsColor}
              legsColor={state.customization.legsColor}
              headband={state.customization.headband}
              longHair={state.customization.longHair}
              size={PLAYER_SIZE}
            />
            {/* Player health bar */}
            <View style={styles.healthBarBg}>
              <View style={[styles.healthBarFill, { 
                width: `${playerHealth}%`,
                backgroundColor: '#00FF88'
              }]} />
            </View>
          </View>

          {/* Enemies */}
          {enemies.map(enemy => enemy.isAlive && (
            <View 
              key={enemy.id} 
              style={[
                styles.entity, 
                { left: enemy.x, top: enemy.y },
                enemy.isAttacking && styles.attacking,
                enemy.hitFlash && styles.hitFlash
              ]}
            >
              <StickFigure size={ENEMY_SIZE} isEnemy />
              {/* Enemy health bar */}
              <View style={styles.healthBarBg}>
                <View style={[styles.healthBarFill, { 
                  width: `${(enemy.health / enemy.maxHealth) * 100}%`,
                  backgroundColor: '#FF0080'
                }]} />
              </View>
              {enemy.isAttacking && (
                <Text style={styles.attackIndicator}>⚔️</Text>
              )}
            </View>
          ))}
        </View>

        {/* Victory/Defeat overlays */}
        {showVictory && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>🎉 VICTORY! 🎉</Text>
            <Text style={styles.overlayText}>Level Complete!</Text>
          </View>
        )}

        {showDefeat && (
          <View style={styles.overlay}>
            <Text style={[styles.overlayTitle, { color: '#FF0080' }]}>💀 DEFEATED 💀</Text>
            <Text style={styles.overlayText}>Try Again!</Text>
            <View style={styles.buttonRow}>
              <Text style={styles.button} onPress={handleRestart}>RETRY</Text>
              <Text style={styles.button} onPress={() => router.push('/menu')}>MENU</Text>
            </View>
          </View>
        )}

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
          onRestart={handleRestart}
          onQuit={() => router.push('/menu')}
        />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gameArea: { flex: 1 },
  arena: { flex: 1, position: 'relative' },
  entity: { 
    position: 'absolute',
    transition: 'all 0.1s ease',
  },
  attacking: {
    transform: [{ scale: 1.1 }],
  },
  hitFlash: {
    opacity: 0.5,
  },
  healthBarBg: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    width: 60,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  attackIndicator: {
    position: 'absolute',
    top: -25,
    fontSize: 24,
  },
  tutorialBox: { 
    position: 'absolute', 
    top: 100, 
    alignSelf: 'center', 
    backgroundColor: 'rgba(0,0,0,0.9)', 
    padding: 20, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#FFD700', 
    zIndex: 100,
    maxWidth: '80%',
  },
  tutorialText: { 
    color: '#FFD700', 
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  overlayTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  overlayText: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    backgroundColor: '#FF0080',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
});