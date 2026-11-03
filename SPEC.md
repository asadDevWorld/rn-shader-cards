# shader-cards: behaviour spec

Written from the behaviour of four earlier demos (a shader card carousel with reflections, a fractal
glass effect, and two Fibonacci shader patterns) and from what a shader showcase should be. Built from
this document, with shaders written from scratch.

## Goal

A horizontal carousel of cards, each filled with a live Skia shader: aurora, plasma, fractal glass over a
gradient, a Fibonacci spiral of dots, and a metaball field. Cards tilt in 3D as they scroll and reflect
below. A playground screen exposes each shader's uniforms as sliders so the effect can be tuned live.

## Screens

1. Carousel: pager of five cards, 300 x 420, centred with the neighbours peeking. Scroll position drives
   rotateY (±25 degrees), scale (0.9 to 1) and a mirrored reflection under each card that fades out.
   Tap a card to open its playground.
2. Playground: the shader fills the top half; sliders for its uniforms (speed, scale, two colours'
   hue, intensity); a reset button; the FPS shown in a corner.

## Shaders (SkSL runtime effects)

- Aurora: layered sine waves with domain warping, colours from a two-hue palette.
- Plasma: classic sum of sines, time-animated, with a vignette.
- Fractal glass: a gradient background seen through a fractal noise refraction (fbm) and a blur-like
  smear, with a glossy highlight band.
- Fibonacci: golden-angle spiral of dots whose radius pulses with time; a scale uniform changes the
  count.
- Metaballs: four balls moving on Lissajous paths, thresholded field with soft edges.

All shaders take `resolution`, `time`, and up to four tunable uniforms. Time comes from a frame
callback on the UI thread.

## Not in scope

Persisting settings, exporting images.
