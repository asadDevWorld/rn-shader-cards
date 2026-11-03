import { Canvas, Fill, Shader, type SkRuntimeEffect } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

interface Props {
  effect: SkRuntimeEffect;
  width: number;
  height: number;
  time: SharedValue<number>;
  values: SharedValue<number[]>;
}

/** Fills a canvas with a runtime effect driven by time and four tunable values. */
export function ShaderCanvas({ effect, width, height, time, values }: Props) {
  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: time.value,
    u0: values.value[0] ?? 0,
    u1: values.value[1] ?? 0,
    u2: values.value[2] ?? 0,
    u3: values.value[3] ?? 0,
  }));
  return (
    <Canvas style={{ width, height }} pointerEvents="none">
      <Fill>
        <Shader source={effect} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}
