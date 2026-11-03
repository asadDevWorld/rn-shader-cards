# Shader Cards

Five live Skia shaders on a 3D card carousel, with a playground to tune each one. Aurora, plasma, fractal glass, a Fibonacci spiral and metaballs, all written as SkSL runtime effects and driven by a frame clock on the UI thread. Scroll the carousel and the cards tilt with a mirrored reflection; tap one and four sliders expose its uniforms live.

_Demo video coming soon._

## Run it

```bash
npm install
npx expo start
```

Expo SDK 58, React Native 0.88, React Native Skia 2, Reanimated 4, Gesture Handler 3.

## How it works

- `src/shaders/index.ts` holds the five effects. They share a header with hash, value noise, fbm and a cosine palette, and each takes `resolution`, `time` and four tunable floats.
- `src/ShaderCanvas.tsx` fills a canvas with one effect; the uniforms are a derived value, so changes never touch React.
- `src/Carousel.tsx` reads the scroll offset into a shared value and interpolates rotateY, scale and the reflection's opacity per card.
- `src/Playground.tsx` renders the effect full width with pan-driven sliders that write straight into the uniform array.

## Credits

Inspired by the shader demos by Enzo Mangano at reactiive.io. Shaders and code written from scratch for this app.

## License

MIT © Asad Ali
