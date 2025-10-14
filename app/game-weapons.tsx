import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { LEVELS } from '../data/levels';
import { WEAPONS_ENHANCED, getWeapon, isMeleeWeapon } from '../data/weapons-enhanced';
import StickFigure from '../components/StickFigure';
import VirtualControls from '../components/VirtualControlsEnhanced';
import HUD from '../components/HUD';
import PauseMenu from '../components/PauseMenu';
import LevelStartCard from '../components/LevelStartCard';
import { 
  DodgeTrail, 
  JumpParticles, 
  BlockShield, 
  DodgeIndicator,
  MovementStateIndicator 
} from '../components/MovementEffects';
import {
  MuzzleFlash,
  ProjectileRender,
  ImpactEffect,
  ShellCasing,
  ReloadIndicator,
} from '../components/WeaponEffects';
import { Player, Enemy, HitEffect, DamageNumber } from '../types/game';
import { checkCircleCollision, getDistance } from '../utils/collision';
import { 
  PhysicsEngine, 
  PHYSICS_CONSTANTS, 
  MovementState,
  createDefaultMovementState 
} from '../utils/physics';
import {
  Projectile,
  ProjectileManager,
  WeaponState,
  WeaponManager,
  WEAPON_FIRE_CONFIGS,
} from '../utils/projectiles';

const { width, height } = Dimensions.get('window');
const GROUND_Y = height - 200;
const PLAYER_SIZE = 60;
const ENEMY_SIZE = 60;

