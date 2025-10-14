import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type ColorPickerProps = {
  label: string;
  selectedColor: string;
  onColorSelect: (color: string) => void;
};

const COLORS = [
  { name: 'Blue', value: '#00D4FF' },
  { name: 'Yellow', value: '#FFD700' },
  { name: 'Green', value: '#00FF88' },
  { name: 'Pink', value: '#FF0080' },
];

export default function ColorPicker({ label, selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.colorRow}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color.value}
            onPress={() => onColorSelect(color.value)}
            style={[
              styles.colorButton,
              { backgroundColor: color.value },
              selectedColor === color.value && styles.selectedColor,
            ]}
            activeOpacity={0.7}
          >
            {selectedColor === color.value && <View style={styles.checkmark} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColor: {
    borderColor: '#FFFFFF',
    borderWidth: 4,
    elevation: 8,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
