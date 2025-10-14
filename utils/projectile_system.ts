// Projectile system for Stick Brawl

export type ProjectileType = 
  | 'bullet'      // Fast, straight
  | 'shotgun'     // Multiple pellets, spread
  | 'rocket'      // Slow, explosive
  | 'knife'       // Arc trajectory
  | 'laser'       // Instant hit
  | 'energy';     // Homing

export type Projectile = {
  id: string;
  type: ProjectileType;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  damage: number;
  lifetime: number; // ms
  createdAt: number;
  facingRight: boolean;
  ownerId: string; // 'player' or enemy id
  pierce: boolean; // Can hit multiple enemies
  explosive: boolean; // AoE damage on impact
  explosionRadius?: number;
  trail: boolean; // Leave visual trail
  homing?: string; // Target enemy id for homing
};

export const PROJECTILE_CONFIGS = {
  pistol: {
    type: 'bullet' as ProjectileType,
    speed: 15,
    damage: 5,
    lifetime: 2000,
    spread: 0,
    count: 1,
    pierce: false,
    explosive: false,
    trail: false,
  },
  shotgun: {
    type: 'shotgun' as ProjectileType,
    speed: 12,
    damage: 3,
    lifetime: 800,
    spread: 0.3, // Radian spread per pellet
    count: 6, // Number of pellets
    pierce: false,
    explosive: false,
    trail: false,
  },
  smg: {
    type: 'bullet' as ProjectileType,
    speed: 14,
    damage: 4,
    lifetime: 1500,
    spread: 0.1,
    count: 1,
    pierce: false,
    explosive: false,
    trail: false,
  },
  bazooka: {
    type: 'rocket' as ProjectileType,
    speed: 8,
    damage: 10,
    lifetime: 3000,
    spread: 0,
    count: 1,
    pierce: false,
    explosive: true,
    explosionRadius: 100,
    trail: true,
  },
  knife: {
    type: 'knife' as ProjectileType,
    speed: 10,
    damage: 6,
    lifetime: 1500,
    spread: 0,
    count: 1,
    pierce: true,
    explosive: false,
    trail: false,
  },
  laser: {
    type: 'laser' as ProjectileType,
    speed: 25,
    damage: 7,
    lifetime: 500,
    spread: 0,
    count: 1,
    pierce: true,
    explosive: false,
    trail: true,
  },
};

export class ProjectileManager {
  static createProjectile(
    weaponId: string,
    x: number,
    y: number,
    facingRight: boolean,
    ownerId: string
  ): Projectile[] {
    const config = PROJECTILE_CONFIGS[weaponId as keyof typeof PROJECTILE_CONFIGS];
    if (!config) return [];

    const projectiles: Projectile[] = [];
    const baseAngle = facingRight ? 0 : Math.PI;

    for (let i = 0; i < config.count; i++) {
      // Calculate spread for multiple projectiles
      let angle = baseAngle;
      if (config.count > 1) {
        const spreadOffset = (i - (config.count - 1) / 2) * config.spread;
        angle += spreadOffset;
      } else if (config.spread > 0) {
        // Random spread for single projectiles
        angle += (Math.random() - 0.5) * config.spread;
      }

      const velocityX = Math.cos(angle) * config.speed;
      const velocityY = Math.sin(angle) * config.speed;

      projectiles.push({
        id: `projectile-${Date.now()}-${i}-${Math.random()}`,
        type: config.type,
        x,
        y,
        velocityX,
        velocityY,
        damage: config.damage,
        lifetime: config.lifetime,
        createdAt: Date.now(),
        facingRight,
        ownerId,
        pierce: config.pierce,
        explosive: config.explosive,
        explosionRadius: config.explosionRadius,
        trail: config.trail,
      });
    }

    return projectiles;
  }

  static updateProjectile(projectile: Projectile, gravity: boolean = false): Projectile {
    let updated = { ...projectile };

    // Update position
    updated.x += updated.velocityX;
    updated.y += updated.velocityY;

    // Apply gravity for arc projectiles (knives, rockets)
    if (gravity && (updated.type === 'knife' || updated.type === 'rocket')) {
      updated.velocityY += 0.3;
    }

    return updated;
  }

  static isExpired(projectile: Projectile): boolean {
    return Date.now() - projectile.createdAt > projectile.lifetime;
  }

  static checkCollision(
    projectile: Projectile,
    targetX: number,
    targetY: number,
    targetRadius: number
  ): boolean {
    const dx = projectile.x - targetX;
    const dy = projectile.y - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < targetRadius + 5; // 5 is projectile size
  }

