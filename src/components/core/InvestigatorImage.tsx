import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Sepia } from 'react-native-color-matrix-image-filters';

import { showCard, showCardImage } from '@components/nav/helper';
import { toggleButtonMode } from '@components/cardlist/CardSearchResult/constants';
import FactionIcon from '@icons/FactionIcon';
import Card from '@data/Card';
import { isBig } from '@styles/space';
import StyleContext, { StyleContextType } from '@styles/StyleContext';

const scaleFactor = isBig ? 1.2 : 1.0;

interface Props {
  card?: Card;
  componentId?: string;
  border?: boolean;
  small?: boolean;
  killedOrInsane?: boolean;
  yithian?: boolean;
  imageLink?: boolean;
}

export default class InvestigatorImage extends React.Component<Props> {
  static contextType = StyleContext;
  context!: StyleContextType;

  _onPress = () => {
    const {
      card,
      componentId,
      imageLink,
    } = this.props;
    const { colors } = this.context;
    if (componentId && card) {
      if (imageLink) {
        showCardImage(componentId, card, colors);
      } else {
        showCard(componentId, card.code, card, colors, true);
      }
    }
  };

  small() {
    const { small } = this.props;
    const { fontScale } = this.context;
    return small || toggleButtonMode(fontScale);
  }

  imageStyle() {
    const {
      yithian,
    } = this.props;
    if (yithian) {
      return this.small() ? styles.smallYithianImage : styles.bigImage;
    }
    return this.small() ? styles.image : styles.bigImage;
  }

  renderInvestigatorImage() {
    const {
      card,
      yithian,
    } = this.props;
    const { colors } = this.context;
    if (card) {
      return (
        <FastImage
          style={this.imageStyle()}
          source={{
            uri: `https://arkhamdb.com/${yithian ? 'bundles/cards/04244.jpg' : card.imagesrc}`,
          }}
          resizeMode="contain"
        />
      );
    }
    return (
      <View style={[this.imageStyle(), { backgroundColor: colors.L20 }]} />
    );
  }

  renderStyledImage() {
    const {
      killedOrInsane,
    } = this.props;
    if (killedOrInsane) {
      return (
        <Sepia>
          { this.renderInvestigatorImage() }
        </Sepia>
      );
    }
    return this.renderInvestigatorImage();
  }

  renderImage() {
    const {
      card,
      killedOrInsane,
      border,
    } = this.props;
    const { colors } = this.context;
    const small = this.small();
    const size = (small ? 65 : 110) * scaleFactor;
    if (!card) {
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={styles.relative}>
            { this.renderStyledImage()}
          </View>
          <View style={styles.relative}>
            { !!border && (
              <View style={[
                styles.border,
                {
                  borderColor: colors.faction.neutral.background,
                  width: size,
                  height: size,
                },
              ]} />
            ) }
          </View>
        </View>
      );
    }
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={styles.relative}>
          <View style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              backgroundColor: colors.faction[killedOrInsane ? 'dead' : card.factionCode()].background,
            },
          ]}>
            <Text style={styles.placeholderIcon} allowFontScaling={false}>
              <FactionIcon faction={card.factionCode()} defaultColor="#FFFFFF" size={small ? 40 : 55} />
            </Text>
          </View>
        </View>
        { !!card.imagesrc && (
          <View style={styles.relative}>
            { this.renderStyledImage() }
          </View>
        ) }
        <View style={styles.relative}>
          { !!border && (
            <View style={[
              styles.border,
              {
                borderColor: colors.faction[killedOrInsane ? 'dead' : card.factionCode()].background,
                width: size,
                height: size,
              },
            ]} />
          ) }
        </View>
      </View>
    );
  }

  render() {
    const { componentId, card } = this.props;
    if (componentId && card) {
      return (
        <TouchableOpacity onPress={this._onPress}>
          { this.renderImage() }
        </TouchableOpacity>
      );
    }
    return this.renderImage();
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 6,
  },
  relative: {
    position: 'relative',
  },
  smallYithianImage: {
    position: 'absolute',
    top: -36 * scaleFactor,
    left: -20 * scaleFactor,
    width: (166 + 24) * scaleFactor,
    height: (136 + 14) * scaleFactor,
  },
  image: {
    position: 'absolute',
    top: -36 * scaleFactor,
    left: -20 * scaleFactor,
    width: (166 + 44) * scaleFactor,
    height: (136 + 34) * scaleFactor,
  },
  bigImage: {
    position: 'absolute',
    top: -44 * scaleFactor,
    left: -20 * scaleFactor,
    width: (166 + 44) * 1.25 * scaleFactor,
    height: (136 + 34) * 1.25 * scaleFactor,
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  placeholderIcon: {
    textAlign: 'center',
  },
});
