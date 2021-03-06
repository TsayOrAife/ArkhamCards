import React from 'react';
import { flatMap, map, max, min } from 'lodash';
import {
  Text,
} from 'react-native';
import { t } from 'ttag';

import ArkhamButtonGroup from '@components/core/ArkhamButtonGroup';
import StyleContext, { StyleContextType } from '@styles/StyleContext';

interface Props {
  onFilterChange: (setting: string, value: any) => void;
  onToggleChange: (setting: string, value: boolean) => void;
  maxLevel: number;
  levels: [number, number];
  enabled: boolean;
  exceptional: boolean;
  nonExceptional: boolean;
}

export default class XpChooser extends React.Component<Props> {
  static contextType = StyleContext;
  context!: StyleContextType;

  levelRanges() {
    const {
      maxLevel,
    } = this.props;
    return [[0, 0], [1, maxLevel]];
  }

  _updateIndex = (indexes: number[]) => {
    const {
      onFilterChange,
      onToggleChange,
      maxLevel,
      enabled,
      exceptional,
      nonExceptional,
    } = this.props;
    const ranges = this.levelRanges();
    const selection = flatMap(indexes, idx => ranges[idx]);
    const level = indexes.length > 0 ? [min(selection), max(selection)] : [0, maxLevel];
    onFilterChange('level', level);
    if (indexes.length > 0) {
      if (!enabled) {
        onToggleChange('levelEnabled', true);
      }
    } else {
      if (enabled && !exceptional && !nonExceptional) {
        onToggleChange('levelEnabled', false);
      }
    }
    this.setState({
      levels: level,
    });
  };

  render() {
    const {
      levels,
      maxLevel,
      enabled,
    } = this.props;
    const { colors, typography } = this.context;

    if (maxLevel <= 1) {
      return null;
    }

    const selectedIndexes = flatMap(this.levelRanges(), (xyz, idx) => {
      if (enabled &&
          xyz[0] >= levels[0] && xyz[0] <= levels[1] &&
          xyz[1] >= levels[0] && xyz[1] <= levels[1]) {
        return [idx];
      }
      return [];
    });
    const buttons = map(this.levelRanges(), xyz => {
      const startXp = xyz[0];
      const endXp = xyz[1];
      const xp = startXp === endXp ?
        t`Level ${startXp}` :
        t`Level ${startXp} - ${endXp}`;
      return {
        element: (selected: boolean) => (<Text style={[typography.small, { color: selected ? colors.D20 : colors.L20 }]}>{ xp }</Text>),
      };
    });
    return (
      <ArkhamButtonGroup
        onPress={this._updateIndex}
        selectedIndexes={selectedIndexes}
        buttons={buttons}
      />
    );
  }
}