  static getExplosionTargets(
    projectile: Projectile,
    targets: Array<{ x: number; y: number; id: string }>
  ): string[] {
    if (!projectile.explosive || !projectile.explosionRadius) return [];

    return targets
      .filter(target => {
        const dx = projectile.x - target.x;
        const dy = projectile.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < projectile.explosionRadius!;
      })
      .map(target => target.id);
  }
}

// Weapon firing patterns
export type FiringMode = 'single' | 'burst' | 'auto' | 'charge';

export type WeaponState = {
  currentAmmo: number;
  maxAmmo: number;
  reserveAmmo: number;
  isReloading: boolean;
  reloadProgress: number;
  reloadTime: number; // ms
  fireRate: number; // shots per second
  lastFireTime: number;
  firingMode: FiringMode;
  burstCount?: number;
  chargeLevel?: number; // 0-1 for charge weapons
};

export const WEAPON_FIRE_CONFIGS = {
  fists: { fireRate: 2, reloadTime: 0, magazineSize: -1, firingMode: 'single' as FiringMode },
  bigstick: { fireRate: 1, reloadTime: 0, magazineSize: -1, firingMode: 'single' as FiringMode },
  pistol: { fireRate: 3, reloadTime: 1500, magazineSize: 12, firingMode: 'single' as FiringMode },
  shotgun: { fireRate: 1, reloadTime: 2000, magazineSize: 6, firingMode: 'single' as FiringMode },
  smg: { fireRate: 10, reloadTime: 1800, magazineSize: 30, firingMode: 'auto' as FiringMode },
  bazooka: { fireRate: 0.5, reloadTime: 3000, magazineSize: 1, firingMode: 'single' as FiringMode },
  knives: { fireRate: 2, reloadTime: 1000, magazineSize: 5, firingMode: 'single' as FiringMode },
  laser: { fireRate: 5, reloadTime: 2000, magazineSize: 20, firingMode: 'auto' as FiringMode },
};

export class WeaponManager {
  static canFire(weaponState: WeaponState, firingMode: FiringMode = 'single'): boolean {
    if (weaponState.isReloading) return false;
    if (weaponState.currentAmmo === 0) return false;

    const now = Date.now();
    const fireDelay = 1000 / weaponState.fireRate;
    return now - weaponState.lastFireTime >= fireDelay;
  }

  static consumeAmmo(weaponState: WeaponState): WeaponState {
    return {
      ...weaponState,
      currentAmmo: Math.max(0, weaponState.currentAmmo - 1),
      lastFireTime: Date.now(),
    };
  }

  static startReload(weaponState: WeaponState): WeaponState {
    if (weaponState.isReloading || weaponState.currentAmmo === weaponState.maxAmmo) {
      return weaponState;
    }
    if (weaponState.reserveAmmo === 0) return weaponState;

    return {
      ...weaponState,
      isReloading: true,
      reloadProgress: 0,
    };
  }

  static updateReload(weaponState: WeaponState, deltaTime: number): WeaponState {
    if (!weaponState.isReloading) return weaponState;

    const progress = weaponState.reloadProgress + deltaTime;

    if (progress >= weaponState.reloadTime) {
      // Reload complete
      const ammoNeeded = weaponState.maxAmmo - weaponState.currentAmmo;
      const ammoToReload = Math.min(ammoNeeded, weaponState.reserveAmmo);

      return {
        ...weaponState,
        currentAmmo: weaponState.currentAmmo + ammoToReload,
        reserveAmmo: weaponState.reserveAmmo - ammoToReload,
        isReloading: false,
        reloadProgress: 0,
      };
    }

    return {
      ...weaponState,
      reloadProgress: progress,
    };
  }

  static createWeaponState(weaponId: string, reserveAmmo: number = 100): WeaponState {
    const config = WEAPON_FIRE_CONFIGS[weaponId as keyof typeof WEAPON_FIRE_CONFIGS];
    if (!config) {
      return {
        currentAmmo: 0,
        maxAmmo: 0,
        reserveAmmo: 0,
        isReloading: false,
        reloadProgress: 0,
        reloadTime: 0,
        fireRate: 1,
        lastFireTime: 0,
        firingMode: 'single',
      };
    }

    return {
      currentAmmo: config.magazineSize,
      maxAmmo: config.magazineSize,
      reserveAmmo,
      isReloading: false,
      reloadProgress: 0,
      reloadTime: config.reloadTime,
      fireRate: config.fireRate,
      lastFireTime: 0,
      firingMode: config.firingMode,
    };
  }
}
