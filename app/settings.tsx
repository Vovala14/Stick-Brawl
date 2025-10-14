import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import Button from '../components/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [sfxVolume, setSfxVolume] = useState(0.7);
  const [musicVolume, setMusicVolume] = useState(0.6);
  const [vibration, setVibration] = useState(true);
  const [fps60, setFps60] = useState(true);

  return (
    <LinearGradient colors={['#000000', '#1a0033', '#000000']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>SETTINGS</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUDIO</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.label}>Master Volume</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={masterVolume}
              onValueChange={setMasterVolume}
              minimumTrackTintColor="#FF0080"
              maximumTrackTintColor="#333"
            />
            <Text style={styles.value}>{Math.round(masterVolume * 100)}%</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.label}>SFX Volume</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={sfxVolume}
              onValueChange={setSfxVolume}
              minimumTrackTintColor="#00D4FF"
              maximumTrackTintColor="#333"
            />
            <Text style={styles.value}>{Math.round(sfxVolume * 100)}%</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.label}>Music Volume</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={musicVolume}
              onValueChange={setMusicVolume}
              minimumTrackTintColor="#FFD700"
              maximumTrackTintColor="#333"
            />
            <Text style={styles.value}>{Math.round(musicVolume * 100)}%</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTROLS</Text>
          
          <View style={styles.toggleRow}>
            <Text style={styles.label}>Vibration</Text>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{ false: '#333', true: '#FF0080' }}
              thumbColor={vibration ? '#FFF' : '#666'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GRAPHICS</Text>
          
          <View style={styles.toggleRow}>
            <Text style={styles.label}>60 FPS Mode</Text>
            <Switch
              value={fps60}
              onValueChange={setFps60}
              trackColor={{ false: '#333', true: '#00D4FF' }}
              thumbColor={fps60 ? '#FFF' : '#666'}
            />
          </View>
        </View>

        <Button title="BACK TO MENU" onPress={() => router.back()} variant="secondary" style={styles.backButton} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FF0080', textAlign: 'center', marginBottom: 30, letterSpacing: 2 },
  section: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#00D4FF', marginBottom: 16, letterSpacing: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { color: '#FFF', fontSize: 16, flex: 1 },
  slider: { flex: 2, height: 40 },
  value: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', width: 50, textAlign: 'right' },
  backButton: { marginTop: 20, alignSelf: 'center', width: 300 },
});
