# 🤸 Enhanced Physics & Movement System Guide

## Overview

The enhanced physics system adds professional-grade movement mechanics to Stick Brawl with smooth controls, responsive feedback, and satisfying game feel.

---

## 🎯 New Features

### 1. **Advanced Jump Physics**

#### **Variable Jump Height**
- Hold B longer = higher jump
- Release B early = shorter jump
- Gives precise control over platforming

#### **Coyote Time** (100ms grace period)
- Can still jump for a brief moment after walking off a ledge
- Makes platforming feel more forgiving and responsive

#### **Jump Buffering** (150ms input memory)
- Press jump slightly before landing = automatic jump on touchdown
- No need for frame-perfect timing

#### **Double Jump**
- Unlocks at Level 3
- Golden particle effect vs blue for regular jump
- Independent height control

### 2. **Dodge Roll System**

#### **I-Frames** (Invincibility Frames)
- 250ms of complete damage immunity
- Enemies can't hit you during dodge
- Visual feedback with color trails

#### **Cooldown System** (500ms)
- On-screen cooldown bar shows when dodge is ready
- Prevents spam abuse
- Strategic timing required

#### **Dodge Trails**
- 3 fading afterimages follow your dodge
- Color matches your character customization
- Creates motion blur effect

### 3. **Block & Parry System**

#### **Normal Block**
- Reduces damage by 70%
- Shows blue shield effect
- Brief cooldown after use

#### **Perfect Parry** (150ms timing window)
- Block right when enemy attacks
- NO damage taken
- Golden flash effect
- Stuns enemy (doubles their attack cooldown)
- High risk, high reward mechanic

### 4. **Enhanced Movement Physics**

#### **Ground vs Air Control**
- Full control on ground
- 70% control in air (realistic physics)
- Different friction values

#### **Gravity & Fall Speed**
- Realistic gravity curve
- Max fall speed cap prevents terminal velocity bugs
- Smooth acceleration

#### **Momentum System**
- Velocity carries between movements
- Friction gradually slows you down
- Natural-feeling physics

---

## 📊 Physics Constants

```typescript
GRAVITY: 0.8              // Downward acceleration
MAX_FALL_SPEED: 20        // Terminal velocity
JUMP_FORCE: -16           // Initial jump velocity
DOUBLE_JUMP_FORCE: -14    // Slightly weaker
MOVE_SPEED: 6             // Horizontal speed
AIR_CONTROL: 0.7          // Reduced air control
GROUND_FRICTION: 0.85     // Ground slowdown
AIR_RESISTANCE: 0.98      // Air slowdown
DODGE_SPEED: 12           // Fast dash
DODGE_DURATION: 250ms     // I-frame window
DODGE_COOLDOWN: 500ms     // Recharge time
BLOCK_DURATION: 100ms     // Shield active time
PARRY_WINDOW: 150ms       // Perfect timing window
COYOTE_TIME: 100ms        // Jump grace period
JUMP_BUFFER: 150ms        // Input memory
```

---

## 🎨 Visual Feedback

### **Movement State Indicators** (Top-left corner)
- 🔵 Blue dot = Jumping
- 🔴 Pink dot = Dodging
- 🟡 Yellow dot = Blocking
- 🟢 Green dot = Double jump available

### **Dodge Effects**
- Color trails fade behind you
- Trails use your custom body color
- 3 afterimages with staggered timing

### **Jump Particles**
- Blue burst = Regular jump (5 particles)
- Gold burst = Double jump (8 particles)
- 360° particle spread
- Fade out over 400ms

### **Block Shield**
- Translucent blue circular shield
- Appears around player
- Golden glow for perfect parry
- Pulsing animation

### **Cooldown Bar** (Bottom-left)
- Shows dodge cooldown progress
- Pink fill bar
- Only visible when on cooldown

---

## 🎮 Control Feel

### **Responsive Movement**
```
Pressable controls = instant feedback
- D-Pad uses onPressIn/onPressOut
- Jump button tracks hold duration
- Attack responds to tap
```

### **Input Buffering**
```
Press jump → lands 50ms later → auto-jumps
Press jump → enemy hits you → jump canceled (dead)
```

