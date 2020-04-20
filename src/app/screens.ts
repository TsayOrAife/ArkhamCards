import { Navigation } from 'react-native-navigation';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import SearchMultiSelectView from 'components/cardlist/SearchMultiSelectView';
import EditSpecialDeckCardsView from 'components/deck/EditSpecialDeckCardsView';
import CardSearchView from 'components/cardlist/CardSearchView';
import MythosButton from 'components/cardlist/CardSearchComponent/MythosButton';
import TuneButton from 'components/cardlist/CardSearchComponent/TuneButton';
import SortButton from 'components/cardlist/CardSearchComponent/SortButton';
import CardDetailView from 'components/card/CardDetailView';
import CardDetailSwipeView from 'components/card/CardDetailSwipeView';
import CardFaqView from 'components/card/CardFaqView';
import CardTabooView from 'components/card/CardTabooView';
import CardImageView from 'components/card/CardImageView';
import InvestigatorCardsView from 'components/cardlist/InvestigatorCardsView';
import AddScenarioResultView from 'components/campaign/AddScenarioResultView';
import CampaignGuideView from 'components/campaignguide/CampaignGuideView';
import LinkedCampaignGuideView from 'components/campaignguide/LinkedCampaignGuideView';
import LocationSetupView from 'components/campaignguide/LocationSetupView';
import CampaignLogView from 'components/campaignguide/CampaignLogView';
import ScenarioView from 'components/campaignguide/ScenarioView';
import CardSelectorView from 'components/campaignguide/CardSelectorView';
import GuideChaosBagView from 'components/campaignguide/GuideChaosBagView';
import UpgradeDecksView from 'components/campaign/UpgradeDecksView';
import EditScenarioResultView from 'components/campaign/EditScenarioResultView';
import CampaignDetailView from 'components/campaign/CampaignDetailView';
import CampaignEditWeaknessDialog from 'components/campaign/CampaignEditWeaknessDialog';
import CampaignDrawWeaknessDialog from 'components/campaign/CampaignDrawWeaknessDialog';
import CampaignDifficultyDialog from 'components/campaign/CampaignDifficultyDialog';
import EditChaosBagDialog from 'components/campaign/EditChaosBagDialog';
import MyCampaignsView from 'components/campaign/MyCampaignsView';
import NewCampaignView from 'components/campaign/NewCampaignView';
import SelectCampaignDialog from 'components/campaign/SelectCampaignDialog';
import MyDecksSelectorDialog from 'components/campaign/MyDecksSelectorDialog';
import CardUpgradeDialog from 'components/deck/CardUpgradeDialog';
import CampaignScenarioView from 'components/campaign/CampaignScenarioView';
import CampaignChaosBagView from 'components/campaign/CampaignChaosBagView';
import OddsCalculatorView from 'components/campaign/OddsCalculatorView';
import MyDecksView from 'components/decklist/MyDecksView';
import NewDeckView from 'components/deck/NewDeckView';
import NewDeckOptionsDialog from 'components/deck/NewDeckOptionsDialog';
import DeckDetailView from 'components/deck/DeckDetailView';
import DeckEditView from 'components/deck/DeckEditView';
import DrawSimulatorView from 'components/deck/DrawSimulatorView';
import DeckChartsView from 'components/deck/DeckChartsView';
import DeckHistoryView from 'components/deck/DeckHistoryView';
import DeckDescriptionView from 'components/deck/DeckDescriptionView';
import DeckUpgradeDialog from 'components/deck/DeckUpgradeDialog';
import CardFilterView from 'components/filter/CardFilterView';
import CardEnemyFilterView from 'components/filter/CardEnemyFilterView';
import CardLocationFilterView from 'components/filter/CardLocationFilterView';
import PackFilterView from 'components/filter/PackFilterView';
import DiagnosticsView from 'components/settings/DiagnosticsView';
import CollectionEditView from 'components/settings/CollectionEditView';
import SettingsView from 'components/settings/SettingsView';
import PackCardsView from 'components/settings/PackCardsView';
import SpoilersView from 'components/settings/SpoilersView';
import CardSortDialog from 'components/cardlist/CardSortDialog';
import InvestigatorSortDialog from 'components/cardlist/InvestigatorSortDialog';
import ScenarioDialog from 'components/campaign/ScenarioDialog';
import ExileCardDialog from 'components/campaign/ExileCardDialog';
import AboutView from 'components/settings/AboutView';
import WeaknessDrawDialog from 'components/weakness/WeaknessDrawDialog';
import SealTokenDialog from 'components/campaign/SealTokenDialog';

