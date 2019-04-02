import React from 'react';
import PropTypes from 'prop-types';
import {
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import typography from '../../styles/typography';

interface Props extends TextInputProps {
  value: string;
  placeholder?: string;
  crossedOut?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  multiline?: boolean;
}

interface State {
  height: number;
}

export default class TextBoxButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      height: 24,
    };
  }

  _updateSize = (event: LayoutChangeEvent) => {
    this.setState({
      height: event.nativeEvent.layout.height,
    });
  }

  render() {
    const {
      value,
      multiline,
      crossedOut,
      placeholder,
      style = {},
      textStyle = {},
      ...otherProps
    } = this.props;
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#fff', '#eee']}
          style={[
            styles.textBox,
            style,
            multiline ? {} : { paddingTop: Platform.OS === 'ios' ? 4 : 2 },
          ]}
        >
          <TextInput
            style={styles.textInput}
            editable={false}
            multiline={multiline}
            {...otherProps}
          >
            <Text style={[
              typography.text,
              styles.input,
              textStyle,
              multiline ? { height: this.state.height + 12 } : {},
              crossedOut ? {
                textDecorationLine: 'line-through',
                textDecorationStyle: 'solid',
                textDecorationColor: '#222',
              } : {},
              value ? { color: '#222' } : { color: '#aaa' },
            ]}
            onLayout={multiline ? this._updateSize : undefined}>
              { value || placeholder }
            </Text>
          </TextInput>
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#a8a8a8',
    overflow: 'hidden',
  },
  textBox: {
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: Platform.OS === 'ios' ? 4 : 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    paddingTop: 2,
    width: '100%',
    padding: 0,
    minHeight: 22,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  input: {
    color: '#222',
    width: '100%',
  },
});
