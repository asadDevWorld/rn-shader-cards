import { Skia, type SkRuntimeEffect } from '@shopify/react-native-skia';

export interface Uniform {
  key: string;
  label: string;
  min: number;
  max: number;
  default: number;
}

export interface ShaderDef {
  id: string;
  name: string;
  tagline: string;
  effect: SkRuntimeEffect;
  uniforms: Uniform[];
}

const HEADER = `
uniform float2 resolution;
uniform float time;
uniform float u0;
uniform float u1;
uniform float u2;
uniform float u3;

float hash(float2 p) { return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453123); }

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + float2(1.0, 0.0)), u.x),
             mix(hash(i + float2(0.0, 1.0)), hash(i + float2(1.0, 1.0)), u.x), u.y);
}

float fbm(float2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + float2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

half3 palette(float t, float hueA, float hueB) {
  float3 a = float3(0.5);
  float3 b = float3(0.5);
  float3 c = float3(1.0);
  float3 d = float3(hueA, hueB, hueA * 0.5 + 0.33);
  return half3(a + b * cos(6.28318 * (c * t + d)));
}
`;

function make(src: string): SkRuntimeEffect {
  const effect = Skia.RuntimeEffect.Make(HEADER + src);
  if (!effect) {
    throw new Error('Shader failed to compile');
  }
  return effect;
}

