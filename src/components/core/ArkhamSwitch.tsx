import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { TouchableOpacity as GestureHandlerTouchableOpacity } from 'react-native-gesture-handler';

import StyleContext, { StyleContextType } from '@styles/StyleContext';
import AppIcon from '@icons/AppIcon';

interface Props extends TouchableOpacityProps {
  useGestureHandler?: boolean;
  value: boolean;
  onValueChange: (checked: boolean) => void;
  accessibilityLabel?: string;
}
export default class ArkhamSwitch extends React.Component<Props> {
  static contextType = StyleContext;
  context!: StyleContextType;

  _onPress = () => {
    const { value, onValueChange } = this.props;
    onValueChange(!value);
  }
  render() {
    const { value, onValueChange, accessibilityLabel, disabled, useGestureHandler, ...props } = this.props;
    const { colors } = this.context;
    const TouchableComponent = useGestureHandler ? GestureHandlerTouchableOpacity : TouchableOpacity;
    return (
      <TouchableComponent
        onPress={this._onPress}
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ checked: value }}
        disabled={disabled} {...props}
      >
        <View style={styles.icon}>
          <AppIcon size={28} name="check-circle" color={disabled ? colors.L20 : colors.L10} />
          { !!value && (
            <View style={styles.check}>
              <AppIcon size={20} name="check" color={disabled ? colors.L20 : colors.M} />
            </View>
          )}
        </View>
      </TouchableComponent>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 32,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  check: {
    position: 'absolute',
    top: 2,
    right: 3,
  },
});

