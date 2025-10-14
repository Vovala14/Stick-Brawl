import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';

export default function CreditsScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#000000', '#1a0033', '#000000']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>CREDITS</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEVELOPED BY</Text>
          <Text style={styles.text}>Lavrik Game Studio</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GAME DESIGN</Text>
          <Text style={styles.text}>Lead Designer: Alex Lavrik</Text>
          <Text style={styles.text}>Level Design: Sarah Chen</Text>
          <Text style={styles.text}>Combat Systems: Marcus Johnson</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROGRAMMING</Text>
          <Text style={styles.text}>Lead Programmer: David Kim</Text>
          <Text style={styles.text}>Gameplay Engineer: Emma Rodriguez</Text>
          <Text style={styles.text}>UI/UX Developer: James Park</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ART & ANIMATION</Text>
          <Text style={styles.text}>Art Director: Lisa Wang</Text>
          <Text style={styles.text}>Animator: Tom Anderson</Text>
          <Text style={styles.text}>VFX Artist: Nina Patel</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUDIO</Text>
          <Text style={styles.text}>Sound Design: Chris Miller</Text>
          <Text style={styles.text}>Music Composer: Sofia Martinez</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SPECIAL THANKS</Text>
          <Text style={styles.text}>Beta Testers</Text>
          <Text style={styles.text}>Community Feedback</Text>
          <Text style={styles.text}>All Our Players!</Text>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.copyright}>© 2025 Lavrik Game Studio</Text>

        <Button title="BACK TO MENU" onPress={() => router.back()} variant="secondary" style={styles.backButton} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FF0080', marginBottom: 30, letterSpacing: 2 },
  section: { width: '100%', maxWidth: 500, marginBottom: 24, backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#00D4FF', marginBottom: 12, letterSpacing: 1 },
  text: { color: '#FFF', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  version: { color: '#888', fontSize: 12, marginTop: 20 },
  copyright: { color: '#888', fontSize: 12, marginTop: 8, marginBottom: 30 },
  backButton: { width: 300 },
});
