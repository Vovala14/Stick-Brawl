import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import StickFigure from '../components/StickFigure';
import ColorPicker from '../components/ColorPicker';
import Button from '../components/Button';

export default function CustomizeScreen() {
  const router = useRouter();
  const { state, updateCustomization } = useGame();
  const { customization } = state;

  return (
    <LinearGradient colors={['#000000', '#1a0033', '#000000']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>CUSTOMIZE FIGHTER</Text>
        
        <View style={styles.previewContainer}>
          <StickFigure
            bodyColor={customization.bodyColor}
            armsColor={customization.armsColor}
            legsColor={customization.legsColor}
            headband={customization.headband}
            longHair={customization.longHair}
            size={200}
            animate={true}
          />
        </View>

        <View style={styles.customizationPanel}>
          <ColorPicker
            label="Body Color"
            selectedColor={customization.bodyColor}
            onColorSelect={(color) => updateCustomization('bodyColor', color)}
          />
          <ColorPicker
            label="Arms Color"
            selectedColor={customization.armsColor}
            onColorSelect={(color) => updateCustomization('armsColor', color)}
          />
          <ColorPicker
            label="Legs Color"
            selectedColor={customization.legsColor}
            onColorSelect={(color) => updateCustomization('legsColor', color)}
          />

          <View style={styles.accessoryRow}>
            <Text style={styles.label}>ACCESSORIES</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggle, customization.headband && styles.toggleActive]}
                onPress={() => updateCustomization('headband', !customization.headband)}
              >
                <Text style={styles.toggleText}>Headband</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggle, customization.longHair && styles.toggleActive]}
                onPress={() => updateCustomization('longHair', !customization.longHair)}
              >
                <Text style={styles.toggleText}>Long Hair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Button title="BACK TO MENU" onPress={() => router.back()} variant="secondary" style={styles.backButton} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FF0080', marginBottom: 30, letterSpacing: 2 },
  previewContainer: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 40, borderRadius: 20, marginBottom: 30, borderWidth: 2, borderColor: '#333' },
  customizationPanel: { width: '100%', maxWidth: 500, gap: 20 },
  accessoryRow: { marginVertical: 12 },
  label: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  toggleRow: { flexDirection: 'row', gap: 12 },
  toggle: { flex: 1, backgroundColor: '#333', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#555' },
  toggleActive: { backgroundColor: '#FF0080', borderColor: '#FF0080' },
  toggleText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  backButton: { marginTop: 30, width: 300 },
});
