import { useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

/** Seconds since mount, advanced every frame on the UI thread. */
export function useClock(): SharedValue<number> {
  const time = useSharedValue(0);
  useFrameCallback((frame) => {
    time.value += (frame.timeSincePreviousFrame ?? 16) / 1000;
  });
  return time;
}
