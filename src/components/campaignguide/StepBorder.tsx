import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import AppIcon from '@icons/AppIcon';
import StyleContext from '@styles/StyleContext';

interface Props {
  type: 'top' | 'bottom';
  width: number;
  margin: number;
}

const SCALE = 0.1;
export default function StepBorder({ type, width, margin }: Props) {
  const { colors } = useContext(StyleContext);
  const lineWidth = width * (1 - 2.3 * SCALE) - margin * 2;
  return (
    <View style={styles.wrapper}>
      { type === 'top' ? (
        <>
          <View style={[styles.topLeft, { left: margin }]}>
            <AppIcon size={width * SCALE} color={colors.scenarioGreen} name="fleur_top_left" />
          </View>
          <View style={[styles.topLine, { backgroundColor: colors.scenarioGreen, width: lineWidth, left: (width - lineWidth) / 2 }]} />
          <View style={[styles.topRight, { right: margin }]}>
            <AppIcon size={width * SCALE} color={colors.scenarioGreen} name="fleur_top_right" />
          </View>
        </>
      ) : (
        <>
          <View style={[styles.bottomLeft, { left: margin }]}>
            <AppIcon size={width * SCALE} color={colors.scenarioGreen} name="fleur_bottom_left" />
          </View>
          <View style={[styles.bottomLine, { backgroundColor: colors.scenarioGreen, width: lineWidth, left: (width - lineWidth) / 2 }]} />
          <View style={[styles.bottomRight, { right: margin }]}>
            <AppIcon size={width * SCALE} color={colors.scenarioGreen} name="fleur_bottom_right" />
          </View>
        </>
      ) }
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '100%',
  },
  topLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topLine: {
    position: 'absolute',
    top: 2,
    height: 2,
  },
  bottomLine: {
    position: 'absolute',
    bottom: 1,
    height: 2,
  },
  topRight: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});
