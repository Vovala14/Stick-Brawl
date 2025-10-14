// Advanced physics system for Stick Brawl

export type PhysicsBody = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  accelerationX: number;
  accelerationY: number;
  mass: number;
  friction: number;
  restitution: number; // Bounciness
};

// Physics constants
export const PHYSICS_CONSTANTS = {
  GRAVITY: 0.8,
  MAX_FALL_SPEED: 20,
  JUMP_FORCE: -16,
  DOUBLE_JUMP_FORCE: -14,
  MOVE_SPEED: 6,
  AIR_CONTROL: 0.7, // Reduced control in air
  GROUND_FRICTION: 0.85,
  AIR_RESISTANCE: 0.98,
  DODGE_SPEED: 12,
  DODGE_DURATION: 250, // ms
  DODGE_COOLDOWN: 500, // ms
  BLOCK_DURATION: 100, // ms
  PARRY_WINDOW: 150, // ms - perfect timing window
  COYOTE_TIME: 100, // ms - grace period after leaving ground
  JUMP_BUFFER: 150, // ms - input buffering
  VARIABLE_JUMP_MULT: 0.5, // Jump height control
};

export class PhysicsEngine {
  static applyGravity(body: PhysicsBody): PhysicsBody {
    const newBody = { ...body };
    newBody.velocityY += PHYSICS_CONSTANTS.GRAVITY;
    newBody.velocityY = Math.min(newBody.velocityY, PHYSICS_CONSTANTS.MAX_FALL_SPEED);
    return newBody;
  }

  static applyFriction(body: PhysicsBody, isGrounded: boolean): PhysicsBody {
    const newBody = { ...body };
    const friction = isGrounded 
      ? PHYSICS_CONSTANTS.GROUND_FRICTION 
      : PHYSICS_CONSTANTS.AIR_RESISTANCE;
    newBody.velocityX *= friction;
    
    // Stop if very slow
    if (Math.abs(newBody.velocityX) < 0.1) {
      newBody.velocityX = 0;
    }
    
    return newBody;
  }

  static updatePosition(body: PhysicsBody): PhysicsBody {
    const newBody = { ...body };
    newBody.x += newBody.velocityX;
    newBody.y += newBody.velocityY;
    return newBody;
  }

  static handleMove(
    body: PhysicsBody, 
    direction: 'left' | 'right', 
    isGrounded: boolean
  ): PhysicsBody {
    const newBody = { ...body };
    const speed = PHYSICS_CONSTANTS.MOVE_SPEED;
    const control = isGrounded ? 1 : PHYSICS_CONSTANTS.AIR_CONTROL;
    
    const targetVelocity = direction === 'left' ? -speed : speed;
    newBody.velocityX = targetVelocity * control;
    
    return newBody;
  }

  static handleJump(
    body: PhysicsBody, 
    isGrounded: boolean, 
    isDoubleJump: boolean
  ): PhysicsBody {
    const newBody = { ...body };
    
    if (isDoubleJump) {
      newBody.velocityY = PHYSICS_CONSTANTS.DOUBLE_JUMP_FORCE;
    } else if (isGrounded) {
      newBody.velocityY = PHYSICS_CONSTANTS.JUMP_FORCE;
    }
    
    return newBody;
  }

  static handleVariableJump(body: PhysicsBody, isJumpHeld: boolean): PhysicsBody {
    const newBody = { ...body };
    
    // If player releases jump early, reduce upward velocity
    if (!isJumpHeld && newBody.velocityY < 0) {
      newBody.velocityY *= PHYSICS_CONSTANTS.VARIABLE_JUMP_MULT;
    }
    
    return newBody;
  }

  static handleDodge(
    body: PhysicsBody, 
    direction: 'left' | 'right'
  ): PhysicsBody {
    const newBody = { ...body };
    const dodgeVelocity = PHYSICS_CONSTANTS.DODGE_SPEED * (direction === 'right' ? 1 : -1);
    newBody.velocityX = dodgeVelocity;
    return newBody;
  }

  static checkGroundCollision(y: number, groundY: number): boolean {
    return y >= groundY;
  }

  static resolveGroundCollision(body: PhysicsBody, groundY: number): PhysicsBody {
    const newBody = { ...body };
    newBody.y = groundY;
    newBody.velocityY = 0;
    return newBody;
  }

  static clampPosition(
    body: PhysicsBody, 
    minX: number, 
    maxX: number, 
    minY: number, 
    maxY: number
  ): PhysicsBody {
    const newBody = { ...body };
    newBody.x = Math.max(minX, Math.min(maxX, newBody.x));
    newBody.y = Math.max(minY, Math.min(maxY, newBody.y));
    return newBody;
  }
}

// Movement state tracking
export type MovementState = {
  isGrounded: boolean;
  isJumping: boolean;
  isFalling: boolean;
  isDodging: boolean;
  isBlocking: boolean;
  canDoubleJump: boolean;
  coyoteTimeRemaining: number;
  jumpBufferRemaining: number;
  dodgeCooldownRemaining: number;
  blockCooldownRemaining: number;
  lastGroundedTime: number;
  lastJumpPressTime: number;
};

export const createDefaultMovementState = (): MovementState => ({
  isGrounded: true,
  isJumping: false,
  isFalling: false,
  isDodging: false,
  isBlocking: false,
  canDoubleJump: false,
  coyoteTimeRemaining: 0,
  jumpBufferRemaining: 0,
  dodgeCooldownRemaining: 0,
  blockCooldownRemaining: 0,
  lastGroundedTime: Date.now(),
  lastJumpPressTime: 0,
});