### **Smart AI Interaction**
```
Dodge during enemy attack → full immunity
Block at perfect timing → parry stun
Block normally → reduced damage
No action → full damage + knockback
```

---

## 🔧 Integration Steps

### **1. Create New Files**
```
utils/physics.ts              → Physics engine
components/MovementEffects.tsx → Visual effects
components/VirtualControlsEnhanced.tsx → Better controls
```

### **2. Replace Game Screen**
```
app/game.tsx → app/game-old.tsx (backup)
app/game-enhanced.tsx → app/game.tsx (use new version)
```

### **3. Import New Components**
```typescript
import { PhysicsEngine, PHYSICS_CONSTANTS } from '../utils/physics';
import { DodgeTrail, JumpParticles, BlockShield } from '../components/MovementEffects';
import VirtualControls from '../components/VirtualControlsEnhanced';
```

---

## 🎯 Key Improvements Over Basic System

| Feature | Basic | Enhanced |
|---------|-------|----------|
| Jump | Simple velocity change | Variable height + coyote time + buffering |
| Dodge | Basic teleport | Trails + i-frames + cooldown visual |
| Block | Damage reduction only | Parry timing + visual shield + stun |
| Movement | Instant start/stop | Momentum + friction + air control |
| Physics | Manual calculations | Physics engine class |
| Feedback | Minimal | Rich visual effects |

---

## 🐛 Common Issues & Solutions

### **Issue: Character slides too much**
```typescript
// Increase friction in physics.ts
GROUND_FRICTION: 0.90  // from 0.85
```

### **Issue: Jump feels floaty**
```typescript
// Increase gravity
GRAVITY: 1.0  // from 0.8
```

### **Issue: Dodge too fast to control**
```typescript
// Reduce dodge speed
DODGE_SPEED: 10  // from 12
```

### **Issue: Parry window too hard**
```typescript
// Increase timing window
PARRY_WINDOW: 200  // from 150ms
```

---

## 🎮 Player Controls Cheat Sheet

```
D-PAD ⬅️⬆️⬇️➡️
  ├─ Left/Right: Walk (hold for continuous movement)
  ├─ Up: (unused, reserved for platforms)
  └─ Down: (unused, reserved for drop-through)

B BUTTON 🟡
  ├─ Tap: Jump
  ├─ Hold: Higher jump
  ├─ Double-tap in air: Double jump (Level 3+)
  └─ Release early: Cut jump short

A BUTTON 🔴
  └─ Tap: Attack/Fire weapon

L BUTTON 🟡
  ├─ Tap: Dodge roll
  ├─ I-frames: 250ms
  └─ Cooldown: 500ms (shown on screen)

R BUTTON 🟡
  ├─ Tap: Block
  ├─ Perfect timing: Parry (golden flash)
  └─ Normal timing: 70% damage reduction

START
  └─ Pause game
```

---

## 🚀 Next Enhancements

Want to add more? Consider:

1. **Wall Jumping** - Jump off walls when touching them
2. **Slide** - Duck + move = slide attack
3. **Aerial Attacks** - Special moves in mid-air
4. **Combo System** - Chain attacks for bonus damage
5. **Stamina Bar** - Limit dodge/block spam further
6. **Animation States** - Different sprites for each action

---

## 📝 Testing Checklist

- [ ] Jump height varies with button hold
- [ ] Can jump shortly after leaving ledge (coyote time)
- [ ] Jump input works if pressed before landing (buffering)
- [ ] Double jump only works after regular jump
- [ ] Dodge creates visual trails
- [ ] Dodge makes player invincible
- [ ] Dodge cooldown bar displays correctly
- [ ] Block reduces damage to ~30%
- [ ] Perfect parry (block right when hit) = no damage + golden flash
- [ ] Perfect parry stuns enemy
- [ ] Movement feels smooth with friction
- [ ] Less control in air than on ground
- [ ] All visual effects display correctly

---

**Your physics system is now complete!** 🎉

The game should feel significantly more responsive, polished, and professional with these enhancements. Players will notice the "game feel" improvements immediately!