export default function GameScreen() {
  const router = useRouter();
  const { state } = useGame();
  const currentLevel = LEVELS[state.currentLevel - 1];
  const selectedWeaponId = state.selectedWeapon;
  const selectedWeapon = getWeapon(selectedWeaponId);

  // Player state
  const [player, setPlayer] = useState<Player>({
    id: 'player',
    x: 150,
    y: GROUND_Y,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    health: 100,
    maxHealth: 100,
    armor: state.currentLevel >= 4 ? 50 : 0,
    maxArmor: 50,
    ammo: selectedWeapon?.magazineSize || -1,
    isAlive: true,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    isAttacking: false,
    attackCooldown: 0,
    isDodging: false,
    isBlocking: false,
    facingRight: true,
  });

  // Weapon state
  const [weaponState, setWeaponState] = useState<WeaponState>(
    WeaponManager.createWeaponState(selectedWeaponId, selectedWeapon?.ammo || 0)
  );

  // Projectiles
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);

  // Visual effects
  const [muzzleFlashes, setMuzzleFlashes] = useState<Array<{id: string; x: number; y: number; timestamp: number}>>([]);
  const [impactEffects, setImpactEffects] = useState<Array<{id: string; x: number; y: number; type: 'normal' | 'explosive'; timestamp: number}>>([]);
  const [shellCasings, setShellCasings] = useState<Array<{id: string; x: number; y: number; timestamp: number}>>([]);
  const [dodgeTrails, setDodgeTrails] = useState<Array<{id: string; x: number; y: number; timestamp: number}>>([]);
  const [jumpParticles, setJumpParticles] = useState<Array<{id: string; x: number; y: number; isDouble: boolean; timestamp: number}>>([]);
  const [showPerfectParry, setShowPerfectParry] = useState(false);

  // Movement state
  const [movementState, setMovementState] = useState<MovementState>(createDefaultMovementState());

  // Game state
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showLevelStart, setShowLevelStart] = useState(true);

  // Input tracking
  const jumpHeldRef = useRef(false);
  const attackHeldRef = useRef(false);
  const moveDirectionRef = useRef<'left' | 'right' | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const lastFrameTimeRef = useRef(Date.now());

  // Initialize enemies
  useEffect(() => {
    const enemyCount = currentLevel?.enemies || 1;
    const newEnemies: Enemy[] = [];
    
    for (let i = 0; i < enemyCount; i++) {
      newEnemies.push({
        id: `enemy-${i}`,
        x: width - 200 - (i * 80),
        y: GROUND_Y,
        width: ENEMY_SIZE,
        height: ENEMY_SIZE,
        health: 30,
        maxHealth: 30,
        isAlive: true,
        type: 'grunt',
        velocityX: 0,
        velocityY: 0,
        isAttacking: false,
        attackCooldown: 0,
        aiState: 'patrol',
        patrolPoint: Math.random() * 200,
        damage: 10,
        attackRange: 80,
        speed: 2,
        attackSpeed: 60,
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
    if (isPaused || showLevelStart) return;

    gameLoopRef.current = setInterval(() => {
      const now = Date.now();
      const deltaTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Update weapon state (reload)
      setWeaponState(prev => WeaponManager.updateReload(prev, deltaTime));

      // Auto reload if empty and not already reloading
      setWeaponState(prev => {
        if (prev.currentAmmo === 0 && !prev.isReloading && prev.reserveAmmo > 0) {
          return WeaponManager.startReload(prev);
        }
        return prev;
      });

      // Update player physics (same as before)
      setPlayer(prev => {
        let newPlayer = { ...prev };
        let physicsBody = {
          x: prev.x,
          y: prev.y,
          velocityX: prev.velocityX,
          velocityY: prev.velocityY,
          accelerationX: 0,
          accelerationY: 0,
          mass: 1,
          friction: 0.85,
          restitution: 0,
        };

        const wasGrounded = movementState.isGrounded;
        const isGrounded = PhysicsEngine.checkGroundCollision(physicsBody.y, GROUND_Y);

        if (isGrounded && !wasGrounded) {
          setMovementState(ms => ({
            ...ms,
            isGrounded: true,
            isJumping: false,
            isFalling: false,
            canDoubleJump: false,
            lastGroundedTime: now,
          }));
        } else if (!isGrounded && wasGrounded) {
          setMovementState(ms => ({
            ...ms,
            isGrounded: false,
            coyoteTimeRemaining: PHYSICS_CONSTANTS.COYOTE_TIME,
          }));
        }

        if (!isGrounded) {
          physicsBody = PhysicsEngine.applyGravity(physicsBody);
        }

        physicsBody = PhysicsEngine.applyFriction(physicsBody, isGrounded);

        if (moveDirectionRef.current && !prev.isDodging) {
          physicsBody = PhysicsEngine.handleMove(physicsBody, moveDirectionRef.current, isGrounded);
          newPlayer.facingRight = moveDirectionRef.current === 'right';
        }

        if (!jumpHeldRef.current && physicsBody.velocityY < 0) {
          physicsBody = PhysicsEngine.handleVariableJump(physicsBody, false);
        }

        physicsBody = PhysicsEngine.updatePosition(physicsBody);

        if (PhysicsEngine.checkGroundCollision(physicsBody.y, GROUND_Y)) {
          physicsBody = PhysicsEngine.resolveGroundCollision(physicsBody, GROUND_Y);
        }

        physicsBody = PhysicsEngine.clampPosition(physicsBody, 50, width - 100, 0, height);

        newPlayer.x = physicsBody.x;
        newPlayer.y = physicsBody.y;
        newPlayer.velocityX = physicsBody.velocityX;
        newPlayer.velocityY = physicsBody.velocityY;

        if (physicsBody.velocityY > 1) {
          setMovementState(ms => ({ ...ms, isFalling: true, isJumping: false }));
        }

        if (newPlayer.attackCooldown > 0) {
          newPlayer.attackCooldown--;
          if (newPlayer.attackCooldown === 0) {
            newPlayer.isAttacking = false;
          }
        }

        return newPlayer;
      });

      // Update projectiles
      setProjectiles(prev => prev.map(proj => {
        let updated = ProjectileManager.updateProjectile(proj, true);
        return updated;
      }).filter(proj => {
        // Remove expired
        if (ProjectileManager.isExpired(proj)) return false;
        // Remove out of bounds
        if (proj.x < -50 || proj.x > width + 50 || proj.y < -50 || proj.y > height + 50) return false;
        return true;
      }));

      // Check projectile collisions with enemies
      setProjectiles(prev => {
        const remainingProjectiles: Projectile[] = [];
        
        prev.forEach(proj => {
          if (proj.ownerId !== 'player') {
            remainingProjectiles.push(proj);
            return;
          }

          let hit = false;

          setEnemies(enemies => enemies.map(enemy => {
            if (!enemy.isAlive || hit && !proj.pierce) return enemy;

            if (ProjectileManager.checkCollision(proj, enemy.x + ENEMY_SIZE/2, enemy.y + ENEMY_SIZE/2, ENEMY_SIZE/2)) {
              hit = true;

              // Explosion damage
              if (proj.explosive) {
                const targets = ProjectileManager.getExplosionTargets(
                  proj,
                  enemies.filter(e => e.isAlive).map(e => ({ x: e.x + ENEMY_SIZE/2, y: e.y + ENEMY_SIZE/2, id: e.id }))
                );
                
                setImpactEffects(fx => [...fx, {
                  id: `impact-${Date.now()}-${Math.random()}`,
                  x: proj.x,
                  y: proj.y,
                  type: 'explosive',
                  timestamp: Date.now(),
                }]);

                // Apply explosion damage to all in radius (handled below)
              } else {
                // Normal hit
                const newHealth = Math.max(0, enemy.health - proj.damage);
                addHitEffect(enemy.x, enemy.y, proj.damage > 7 ? 'critical' : 'hit');
                addDamageNumber(enemy.x, enemy.y - 20, proj.damage);
                
                setImpactEffects(fx => [...fx, {
                  id: `impact-${Date.now()}-${Math.random()}`,
                  x: proj.x,
                  y: proj.y,
                  type: 'normal',
                  timestamp: Date.now(),
                }]);

                return {
                  ...enemy,
                  health: newHealth,
                  isAlive: newHealth > 0,
                };
              }
            }

            return enemy;
          }));

          if (!hit || proj.pierce) {
            remainingProjectiles.push(proj);
          }
        });

        return remainingProjectiles;
      });

      // Update movement state timers
      setMovementState(prev => {
        const updated = { ...prev };
        
        if (updated.coyoteTimeRemaining > 0) {
          updated.coyoteTimeRemaining = Math.max(0, updated.coyoteTimeRemaining - 16);
        }
        
        if (updated.jumpBufferRemaining > 0) {
          updated.jumpBufferRemaining = Math.max(0, updated.jumpBufferRemaining - 16);
        }
        
        if (updated.dodgeCooldownRemaining > 0) {
          updated.dodgeCooldownRemaining = Math.max(0, updated.dodgeCooldownRemaining - 16);
        }

        if (updated.blockCooldownRemaining > 0) {
          updated.blockCooldownRemaining = Math.max(0, updated.blockCooldownRemaining - 16);
        }
        
        return updated;
      });

      // Update enemies (same as before, with projectile awareness added later)
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isAlive) return enemy;
        
        let updated = { ...enemy };
        const distanceToPlayer = getDistance(enemy.x, enemy.y, player.x, player.y);
        
        if (distanceToPlayer < 300) {
          updated.aiState = 'chase';
          const direction = player.x > enemy.x ? 1 : -1;
          updated.velocityX = direction * updated.speed;
          updated.x += updated.velocityX;
          
          if (distanceToPlayer < updated.attackRange && updated.attackCooldown === 0) {
            updated.aiState = 'attack';
            updated.isAttacking = true;
            updated.attackCooldown = updated.attackSpeed;
            
            const isBlocking = player.isBlocking;
            const isPerfectBlock = isBlocking && movementState.blockCooldownRemaining > (PHYSICS_CONSTANTS.BLOCK_DURATION - PHYSICS_CONSTANTS.PARRY_WINDOW);
            
            if (player.isDodging) {
              // Dodge - no damage
            } else if (isPerfectBlock) {
              setShowPerfectParry(true);
              setTimeout(() => setShowPerfectParry(false), 200);
              addHitEffect(player.x, player.y, 'block');
              updated.attackCooldown = updated.attackSpeed * 2;
            } else if (isBlocking) {
              setPlayer(p => {
                const reducedDmg = Math.floor(updated.damage * 0.3);
                const newPlayer = { ...p };
                if (newPlayer.armor > 0) {
                  newPlayer.armor = Math.max(0, newPlayer.armor - reducedDmg);
                } else {
                  newPlayer.health = Math.max(0, newPlayer.health - reducedDmg);
                }
                addDamageNumber(p.x, p.y - 30, reducedDmg);
                addHitEffect(p.x, p.y, 'block');
                return newPlayer;
              });
            } else {
              setPlayer(p => {
                const dmg = updated.damage;
                const newPlayer = { ...p };
                if (newPlayer.armor > 0) {
                  newPlayer.armor = Math.max(0, newPlayer.armor - dmg);
                } else {
                  newPlayer.health = Math.max(0, newPlayer.health - dmg);
                }
                addDamageNumber(p.x, p.y - 30, dmg);
                addHitEffect(p.x, p.y, 'hit');
                return newPlayer;
              });
            }
          }
        } else {
          updated.aiState = 'patrol';
          if (!updated.patrolPoint) {
            updated.patrolPoint = enemy.x + (Math.random() * 200 - 100);
          }
          
          const toPatrol = updated.patrolPoint - updated.x;
          if (Math.abs(toPatrol) > 5) {
            updated.velocityX = toPatrol > 0 ? 1 : -1;
            updated.x += updated.velocityX;
          } else {
            updated.patrolPoint = enemy.x + (Math.random() * 200 - 100);
          }
        }
        
        if (updated.attackCooldown > 0) {
          updated.attackCooldown--;
          if (updated.attackCooldown === 0) {
            updated.isAttacking = false;
          }
        }
        
        return updated;
      }));

      // Clean up effects
      setHitEffects(prev => prev.filter(effect => now - effect.timestamp < 300));
      setDamageNumbers(prev => prev.filter(dmg => now - dmg.timestamp < 1000));
      setDodgeTrails(prev => prev.filter(trail => now - trail.timestamp < 250));
      setJumpParticles(prev => prev.filter(p => now - p.timestamp < 400));
      setMuzzleFlashes(prev => prev.filter(f => now - f.timestamp < 100));
      setImpactEffects(prev => prev.filter(f => now - f.timestamp < 300));
      setShellCasings(prev => prev.filter(s => now - s.timestamp < 400));
      
      setDamageNumbers(prev => prev.map(dmg => ({
        ...dmg,
        y: dmg.y + dmg.velocityY,
        velocityY: dmg.velocityY - 0.5,
      })));

    }, 1000 / 60);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPaused, showLevelStart, player.x, player.y, movementState, selectedWeaponId]);

  // Win/lose conditions
  useEffect(() => {
    const aliveEnemies = enemies.filter(e => e.isAlive).length;
    if (aliveEnemies === 0 && enemies.length > 0) {
      setTimeout(() => router.push('/results'), 1000);
    }
  }, [enemies]);

  useEffect(() => {
    if (player.health <= 0) {
      setTimeout(() => {
        alert('Game Over! Try again.');
        router.push('/levels');
      }, 500);
    }
  }, [player.health]);

  const addHitEffect = (x: number, y: number, type: 'hit' | 'critical' | 'block') => {
    setHitEffects(prev => [...prev, {
      id: `hit-${Date.now()}-${Math.random()}`,
      x, y, type,
      timestamp: Date.now(),
    }]);
  };

  const addDamageNumber = (x: number, y: number, damage: number) => {
    setDamageNumbers(prev => [...prev, {
      id: `dmg-${Date.now()}-${Math.random()}`,
      x, y, damage,
      timestamp: Date.now(),
      velocityY: -2,
    }]);
  };

  const handleMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (direction === 'left' || direction === 'right') {
      moveDirectionRef.current = direction;
    }
  };

  const handleMoveRelease = () => {
    moveDirectionRef.current = null;
  };

  const handleJump = () => {
    jumpHeldRef.current = true;
    
    setMovementState(prev => ({
      ...prev,
      lastJumpPressTime: Date.now(),
      jumpBufferRemaining: PHYSICS_CONSTANTS.JUMP_BUFFER,
    }));

    const canCoyoteJump = movementState.coyoteTimeRemaining > 0;
    const canDoubleJump = movementState.canDoubleJump && state.currentLevel >= 3;

    if (movementState.isGrounded || canCoyoteJump) {
      setPlayer(prev => ({
        ...prev,
        velocityY: PHYSICS_CONSTANTS.JUMP_FORCE,
        isJumping: true,
      }));

      setMovementState(prev => ({
        ...prev,
        isGrounded: false,
        isJumping: true,
        canDoubleJump: true,
        coyoteTimeRemaining: 0,
      }));

      setJumpParticles(prev => [...prev, {
        id: `jump-${Date.now()}`,
        x: player.x,
        y: player.y,
        isDouble: false,
        timestamp: Date.now(),
      }]);
    } else if (canDoubleJump) {
      setPlayer(prev => ({
        ...prev,
        velocityY: PHYSICS_CONSTANTS.DOUBLE_JUMP_FORCE,
      }));

      setMovementState(prev => ({
        ...prev,
        canDoubleJump: false,
      }));

      setJumpParticles(prev => [...prev, {
        id: `doublejump-${Date.now()}`,
        x: player.x,
        y: player.y,
        isDouble: true,
        timestamp: Date.now(),
      }]);
    }

    setTimeout(() => {
      jumpHeldRef.current = false;
    }, 150);
  };

  const handleAttack = () => {
    if (!selectedWeapon) return;

    // Check if melee
    if (isMeleeWeapon(selectedWeaponId)) {
      handleMeleeAttack();
    } else {
      handleRangedAttack();
    }
  };

  const handleMeleeAttack = () => {
    if (player.attackCooldown > 0) return;

    setPlayer(prev => ({
      ...prev,
      isAttacking: true,
      attackCooldown: 30,
    }));

    const attackRange = selectedWeapon?.range ? selectedWeapon.range * 15 : 70;
    const attackX = player.facingRight ? player.x + PLAYER_SIZE : player.x - attackRange;
    
    setEnemies(prev => prev.map(enemy => {
      if (!enemy.isAlive) return enemy;
      
      const inRange = checkCircleCollision(
        { x: attackX + attackRange / 2, y: player.y, radius: attackRange / 2 },
        { x: enemy.x, y: enemy.y, radius: ENEMY_SIZE / 2 }
      );
      
      if (inRange) {
        const damage = selectedWeapon?.damage || 5;
        const newHealth = Math.max(0, enemy.health - damage);
        
        addHitEffect(enemy.x, enemy.y, damage > 7 ? 'critical' : 'hit');
        addDamageNumber(enemy.x, enemy.y - 20, damage);
        
        return {
          ...enemy,
          health: newHealth,
          isAlive: newHealth > 0,
        };
      }
      
      return enemy;
    }));
  };

  const handleRangedAttack = () => {
    if (!WeaponManager.canFire(weaponState, selectedWeapon?.firingMode)) return;

    // Check if we need to reload
    if (weaponState.currentAmmo === 0) {
      handleReload();
      return;
    }

    // Consume ammo
    setWeaponState(prev => WeaponManager.consumeAmmo(prev));

    // Create projectiles
    const spawnX = player.facingRight ? player.x + PLAYER_SIZE + 10 : player.x - 10;
    const spawnY = player.y + PLAYER_SIZE / 2;
    
    const newProjectiles = ProjectileManager.createProjectile(
      selectedWeaponId,
      spawnX,
      spawnY,
      player.facingRight,
      'player'
    );

    setProjectiles(prev => [...prev, ...newProjectiles]);

    // Add muzzle flash
    setMuzzleFlashes(prev => [...prev, {
      id: `flash-${Date.now()}`,
      x: player.x,
      y: player.y,
      timestamp: Date.now(),
    }]);

    // Add shell casing for certain weapons
    if (['pistol', 'smg', 'shotgun'].includes(selectedWeaponId)) {
      setShellCasings(prev => [...prev, {
        id: `shell-${Date.now()}`,
        x: player.x,
        y: player.y,
        timestamp: Date.now(),
      }]);
    }

    setPlayer(prev => ({
      ...prev,
      isAttacking: true,
      attackCooldown: 5,
    }));
  };

  const handleReload = () => {
    setWeaponState(prev => WeaponManager.startReload(prev));
  };

  const handleDodge = () => {
    if (movementState.dodgeCooldownRemaining > 0) return;

    const direction = player.facingRight ? 'right' : 'left';
    
    setPlayer(prev => ({
      ...prev,
      isDodging: true,
      velocityX: PHYSICS_CONSTANTS.DODGE_SPEED * (direction === 'right' ? 1 : -1),
    }));

    setMovementState(prev => ({
      ...prev,
      isDodging: true,
      dodgeCooldownRemaining: PHYSICS_CONSTANTS.DODGE_COOLDOWN,
    }));

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        setDodgeTrails(prev => [...prev, {
          id: `trail-${Date.now()}-${i}`,
          x: player.x,
          y: player.y,
          timestamp: Date.now(),
        }]);
      }, i * 50);
    }

    setTimeout(() => {
      setPlayer(prev => ({ ...prev, isDodging: false, velocityX: 0 }));
      setMovementState(prev => ({ ...prev, isDodging: false }));
    }, PHYSICS_CONSTANTS.DODGE_DURATION);
  };

  const handleBlock = () => {
    if (movementState.blockCooldownRemaining > 0) return;

    setPlayer(prev => ({ ...prev, isBlocking: true }));
    setMovementState(prev => ({
      ...prev,
      isBlocking: true,
      blockCooldownRemaining: PHYSICS_CONSTANTS.BLOCK_DURATION,
    }));

    setTimeout(() => {
      setPlayer(prev => ({ ...prev, isBlocking: false }));
      setMovementState(prev => ({ ...prev, isBlocking: false }));
    }, PHYSICS_CONSTANTS.BLOCK_DURATION);
  };

  const dodgeCooldownPercent = (movementState.dodgeCooldownRemaining / PHYSICS_CONSTANTS.DODGE_COOLDOWN) * 100;
  const reloadProgress = weaponState.reloadProgress / weaponState.reloadTime;

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <HUD
        health={player.health}
        maxHealth={player.maxHealth}
        armor={player.armor}
        maxArmor={player.maxArmor}
        ammo={weaponState.currentAmmo}
        maxAmmo={weaponState.maxAmmo}
        enemyCount={enemies.filter(e => e.isAlive).length}
        weaponIcon={selectedWeapon?.icon}
        showArmor={state.currentLevel >= 4}
      />

      <MovementStateIndicator
        isJumping={movementState.isJumping}
        isDodging={movementState.isDodging}
        isBlocking={movementState.isBlocking}
        canDoubleJump={movementState.canDoubleJump}
      />

      <DodgeIndicator cooldownPercent={100 - dodgeCooldownPercent} visible={dodgeCooldownPercent > 0} />

      {weaponState.isReloading && (
        <ReloadIndicator
          progress={reloadProgress}
          visible={true}
          x={player.x}
          y={player.y}
        />
      )}

      {showTutorial && currentLevel?.tutorial && (
        <View style={styles.tutorialBox}>
          <Text style={styles.tutorialText}>{currentLevel.tutorial}</Text>
        </View>
      )}

      <View style={styles.arena}>
        {/* Dodge trails */}
        {dodgeTrails.map(trail => (
          <DodgeTrail
            key={trail.id}
            x={trail.x}
            y={trail.y}
            color={state.customization.bodyColor}
            visible={true}
          />
        ))}

        {/* Jump particles */}
        {jumpParticles.map(particles => (
          <JumpParticles
            key={particles.id}
            x={particles.x}
            y={particles.y}
            visible={true}
            isDoubleJump={particles.isDouble}
          />
        ))}

        {/* Muzzle flashes */}
        {muzzleFlashes.map(flash => (
          <MuzzleFlash
            key={flash.id}
            x={flash.x}
            y={flash.y}
            facingRight={player.facingRight}
            visible={true}
            color={selectedWeapon?.muzzleFlashColor}
          />
        ))}

        {/* Shell casings */}
        {shellCasings.map(shell => (
          <ShellCasing
            key={shell.id}
            x={shell.x}
            y={shell.y}
            facingRight={player.facingRight}
            visible={true}
          />
        ))}

        {/* Projectiles */}
        {projectiles.map(proj => (
          <ProjectileRender key={proj.id} projectile={proj} />
        ))}

        {/* Impact effects */}
        {impactEffects.map(impact => (
          <ImpactEffect
            key={impact.id}
            x={impact.x}
            y={impact.y}
            visible={true}
            type={impact.type}
          />
        ))}

        {/* Player */}
        <View style={[styles.entity, { left: player.x, top: player.y }]}>
          <StickFigure
            bodyColor={state.customization.bodyColor}
            armsColor={state.customization.armsColor}
            legsColor={state.customization.legsColor}
            headband={state.customization.headband}
            longHair={state.customization.longHair}
            size={PLAYER_SIZE}
          />
          <BlockShield
            x={player.x}
            y={player.y}
            visible={player.isBlocking}
            isPerfectParry={showPerfectParry}
          />
        </View>

        {/* Enemies */}
        {enemies.map(enemy => enemy.isAlive && (
          <View key={enemy.id} style={[styles.entity, { left: enemy.x, top: enemy.y }]}>
            <StickFigure size={ENEMY_SIZE} isEnemy />
            <View style={styles.healthBarBg}>
              <View 
                style={[
                  styles.healthBarFill, 
                  { width: `${(enemy.health / enemy.maxHealth) * 100}%` }
                ]} 
              />
            </View>
            {enemy.isAttacking && (
              <Text style={styles.attackIndicator}>⚔️</Text>
            )}
          </View>
        ))}

        {/* Hit effects */}
        {hitEffects.map(effect => (
          <View key={effect.id} style={[styles.hitEffect, { left: effect.x, top: effect.y }]}>
            <Text style={styles.hitEffectText}>
              {effect.type === 'hit' ? '💥' : effect.type === 'critical' ? '💢' : '🛡️'}
            </Text>
          </View>
        ))}

        {/* Damage numbers */}
        {damageNumbers.map(dmg => (
          <View key={dmg.id} style={[styles.damageNumber, { left: dmg.x, top: dmg.y }]}>
            <Text style={styles.damageText}>-{dmg.damage}</Text>
          </View>
        ))}
      </View>

      <VirtualControls
        onMove={handleMove}
        onMoveRelease={handleMoveRelease}
        onAttack={handleAttack}
        onJump={handleJump}
        onJumpRelease={() => {}}
        onDodge={handleDodge}
        onBlock={handleBlock}
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
          // Full reset logic
          setPlayer({
            id: 'player',
            x: 150,
            y: GROUND_Y,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            health: 100,
            maxHealth: 100,
            armor: state.currentLevel >= 4 ? 50 : 0,
            maxArmor: 50,
            ammo: selectedWeapon?.magazineSize || -1,
            isAlive: true,
            velocityX: 0,
            velocityY: 0,
            isJumping: false,
            isAttacking: false,
            attackCooldown: 0,
            isDodging: false,
            isBlocking: false,
            facingRight: true,
          });
          
          setWeaponState(WeaponManager.createWeaponState(selectedWeaponId, selectedWeapon?.ammo || 0));
          setMovementState(createDefaultMovementState());
          setProjectiles([]);
          
          const enemyCount = currentLevel?.enemies || 1;
          const newEnemies: Enemy[] = [];
          for (let i = 0; i < enemyCount; i++) {
            newEnemies.push({
              id: `enemy-${i}`,
              x: width - 200 - (i * 80),
              y: GROUND_Y,
              width: ENEMY_SIZE,
              height: ENEMY_SIZE,
              health: 30,
              maxHealth: 30,
              isAlive: true,
              type: 'grunt',
              velocityX: 0,
              velocityY: 0,
              isAttacking: false,
              attackCooldown: 0,
              aiState: 'patrol',
              patrolPoint: Math.random() * 200,
              damage: 10,
              attackRange: 80,
              speed: 2,
              attackSpeed: 60,
            });
          }
          setEnemies(newEnemies);
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
  entity: { position: 'absolute' },
  tutorialBox: { 
    position: 'absolute', 
    top: 100, 
    alignSelf: 'center', 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    padding: 20, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#FFD700', 
    zIndex: 100 
  },
  tutorialText: { 
    color: '#FFD700', 
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  healthBarBg: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    width: 60,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: '#FF0080',
    borderRadius: 2,
  },
  attackIndicator: {
    position: 'absolute',
    top: -20,
    fontSize: 20,
  },
  hitEffect: {
    position: 'absolute',
    zIndex: 999,
  },
  hitEffectText: {
    fontSize: 32,
  },
  damageNumber: {
    position: 'absolute',
    zIndex: 999,
  },
  damageText: {
    color: '#FF0080',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
