import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

export default function MainMenu() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/68eeb342cee268ccd494b240_1760473985103_b973b1c1.webp' }}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']} style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>STICK BRAWL</Text>
          <Text style={styles.subtitle}>by Lavrik Game Studio</Text>
          
          <View style={styles.buttonContainer}>
            <Button title="PLAY" onPress={() => router.push('/levels')} variant="primary" style={styles.button} />
            <Button title="CUSTOMIZE" onPress={() => router.push('/customize')} variant="secondary" style={styles.button} />
            <Button title="SETTINGS" onPress={() => router.push('/settings')} variant="secondary" style={styles.button} />
            <Button title="CREDITS" onPress={() => router.push('/credits')} variant="secondary" style={styles.button} />
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width, height },
  overlay: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  title: { fontSize: 64, fontWeight: 'bold', color: '#FF0080', textShadowColor: '#000', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10, marginBottom: 8, letterSpacing: 4 },
  subtitle: { fontSize: 18, color: '#00D4FF', marginBottom: 60, letterSpacing: 2 },
  buttonContainer: { width: '100%', maxWidth: 400, gap: 16 },
  button: { width: '100%' },
});
