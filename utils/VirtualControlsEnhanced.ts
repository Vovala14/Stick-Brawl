import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Pressable } from 'react-native';

type VirtualControlsProps = {
  onMove: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onMoveRelease?: () => void;
  onAttack: () => void;
  onJump: () => void;
  onJumpRelease?: () => void;
  onDodge: () => void;
  onBlock: () => void;
  onPause: () => void;
};

export default function VirtualControls({
  onMove,
  onMoveRelease,
  onAttack,
  onJump,
  onJumpRelease,
  onDodge,
  onBlock,
  onPause,
}: VirtualControlsProps) {
  return (
    <View style={styles.container}>
      {/* Left side - D-Pad */}
      <View style={styles.leftSide}>
        <View style={styles.dpad}>
          <Pressable 
            style={[styles.dpadBtn, styles.dpadUp]} 
            onPressIn={() => onMove('up')}
            onPressOut={onMoveRelease}
          >
            <Text style={styles.arrow}>▲</Text>
          </Pressable>
          <View style={styles.dpadMiddle}>
            <Pressable 
              style={[styles.dpadBtn, styles.dpadLeft]} 
              onPressIn={() => onMove('left')}
              onPressOut={onMoveRelease}
            >
              <Text style={styles.arrow}>◀</Text>
            </Pressable>
            <View style={styles.dpadCenter} />
            <Pressable 
              style={[styles.dpadBtn, styles.dpadRight]} 
              onPressIn={() => onMove('right')}
              onPressOut={onMoveRelease}
            >
              <Text style={styles.arrow}>▶</Text>
            </Pressable>
          </View>
          <Pressable 
            style={[styles.dpadBtn, styles.dpadDown]} 
            onPressIn={() => onMove('down')}
            onPressOut={onMoveRelease}
          >
            <Text style={styles.arrow}>▼</Text>
          </Pressable>
        </View>

        {/* L and R buttons */}
        <View style={styles.lrButtons}>
          <TouchableOpacity 
            style={styles.lButton} 
            onPress={onDodge}
            activeOpacity={0.6}
          >
            <Text style={styles.buttonText}>L</Text>
            <Text style={styles.labelText}>DODGE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rButton} 
            onPress={onBlock}
            activeOpacity={0.6}
          >
            <Text style={styles.buttonText}>R</Text>
            <Text style={styles.labelText}>BLOCK</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Right side - Action buttons */}
      <View style={styles.rightSide}>
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={onPause}
        >
          <Text style={styles.smallText}>START</Text>
        </TouchableOpacity>
        
        <View style={styles.abButtons}>
          <Pressable 
            style={[styles.actionBtn, styles.bButton]} 
            onPressIn={onJump}
            onPressOut={onJumpRelease}
          >
            <Text style={styles.buttonText}>B</Text>
            <Text style={styles.actionLabel}>JUMP</Text>
          </Pressable>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.aButton]} 
            onPress={onAttack}
            activeOpacity={0.5}
          >
            <Text style={styles.buttonText}>A</Text>
            <Text style={styles.actionLabel}>ATTACK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    position: 'absolute', 
    bottom: 20, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  leftSide: { gap: 10 },
  rightSide: { alignItems: 'flex-end', gap: 10 },
  
  // D-Pad
  dpad: { width: 120, height: 120, position: 'relative' },
  dpadBtn: { 
    position: 'absolute', 
    width: 40, 
    height: 40, 
    backgroundColor: 'rgba(0,212,255,0.7)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(0,212,255,0.9)',
  },
  dpadUp: { top: 0, left: 40 },
  dpadDown: { bottom: 0, left: 40 },
  dpadLeft: { left: 0, top: 40 },
  dpadRight: { right: 0, top: 40 },
  dpadMiddle: { 
    position: 'absolute', 
    top: 40, 
    left: 0,
    right: 0,
    flexDirection: 'row', 
    justifyContent: 'space-between',
  },
  dpadCenter: { width: 40, height: 40 },
  arrow: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  // L/R buttons
  lrButtons: { flexDirection: 'row', gap: 10 },
  lButton: { 
    width: 55, 
    height: 50, 
    backgroundColor: 'rgba(255,215,0,0.7)', 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.9)',
  },
  rButton: { 
    width: 55, 
    height: 50, 
    backgroundColor: 'rgba(255,215,0,0.7)', 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.9)',
  },
  labelText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },

  // Action buttons
  abButtons: { flexDirection: 'row', gap: 15 },
  actionBtn: { 
    width: 65, 
    height: 65, 
    borderRadius: 33, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 3,
  },
  aButton: { 
    backgroundColor: 'rgba(255,0,128,0.8)',
    borderColor: 'rgba(255,0,128,1)',
  },
  bButton: { 
    backgroundColor: 'rgba(255,215,0,0.8)',
    borderColor: 'rgba(255,215,0,1)',
  },
  actionLabel: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },

  // Start button
  startButton: { 
    backgroundColor: 'rgba(100,100,100,0.7)', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(100,100,100,0.9)',
  },
  
  buttonText: { 
    color: '#FFF', 
    fontSize: 24, 
    fontWeight: 'bold',
  },
  smallText: { 
    color: '#FFF', 
    fontSize: 10, 
    fontWeight: 'bold',
  },
});
