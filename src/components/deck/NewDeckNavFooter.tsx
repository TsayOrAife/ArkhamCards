import React, { useContext, useMemo } from 'react';
import DeviceInfo from 'react-native-device-info';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { t } from 'ttag';

import AppIcon from '@icons/AppIcon';
import space, { isBig, m, s, xs } from '@styles/space';
import StyleContext from '@styles/StyleContext';
import RoundButton from '@components/core/RoundButton';
import { useParsedDeck } from '@components/deck/hooks';
import { useAdjustXpDialog, useSaveDialog } from '@components/deck/dialogs';
import { Campaign } from '@actions/types';

const NOTCH_BOTTOM_PADDING = DeviceInfo.hasNotch() ? 20 : 0;

export const FOOTER_HEIGHT = (56 * (isBig ? 1.2 : 1));

interface Props {
  componentId: string;
  deckId: number;
  controls?: React.ReactNode;
  mode: 'editing' | 'upgrading';
  control: 'fab' | 'counts';
  campaign?: Campaign;
}

export default function NewDeckNavFooter({
  componentId,
  deckId,
  control,
  campaign,
  mode,
}: Props) {
  const { colors, typography } = useContext(StyleContext);
  const parsedDeckObj = useParsedDeck(deckId, 'NavFooter', componentId);
  const { savingDialog, saveEdits, hasPendingEdits } = useSaveDialog(parsedDeckObj, campaign);
  const { showXpAdjustmentDialog, xpAdjustmentDialog } = useAdjustXpDialog(parsedDeckObj);
  const { deck, parsedDeck, editable } = parsedDeckObj;
  const xpString = useMemo(() => {
    if (!parsedDeck) {
      return [undefined, undefined];
    }
    if (parsedDeck.deck.previous_deck) {
      const adjustedXp = parsedDeck.availableExperience;
      const spentXP = (parsedDeck.changes?.spentXp || 0);
      return t`${spentXP} of ${adjustedXp} XP spent`;
    }
    const adjustedXp = parsedDeck.experience;
    return t`${adjustedXp} XP`;
  }, [parsedDeck]);

  const xpLine = useMemo(() => {
    if (!editable || !deck || !deck.previous_deck) {
      return (
        <Text style={[typography.button, typography.bold, typography.inverted]} allowFontScaling={false}>
          { xpString }
        </Text>
      );
    }
    return (
      <TouchableOpacity onPress={showXpAdjustmentDialog}>
        <View style={styles.row}>
          <Text style={[typography.button, typography.bold, typography.inverted]} allowFontScaling={false}>
            { xpString }
          </Text>
          <View style={space.marginLeftS}>
            <AppIcon
              size={14}
              color={colors.M}
              name="edit"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [editable, xpString, deck, showXpAdjustmentDialog, typography, colors]);
  return (
    <>
      <View style={[styles.marginWrapper, { paddingRight: m + (control === 'fab' ? (FOOTER_HEIGHT + m) : (FOOTER_HEIGHT * 2 + m)) }]}>
        <View style={[styles.content, { backgroundColor: colors.D10 }]}>
          { hasPendingEdits ? (
            <View>
              <RoundButton
                onPress={saveEdits}
                size={FOOTER_HEIGHT - 16}
                margin={8}
              >
                <AppIcon
                  size={24}
                  color={colors.M}
                  name="check"
                />
              </RoundButton>
            </View>
          ) : (
            <View style={space.paddingLeftL} />
          ) }
          <View style={styles.left}>
            <Text style={[typography.smallLabel, typography.italic, typography.inverted]} allowFontScaling={false}>
              { mode === 'editing' ? t`Editing` : t`Upgrading` }
            </Text>
            { xpLine }
          </View>
        </View>
      </View>
      { savingDialog }
      { xpAdjustmentDialog }
    </>
  );
}

const styles = StyleSheet.create({
  marginWrapper: {
    position: 'absolute',
    height: FOOTER_HEIGHT + s * 2,
    width: '100%',
    padding: s + xs,
    bottom: NOTCH_BOTTOM_PADDING + s,
    left: 0,
    backgroundColor: 'transparent',
  },
  content: {
    height: FOOTER_HEIGHT,
    borderTopLeftRadius: FOOTER_HEIGHT / 2,
    borderTopRightRadius: FOOTER_HEIGHT / 2,
    borderBottomLeftRadius: FOOTER_HEIGHT / 2,
    borderBottomRightRadius: FOOTER_HEIGHT / 2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  left: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

