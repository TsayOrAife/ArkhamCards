import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Brackets } from 'typeorm/browser';
import { t } from 'ttag';

import { Pack } from '@actions/types';
import EncounterIcon from '@icons/EncounterIcon';
import ArkhamSwitch from '@components/core/ArkhamSwitch';
import { PackCardsProps } from '@components/settings/PackCardsView';
import { s } from '@styles/space';
import StyleContext, { StyleContextType } from '@styles/StyleContext';

interface Props {
  componentId: string;
  pack: Pack;
  cycle: Pack[];
  setChecked?: (pack_code: string, checked: boolean) => void;
  setCycleChecked?: (cycle_code: string, checked: boolean) => void;
  checked?: boolean;
  whiteBackground?: boolean;
  baseQuery?: Brackets;
  compact?: boolean;
  nameOverride?: string;
}

export default class PackRow extends React.Component<Props> {
  static contextType = StyleContext;
  context!: StyleContextType;

  _onPress = () => {
    const {
      pack,
      componentId,
      baseQuery,
    } = this.props;
    Navigation.push<PackCardsProps>(componentId, {
      component: {
        name: 'Pack',
        passProps: {
          pack_code: pack.code,
          baseQuery,
        },
        options: {
          topBar: {
            title: {
              text: pack.name,
            },
            backButton: {
              title: t`Back`,
            },
          },
        },
      },
    });
  };

  _onCheckPress = () => {
    const {
      pack,
      cycle,
      checked,
      setCycleChecked,
      setChecked,
    } = this.props;
    const value = !checked;
    setChecked && setChecked(pack.code, value);

    if (setCycleChecked &&
      pack.position === 1 &&
      pack.cycle_position < 50 &&
      pack.cycle_position > 1 &&
      cycle.length > 0
    ) {
      // This is the lead pack in a cycle.
      Alert.alert(
        value ? t`Mark entire cycle?` : t`Clear entire cycle?`,
        value ?
          t`Mark all packs in the ${pack.name} cycle?` :
          t`Clear all packs in the ${pack.name} cycle?`,
        [
          {
            text: t`No`,
          },
          { text: t`Yes`,
            onPress: () => {
              setCycleChecked(pack.code, value);
            },
          },
        ],
      );
    }
  };

  render() {
    const {
      pack,
      checked,
      setChecked,
      whiteBackground,
      compact,
      nameOverride,
    } = this.props;
    const { colors, fontScale, typography } = this.context;
    const mythosPack = true;
    const backgroundColor = (whiteBackground || mythosPack) ? colors.background : colors.L20;
    const iconSize = (mythosPack || compact) ? 24 : 28;
    const fontSize = ((mythosPack || compact) ? 16 : 22) * fontScale;
    const lineHeight = ((mythosPack || compact) ? 20 : 26) * fontScale;
    const rowHeight = mythosPack ? 50 : 60;
    return (
      <View style={[styles.row,
        { backgroundColor, height: rowHeight },
        compact ? {
          height: lineHeight * fontScale + 20,
        } : {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: colors.divider,
        },
      ]}>
        <TouchableOpacity style={styles.touchable} onPress={this._onPress}>
          <View style={styles.touchableContent}>
            <View style={styles.icon}>
              <EncounterIcon
                encounter_code={pack.code}
                size={iconSize}
                color={colors.darkText}
              />
            </View>
            <Text
              style={[typography.large, { color: colors.darkText, fontSize, lineHeight }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              { nameOverride || pack.name }
            </Text>
          </View>
        </TouchableOpacity>
        { !!setChecked && (
          <View style={[styles.checkbox, { height: rowHeight }]}>
            <ArkhamSwitch
              value={!!checked}
              onValueChange={this._onCheckPress}
            />
          </View>
        ) }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  touchable: {
    height: 50,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  touchableContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  icon: {
    marginLeft: s,
    width: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    marginRight: s,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
