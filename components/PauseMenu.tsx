import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from './Button';

type PauseMenuProps = {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
};

export default function PauseMenu({ visible, onResume, onRestart, onQuit }: PauseMenuProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient colors={['#1a0033', '#000000']} style={styles.menu}>
          <Text style={styles.title}>PAUSED</Text>
          
          <View style={styles.buttonContainer}>
            <Button title="RESUME" onPress={onResume} variant="primary" style={styles.button} />
            <Button title="RESTART" onPress={onRestart} variant="secondary" style={styles.button} />
            <Button title="QUIT TO MENU" onPress={onQuit} variant="danger" style={styles.button} />
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>TIPS:</Text>
            <Text style={styles.tipText}>• Use cover to avoid ranged attacks</Text>
            <Text style={styles.tipText}>• Dodge roll has invincibility frames</Text>
            <Text style={styles.tipText}>• Perfect parry timing stuns enemies</Text>
            <Text style={styles.tipText}>• Headshots deal bonus damage</Text>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    width: '80%',
    maxWidth: 500,
    padding: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FF0080',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF0080',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 4,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 30,
  },
  button: {
    width: '100%',
  },
  tipsContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipsTitle: {
    color: '#00D4FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tipText: {
    color: '#FFF',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 18,
  },
});
