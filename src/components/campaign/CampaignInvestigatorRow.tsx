import React from 'react';
import { filter, find, map } from 'lodash';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import { Campaign, Deck } from '@actions/types';
import { BODY_OF_A_YITHIAN } from '@app_constants';
import InvestigatorImage from '@components/core/InvestigatorImage';
import withPlayerCards, { PlayerCardProps } from '@components/core/withPlayerCards';
import { getDecks, getLatestCampaignDeckIds, AppState } from '@reducers';
import { s } from '@styles/space';

interface OwnProps {
  campaigns: Campaign[];
}

interface CampaignDecks {
  campaign: Campaign;
  decks: Deck[];
}

interface ReduxProps {
  campaignDecks: CampaignDecks[];
}

type Props = OwnProps & ReduxProps & PlayerCardProps;

class CampaignInvestigatorRow extends React.Component<Props> {
  _renderInvestigator = (
    code: string,
    campaign: Campaign,
    deck?: Deck
  ) => {
    const {
      investigators,
    } = this.props;
    const { investigatorData } = campaign;
    const card = investigators[code];
    if (card) {
      const killedOrInsane = card.eliminated(investigatorData[code]);
      const yithian = !!find(investigatorData.storyAssets || [], asset => asset === BODY_OF_A_YITHIAN) ||
        (deck && (deck.slots[BODY_OF_A_YITHIAN] || 0) > 0);
      return (
        <View key={card.code} style={styles.investigator}>
          <InvestigatorImage
            card={card}
            killedOrInsane={killedOrInsane}
            yithian={yithian}
            border
            small
          />
        </View>
      );
    }
    return null;
  };

  _renderDeck = (deck: Deck, campaign: Campaign) => {
    if (deck && deck.investigator_code) {
      return this._renderInvestigator(deck.investigator_code, campaign, deck);
    }
    return null;
  };

  render() {
    const {
      campaignDecks,
    } = this.props;
    return map(campaignDecks, ({ campaign, decks }) => {
      const deckInvestigators = new Set(map(decks, deck => deck.investigator_code));
      return (
        <View key={campaign.id} style={styles.row}>
          { map(decks, deck => this._renderDeck(deck, campaign)) }
          { map(
            filter(
              campaign.nonDeckInvestigators || [],
              code => !deckInvestigators.has(code)
            ),
            code => this._renderInvestigator(code, campaign)
          ) }
        </View>
      );
    });
  }
}

function mapStateToProps(state: AppState, props: OwnProps): ReduxProps {
  return {
    campaignDecks: map(props.campaigns, campaign => {
      const latestDeckIds = getLatestCampaignDeckIds(state, campaign);
      return {
        campaign,
        decks: getDecks(state, latestDeckIds),
      };
    }),
  };
}

class PlaceholderCampaignInvestigatorRow extends React.Component<OwnProps & ReduxProps> {
  renderPlaceholder(id: number | string) {
    return (
      <View key={id} style={styles.investigator}>
        <InvestigatorImage
          border
          small
        />
      </View>
    );
  }
  render() {
    const {
      campaignDecks,
    } = this.props;
    return map(campaignDecks, ({ campaign, decks }) => {
      const deckInvestigators = new Set(map(decks, deck => deck.investigator_code));
      return (
        <View key={campaign.id} style={styles.row}>
          { map(decks, deck => this.renderPlaceholder(deck.id)) }
          { map(
            filter(
              campaign.nonDeckInvestigators || [],
              code => !deckInvestigators.has(code)
            ),
            code => this.renderPlaceholder(code)
          ) }
        </View>
      );
    });
  }
}

export default connect(mapStateToProps)(
  withPlayerCards(
    CampaignInvestigatorRow,
    PlaceholderCampaignInvestigatorRow
  )
);

const styles = StyleSheet.create({
  row: {
    marginTop: s,
    minHeight: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  investigator: {
    marginRight: s,
    marginBottom: s,
  },
});
