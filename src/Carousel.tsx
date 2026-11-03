import { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { ShaderCanvas } from './ShaderCanvas';
import { SHADERS, type ShaderDef } from './shaders';

const { width: SCREEN } = Dimensions.get('window');
export const CARD_W = 300;
export const CARD_H = 420;
const SPACING = 16;
const STEP = CARD_W + SPACING;
const SIDE = (SCREEN - CARD_W) / 2;

interface Props {
  time: SharedValue<number>;
  onOpen: (shader: ShaderDef) => void;
}

export function Carousel({ time, onOpen }: Props) {
  const x = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      x.value = e.contentOffset.x;
    },
  });
  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={STEP}
      decelerationRate="fast"
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingHorizontal: SIDE, gap: SPACING, paddingVertical: 20 }}
    >
      {SHADERS.map((shader, i) => (
        <Card key={shader.id} shader={shader} index={i} x={x} time={time} onOpen={onOpen} />
      ))}
    </Animated.ScrollView>
  );
}

function Card({ shader, index, x, time, onOpen }: { shader: ShaderDef; index: number; x: SharedValue<number>; time: SharedValue<number>; onOpen: (s: ShaderDef) => void }) {
  const [values] = useState(() => shader.uniforms.map((u) => u.default));
  const valuesSv = useSharedValue(values);
  const input = [(index - 1) * STEP, index * STEP, (index + 1) * STEP];

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(x.value, input, [25, 0, -25], Extrapolation.CLAMP)}deg` },
      { scale: interpolate(x.value, input, [0.9, 1, 0.9], Extrapolation.CLAMP) },
    ],
  }));
  const reflectionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, input, [0.1, 0.35, 0.1], Extrapolation.CLAMP),
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(x.value, input, [25, 0, -25], Extrapolation.CLAMP)}deg` },
      { scaleY: -0.6 },
      { scale: interpolate(x.value, input, [0.9, 1, 0.9], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={styles.slot}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
            onOpen(shader);
          }}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={`${shader.name} shader`}
        >
          <ShaderCanvas effect={shader.effect} width={CARD_W} height={CARD_H} time={time} values={valuesSv} />
          <View style={styles.caption}>
            <Text style={styles.name}>{shader.name}</Text>
            <Text style={styles.tagline}>{shader.tagline}</Text>
          </View>
        </Pressable>
      </Animated.View>
      <Animated.View style={[styles.card, styles.reflection, reflectionStyle]} pointerEvents="none">
        <ShaderCanvas effect={shader.effect} width={CARD_W} height={CARD_H} time={time} values={valuesSv} />
        <View style={styles.reflectionFade} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { width: CARD_W, height: CARD_H + CARD_H * 0.6 + 8 },
  card: { width: CARD_W, height: CARD_H, borderRadius: 26, overflow: 'hidden', backgroundColor: '#111' },
  reflection: { position: 'absolute', top: CARD_H + 8 },
  reflectionFade: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(7,8,11,0.35)' },
  caption: { position: 'absolute', left: 20, right: 20, bottom: 20 },
  name: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 8 },
  tagline: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
});