export const SHADERS: ShaderDef[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    tagline: 'Domain-warped sine curtains',
    effect: make(`
half4 main(float2 pos) {
  float2 uv = pos / resolution;
  float t = time * u0;
  float2 p = uv * float2(3.0, 2.0);
  float warp = fbm(p + t * 0.3) * u1;
  float y = uv.y + sin(uv.x * 4.0 + t + warp * 3.0) * 0.12 + sin(uv.x * 9.0 - t * 1.3) * 0.04;
  float band = smoothstep(0.35, 0.5, y) * smoothstep(0.9, 0.55, y);
  float glow = exp(-abs(y - 0.55) * 6.0) * 0.6;
  half3 col = palette(uv.x * 0.6 + warp + t * 0.05, u2, u3) * (band + glow) * u1;
  col += half3(0.02, 0.03, 0.08) * (1.0 - uv.y);
  return half4(col, 1.0);
}`),
    uniforms: [
      { key: 'u0', label: 'Speed', min: 0, max: 2, default: 0.6 },
      { key: 'u1', label: 'Intensity', min: 0.2, max: 2, default: 1.1 },
      { key: 'u2', label: 'Hue A', min: 0, max: 1, default: 0.3 },
      { key: 'u3', label: 'Hue B', min: 0, max: 1, default: 0.6 },
    ],
  },
  {
    id: 'plasma',
    name: 'Plasma',
    tagline: 'Sum of sines with a vignette',
    effect: make(`
half4 main(float2 pos) {
  float2 uv = (pos / resolution - 0.5) * u1;
  float t = time * u0;
  float v = sin(uv.x * 6.0 + t) + sin((uv.y * 6.0 + t) * 0.7)
          + sin((uv.x * 4.0 + uv.y * 5.0 + t) * 0.5)
          + sin(length(uv * 8.0) - t * 1.5);
  half3 col = palette(v * 0.12 + t * 0.03, u2, u3);
  float vig = 1.0 - smoothstep(0.35, 0.8, length(pos / resolution - 0.5));
  return half4(col * vig, 1.0);
}`),
    uniforms: [
      { key: 'u0', label: 'Speed', min: 0, max: 3, default: 1 },
      { key: 'u1', label: 'Scale', min: 0.5, max: 4, default: 1.6 },
      { key: 'u2', label: 'Hue A', min: 0, max: 1, default: 0.0 },
      { key: 'u3', label: 'Hue B', min: 0, max: 1, default: 0.25 },
    ],
  },
  {
    id: 'glass',
    name: 'Fractal glass',
    tagline: 'A gradient seen through rippled glass',
    effect: make(`
half4 main(float2 pos) {
  float2 uv = pos / resolution;
  float t = time * u0;
  float n = fbm(uv * (6.0 * u1) + float2(t * 0.2, -t * 0.15));
  float2 refracted = uv + (n - 0.5) * 0.18 * u2;
  half3 base = palette(refracted.y * 0.9 + refracted.x * 0.3, 0.55, u3);
  float ridge = abs(fract(n * 6.0) - 0.5) * 2.0;
  float gloss = pow(1.0 - ridge, 8.0) * 0.5;
  float band = smoothstep(0.02, 0.0, abs(refracted.x - refracted.y * 0.6 - 0.35 + sin(t) * 0.1)) * 0.6;
  half3 col = base * (0.85 + ridge * 0.15) + half3(gloss + band);
  return half4(col, 1.0);
}`),
    uniforms: [
      { key: 'u0', label: 'Speed', min: 0, max: 2, default: 0.5 },
      { key: 'u1', label: 'Detail', min: 0.3, max: 3, default: 1 },
      { key: 'u2', label: 'Refraction', min: 0, max: 3, default: 1.2 },
      { key: 'u3', label: 'Hue', min: 0, max: 1, default: 0.8 },
    ],
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    tagline: 'Golden-angle spiral of breathing dots',
    effect: make(`
half4 main(float2 pos) {
  float2 uv = pos / resolution - 0.5;
  uv.x *= resolution.x / resolution.y;
  float t = time * u0;
  float count = 140.0 * u1;
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float best = 1.0;
  float idx = 0.0;
  for (int i = 0; i < 180; i++) {
    float fi = float(i);
    if (fi > count) { break; }
    float radius = sqrt(fi / count) * 0.62;
    float angle = fi * 2.39996 + t * 0.4;
    float2 c = float2(cos(angle), sin(angle)) * radius;
    float d = length(uv - c);
    if (d < best) { best = d; idx = fi; }
  }
  float size = 0.018 + 0.012 * sin(t * 2.0 + idx * 0.25) * u2;
  float dot = smoothstep(size, size - 0.006, best);
  half3 col = palette(idx / count + t * 0.05, u3, u3 + 0.3) * dot;
  col += half3(0.03, 0.03, 0.05) * (1.0 - r);
  return half4(col, 1.0);
}`),
    uniforms: [
      { key: 'u0', label: 'Speed', min: 0, max: 2, default: 0.7 },
      { key: 'u1', label: 'Count', min: 0.2, max: 1.2, default: 0.9 },
      { key: 'u2', label: 'Pulse', min: 0, max: 2, default: 1 },
      { key: 'u3', label: 'Hue', min: 0, max: 1, default: 0.1 },
    ],
  },
  {
    id: 'metaballs',
    name: 'Metaballs',
    tagline: 'Four blobs on Lissajous paths',
    effect: make(`
half4 main(float2 pos) {
  float2 uv = pos / resolution;
  uv.x *= resolution.x / resolution.y;
  float t = time * u0;
  float field = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float2 c = float2(0.5 * resolution.x / resolution.y + sin(t * (0.7 + fi * 0.21) + fi) * 0.28,
                      0.5 + cos(t * (0.9 + fi * 0.17) + fi * 2.0) * 0.3);
    float d = length(uv - c);
    field += (0.045 * u1) / (d * d + 0.001);
  }
  float edge = smoothstep(u2 - 0.4, u2 + 0.4, field);
  half3 col = palette(field * 0.08 + t * 0.03, u3, u3 + 0.4);
  half3 bg = half3(0.03, 0.03, 0.06);
  return half4(mix(bg, col, edge), 1.0);
}`),
    uniforms: [
      { key: 'u0', label: 'Speed', min: 0, max: 3, default: 1 },
      { key: 'u1', label: 'Size', min: 0.3, max: 3, default: 1 },
      { key: 'u2', label: 'Threshold', min: 0.5, max: 4, default: 2 },
      { key: 'u3', label: 'Hue', min: 0, max: 1, default: 0.5 },
    ],
  },
];
