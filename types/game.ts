// Game types for Stick Brawl

export type Position = {
  x: number;
  y: number;
};

export type Entity = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
};

export type Player = Entity & {
  armor: number;
  maxArmor: number;
  ammo: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  isAttacking: boolean;
  attackCooldown: number;
  isDodging: boolean;
  isBlocking: boolean;
  facingRight: boolean;
};

export type Enemy = Entity & {
  type: 'grunt' | 'bruiser' | 'ranger' | 'shielder' | 'ninja';
  velocityX: number;
  velocityY: number;
  isAttacking: boolean;
  attackCooldown: number;
  aiState: 'idle' | 'patrol' | 'chase' | 'attack' | 'retreat';
  targetX?: number;
  targetY?: number;
  patrolPoint?: number;
  damage: number;
  attackRange: number;
  speed: number;
  attackSpeed: number;
};

export type HitEffect = {
  id: string;
  x: number;
  y: number;
  type: 'hit' | 'critical' | 'block';
  timestamp: number;
};

export type DamageNumber = {
  id: string;
  x: number;
  y: number;
  damage: number;
  timestamp: number;
  velocityY: number;
};
