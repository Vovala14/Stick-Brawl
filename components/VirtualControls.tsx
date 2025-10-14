import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type VirtualControlsProps = {
  onMove: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onAttack: () => void;
  onJump: () => void;
  onDodge: () => void;
  onBlock: () => void;
  onPause: () => void;
};

export default function VirtualControls({
  onMove,
  onAttack,
  onJump,
  onDodge,
  onBlock,
  onPause,
}: VirtualControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSide}>
        <View style={styles.dpad}>
          <TouchableOpacity style={[styles.dpadBtn, styles.dpadUp]} onPress={() => onMove('up')}>
            <Text style={styles.arrow}>▲</Text>
          </TouchableOpacity>
          <View style={styles.dpadMiddle}>
            <TouchableOpacity style={[styles.dpadBtn, styles.dpadLeft]} onPress={() => onMove('left')}>
              <Text style={styles.arrow}>◀</Text>
            </TouchableOpacity>
            <View style={styles.dpadCenter} />
            <TouchableOpacity style={[styles.dpadBtn, styles.dpadRight]} onPress={() => onMove('right')}>
              <Text style={styles.arrow}>▶</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.dpadBtn, styles.dpadDown]} onPress={() => onMove('down')}>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.lrButtons}>
          <TouchableOpacity style={styles.lButton} onPress={onDodge}>
            <Text style={styles.buttonText}>L</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rButton} onPress={onBlock}>
            <Text style={styles.buttonText}>R</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.rightSide}>
        <TouchableOpacity style={styles.startButton} onPress={onPause}>
          <Text style={styles.smallText}>START</Text>
        </TouchableOpacity>
        <View style={styles.abButtons}>
          <TouchableOpacity style={[styles.actionBtn, styles.bButton]} onPress={onJump}>
            <Text style={styles.buttonText}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.aButton]} onPress={onAttack}>
            <Text style={styles.buttonText}>A</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  leftSide: { gap: 10 },
  rightSide: { alignItems: 'flex-end', gap: 10 },
  dpad: { width: 120, height: 120 },
  dpadBtn: { position: 'absolute', width: 40, height: 40, backgroundColor: 'rgba(0,212,255,0.6)', alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  dpadUp: { top: 0, left: 40 },
  dpadDown: { bottom: 0, left: 40 },
  dpadLeft: { left: 0 },
  dpadRight: { right: 0 },
  dpadMiddle: { position: 'absolute', top: 40, flexDirection: 'row', width: 120, justifyContent: 'space-between' },
  dpadCenter: { width: 40, height: 40 },
  arrow: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  lrButtons: { flexDirection: 'row', gap: 10 },
  lButton: { width: 55, height: 40, backgroundColor: 'rgba(255,215,0,0.6)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rButton: { width: 55, height: 40, backgroundColor: 'rgba(255,215,0,0.6)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  abButtons: { flexDirection: 'row', gap: 15 },
  actionBtn: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  aButton: { backgroundColor: 'rgba(255,0,128,0.7)' },
  bButton: { backgroundColor: 'rgba(255,215,0,0.7)' },
  startButton: { backgroundColor: 'rgba(100,100,100,0.6)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 15 },
  buttonText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  smallText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
});
