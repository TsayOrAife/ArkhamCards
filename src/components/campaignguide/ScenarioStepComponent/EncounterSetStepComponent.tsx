import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { flatMap, forEach, map, sortBy } from 'lodash';
import { connect } from 'react-redux';
import { msgid, ngettext } from 'ttag';

import { AppState } from '@reducers';
import { stringList } from '@lib/stringHelper';
import SetupStepWrapper from '../SetupStepWrapper';
import connectDb from '@components/data/connectDb';
import Database from '@data/Database';
import { EncounterSetsStep } from '@data/scenario/types';
import EncounterSet from '@data/EncounterSet';
import EncounterIcon from '@icons/EncounterIcon';
import CampaignGuideTextComponent from '../CampaignGuideTextComponent';
import space from '@styles/space';
import COLORS from '@styles/colors';

interface OwnProps {
  step: EncounterSetsStep;
}

interface Data {
  encounterSets: EncounterSet[];
}

interface ReduxProps {
  alphabetizeEncounterSets: boolean;
}

type Props = OwnProps & Data & ReduxProps;

class EncounterSetStepComponent extends React.Component<Props> {
  encounterSets() {
    const { encounterSets, alphabetizeEncounterSets } = this.props;
    if (alphabetizeEncounterSets) {
      return sortBy(encounterSets, set => set.name);
    }
    return encounterSets;
  }

  render() {
    const { step } = this.props;
    const encounterSets = this.encounterSets();
    const encounterSetString = stringList(map(encounterSets, set => set ? `<i>${set.name}</i>` : 'Missing Set Name'));
    const leadText = step.aside ?
      ngettext(
        msgid`Set the ${encounterSetString} encounter set aside, out of play.`,
        `Set the ${encounterSetString} encounter sets aside, out of play.`,
        encounterSets.length
      ) :
      ngettext(
        msgid`Gather all cards from the ${encounterSetString} encounter set.`,
        `Gather all cards from the following encounter sets: ${encounterSetString}.`,
        encounterSets.length
      );
    const startText = step.text || leadText;
    const text =
    ngettext(msgid`${startText} This set is indicated by the following icon:`,
      `${startText} These sets are indicated by the following icons:`,
      encounterSets.length);
    return (
      <SetupStepWrapper bulletType={step.bullet_type}>
        <CampaignGuideTextComponent text={text} />
        <SetupStepWrapper bulletType={step.bullet_type} reverseSpacing>
          <View style={[styles.iconPile, space.marginTopM, space.marginBottomS]}>
            { map(encounterSets, set => !!set && (
              <View style={[space.marginSideS, space.marginBottomM]} key={set.code}>
                <EncounterIcon
                  encounter_code={set.code}
                  size={48}
                  color={COLORS.darkText}
                />
              </View>
            )) }
          </View>
        </SetupStepWrapper>
        { !!step.subtext && (
          <CampaignGuideTextComponent text={step.subtext} />
        ) }
      </SetupStepWrapper>
    );
  }
}

function mapStateToProps(state: AppState): ReduxProps {
  return {
    alphabetizeEncounterSets: state.settings.alphabetizeEncounterSets || false,
  };
}

export default connectDb<OwnProps, Data, string[]>(
  connect<ReduxProps, unknown, OwnProps, AppState>(mapStateToProps)(EncounterSetStepComponent),
  (props: OwnProps) => props.step.encounter_sets,
  async(db: Database, encounter_sets: string[]) => {
    const qb = await db.encounterSets();
    const allEncounterSets = await qb.createQueryBuilder().whereInIds(encounter_sets).getMany();
    const setsByCode: { [code: string]: EncounterSet } = {};
    forEach(allEncounterSets, encounterSet => {
      setsByCode[encounterSet.code] = encounterSet;
    });
    const encounterSets = flatMap(
      encounter_sets,
      code => setsByCode[code]
    );
    return {
      encounterSets,
    };
  }
);

const styles = StyleSheet.create({
  iconPile: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
});
