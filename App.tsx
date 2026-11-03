import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Carousel } from './src/Carousel';
import { Playground } from './src/Playground';
import { useClock } from './src/useClock';
import type { ShaderDef } from './src/shaders';

function Root() {
  const insets = useSafeAreaInsets();
  const time = useClock();
  const [open, setOpen] = useState<ShaderDef | null>(null);
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      {open ? (
        <Playground shader={open} time={time} onClose={() => setOpen(null)} />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Shader Cards</Text>
            <Text style={styles.subtitle}>Five live Skia shaders. Tap a card to tune it.</Text>
          </View>
          <Carousel time={time} onOpen={setOpen} />
        </>
      )}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Root />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#07080B' },
  header: { paddingHorizontal: 24, paddingTop: 12, marginBottom: 4 },
  title: { color: '#F3F4F6', fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: '#9AA0AB', fontSize: 14, marginTop: 4 },
});
