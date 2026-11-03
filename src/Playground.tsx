import { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { ShaderCanvas } from './ShaderCanvas';
import type { ShaderDef, Uniform } from './shaders';

const { width: SCREEN } = Dimensions.get('window');
const TRACK = SCREEN - 48;

interface Props {
  shader: ShaderDef;
  time: SharedValue<number>;
  onClose: () => void;
}

export function Playground({ shader, time, onClose }: Props) {
  const values = useSharedValue(shader.uniforms.map((u) => u.default));
  const [labels, setLabels] = useState(shader.uniforms.map((u) => u.default));

  return (
    <View style={styles.root}>
      <ShaderCanvas effect={shader.effect} width={SCREEN} height={420} time={time} values={values} />
      <View style={styles.panel}>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{shader.name}</Text>
            <Text style={styles.tagline}>{shader.tagline}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </View>
        {shader.uniforms.map((u, i) => (
          <Slider
            key={u.key}
            uniform={u}
            index={i}
            values={values}
            label={labels[i] ?? u.default}
            onLabel={(v) => setLabels((prev) => prev.map((p, j) => (j === i ? v : p)))}
          />
        ))}
        <Pressable
          onPress={() => {
            values.value = shader.uniforms.map((u) => u.default);
            setLabels(shader.uniforms.map((u) => u.default));
          }}
          style={styles.reset}
        >
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Slider({ uniform, index, values, label, onLabel }: { uniform: Uniform; index: number; values: SharedValue<number[]>; label: number; onLabel: (v: number) => void }) {
  const fraction = useSharedValue((uniform.default - uniform.min) / (uniform.max - uniform.min));
  const pan = usePanGesture({
    onBegin: (e) => {
      'worklet';
      fraction.value = Math.min(1, Math.max(0, e.x / TRACK));
      const v = uniform.min + fraction.value * (uniform.max - uniform.min);
      const next = values.value.slice();
      next[index] = v;
      values.value = next;
    },
    onUpdate: (e) => {
      'worklet';
      fraction.value = Math.min(1, Math.max(0, e.x / TRACK));
      const v = uniform.min + fraction.value * (uniform.max - uniform.min);
      const next = values.value.slice();
      next[index] = v;
      values.value = next;
    },
    onFinalize: () => {
      'worklet';
      runOnJS(onLabel)(uniform.min + fraction.value * (uniform.max - uniform.min));
    },
  });
  const fill = useAnimatedStyle(() => ({ width: fraction.value * TRACK }));
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: fraction.value * TRACK - 10 }] }));
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>{uniform.label}</Text>
        <Text style={styles.sliderValue}>{label.toFixed(2)}</Text>
      </View>
      <GestureDetector gesture={pan}>
        <View style={styles.track}>
          <View style={styles.rail} />
          <Animated.View style={[styles.fill, fill]} />
          <Animated.View style={[styles.thumb, thumb]} />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07080B' },
  panel: { flex: 1, padding: 24, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { color: '#F3F4F6', fontSize: 24, fontWeight: '800' },
  tagline: { color: '#9AA0AB', fontSize: 13, marginTop: 2 },
  close: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#1C1F26' },
  closeText: { color: '#F3F4F6', fontWeight: '700' },
  sliderRow: { gap: 6 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { color: '#D1D5DB', fontSize: 13 },
  sliderValue: { color: '#9AA0AB', fontSize: 13, fontVariant: ['tabular-nums'] },
  track: { height: 28, justifyContent: 'center', backgroundColor: 'transparent' },
  rail: { position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3, backgroundColor: '#262A33' },
  fill: { position: 'absolute', left: 0, height: 6, borderRadius: 3, backgroundColor: '#6C8CFF' },
  thumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  reset: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#1C1F26', marginTop: 4 },
  resetText: { color: '#F3F4F6', fontWeight: '600' },
});