// register all screens of the app (including internal ones)
export function registerScreens(Provider: any, store: any) {
  Navigation.registerComponentWithRedux('About', () => AboutView, Provider, store);
  Navigation.registerComponentWithRedux('Browse.Cards', () => CardSearchView, Provider, store);
  Navigation.registerComponentWithRedux('Browse.InvestigatorCards', () => InvestigatorCardsView, Provider, store);
  Navigation.registerComponentWithRedux('Deck', () => DeckDetailView, Provider, store);
  Navigation.registerComponentWithRedux('Deck.Charts', () => DeckChartsView, Provider, store);
  Navigation.registerComponentWithRedux('Deck.History', () => DeckHistoryView, Provider, store);
  Navigation.registerComponentWithRedux('Deck.DrawSimulator', () => DrawSimulatorView, Provider, store);
  Navigation.registerComponentWithRedux('Deck.Description', () => DeckDescriptionView, Provider, store);
  Navigation.registerComponentWithRedux('Deck.Edit', () => DeckEditView, Provider, store);
  Navigation.registerComponentWithRedux('Deck.EditSpecial', () => EditSpecialDeckCardsView, Provider, store);
  Navigation.registerComponentWithRedux('Deck.Upgrade', () => DeckUpgradeDialog, Provider, store);
  Navigation.registerComponentWithRedux('Deck.New', () => NewDeckView, Provider, store);
  Navigation.registerComponentWithRedux('Deck.NewOptions', () => NewDeckOptionsDialog, Provider, store);
  Navigation.registerComponentWithRedux('Card', () => CardDetailView, Provider, store);
  Navigation.registerComponentWithRedux('Card.Swipe', () => CardDetailSwipeView, Provider, store);
  Navigation.registerComponentWithRedux('Card.Faq', () => CardFaqView, Provider, store);
  Navigation.registerComponentWithRedux('Card.Taboo', () => CardTabooView, Provider, store);
  Navigation.registerComponentWithRedux('Card.Image', () => CardImageView, Provider, store);
  Navigation.registerComponentWithRedux('My.Campaigns', () => MyCampaignsView, Provider, store);
  Navigation.registerComponentWithRedux('My.Decks', () => MyDecksView, Provider, store);
  Navigation.registerComponentWithRedux('Campaign', () => CampaignDetailView, Provider, store);
  Navigation.registerComponentWithRedux('Campaign.New', () => NewCampaignView, Provider, store);
  Navigation.registerComponentWithRedux('Campaign.AddResult', () => AddScenarioResultView, Provider, store);
  Navigation.registerComponentWithRedux('Guide.Campaign', () => gestureHandlerRootHOC(CampaignGuideView), Provider, store);
  Navigation.registerComponentWithRedux('Guide.LinkedCampaign', () => gestureHandlerRootHOC(LinkedCampaignGuideView), Provider, store);
  Navigation.registerComponentWithRedux('Guide.ChaosBag', () => GuideChaosBagView, Provider, store);
  Navigation.registerComponentWithRedux('Guide.Scenario', () => ScenarioView, Provider, store);
  Navigation.registerComponentWithRedux('Guide.Log', () => CampaignLogView, Provider, store);
  Navigation.registerComponentWithRedux('Guide.LocationSetup', () => LocationSetupView, Provider, store);
  Navigation.registerComponentWithRedux('Guide.CardSelector', () => CardSelectorView, Provider, store);
  Navigation.registerComponentWithRedux('Campaign.UpgradeDecks', () => UpgradeDecksView, Provider, store);
  Navigation.registerComponentWithRedux('Campaign.EditResult', () => EditScenarioResultView, Provider, store);
  Navigation.registerComponentWithRedux('Campaign.Scenarios', () => CampaignScenarioView, Provider, store);
  Navigation.registerComponentWithRedux('Campaign.ChaosBag', () => CampaignChaosBagView, Provider, store);
  Navigation.registerComponentWithRedux('OddsCalculator', () => OddsCalculatorView, Provider, store);
  Navigation.registerComponentWithRedux('Settings', () => SettingsView, Provider, store);
  Navigation.registerComponentWithRedux('Settings.Diagnostics', () => DiagnosticsView, Provider, store);
  Navigation.registerComponentWithRedux('SearchFilters', () => CardFilterView, Provider, store);
  Navigation.registerComponentWithRedux('SearchFilters.Enemy', () => CardEnemyFilterView, Provider, store);
  Navigation.registerComponentWithRedux('SearchFilters.Location', () => CardLocationFilterView, Provider, store);
  Navigation.registerComponentWithRedux('SearchFilters.Packs', () => PackFilterView, Provider, store);
  Navigation.registerComponentWithRedux('SearchFilters.Chooser', () => SearchMultiSelectView, Provider, store);
  Navigation.registerComponentWithRedux('My.Collection', () => CollectionEditView, Provider, store);
  Navigation.registerComponentWithRedux('Pack', () => PackCardsView, Provider, store);
  Navigation.registerComponentWithRedux('My.Spoilers', () => SpoilersView, Provider, store);
  Navigation.registerComponentWithRedux('Dialog.CardUpgrade', () => CardUpgradeDialog, Provider, store);
  Navigation.registerComponentWithRedux('Dialog.DeckSelector', () => gestureHandlerRootHOC(MyDecksSelectorDialog), Provider, store);
  Navigation.registerComponentWithRedux('Dialog.EditChaosBag', () => EditChaosBagDialog, Provider, store);
  Navigation.registerComponentWithRedux('Dialog.ExileCards', () => ExileCardDialog, Provider, store);
  Navigation.registerComponentWithRedux('Dialog.Sort', () => CardSortDialog, Provider, store);
  Navigation.registerComponentWithRedux('Dialog.InvestigatorSort', () => InvestigatorSortDialog, Provider, store);
  Navigation.registerComponentWithRedux('Dialog.Scenario', () => ScenarioDialog, Provider, store);
  Navigation.registerComponentWithRedux('Dialog.Campaign', () => SelectCampaignDialog, Provider, store);
  Navigation.registerComponentWithRedux('Dialog.CampaignDifficulty', () => CampaignDifficultyDialog, Provider, store);
  Navigation.registerComponentWithRedux('Dialog.CampaignDrawWeakness', () => CampaignDrawWeaknessDialog, Provider, store);
  Navigation.registerComponentWithRedux('Dialog.CampaignEditWeakness', () => CampaignEditWeaknessDialog, Provider, store);
  Navigation.registerComponentWithRedux('Dialog.SealToken', () => SealTokenDialog, Provider, store);
  Navigation.registerComponentWithRedux('Weakness.Draw', () => WeaknessDrawDialog, Provider, store);
  Navigation.registerComponentWithRedux('SortButton', () => SortButton, Provider, store);
  Navigation.registerComponentWithRedux('TuneButton', () => TuneButton, Provider, store);
  Navigation.registerComponentWithRedux('MythosButton', () => MythosButton, Provider, store);
}
