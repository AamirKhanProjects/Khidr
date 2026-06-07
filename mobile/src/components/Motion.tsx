import { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

/**
 * Shared motion helpers. Keep it calm: smooth fades, gentle pulses, nothing
 * bouncy or jarring (no elastic/spring overshoot). See docs/product-spec.md §11.
 */

/** Fades children in with a small upward rise on mount. Use for screen content
 * and big content blocks so they arrive smoothly rather than popping in. */
export function FadeInView({
  children,
  style,
  delay = 0,
  duration = 320,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  delay?: number;
  duration?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style as ViewStyle, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

/**
 * A gentle confirmation "blink" for a big action succeeding (call logged, message
 * sent). Deliberately not too short: each cycle is ~700ms, repeated twice, so it
 * reads as a calm acknowledgement rather than a flicker. Pass `active`.
 */
export function Pulse({
  active,
  children,
  style,
  cycles = 2,
}: {
  active: boolean;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  cycles?: number;
}) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) return;
    opacity.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: cycles }
    ).start();
  }, [active]);

  return <Animated.View style={[style as ViewStyle, { opacity }]}>{children}</Animated.View>;
}
