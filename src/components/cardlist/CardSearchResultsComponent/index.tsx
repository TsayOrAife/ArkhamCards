import React, { ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { debounce } from 'throttle-debounce';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Brackets } from 'typeorm/browser';
import RegexEscape from 'regex-escape';
import { t } from 'ttag';

import {
  SORT_BY_ENCOUNTER_SET,
  SortType,
  Slots,
} from '@actions/types';
import ArkhamSwitch from '@components/core/ArkhamSwitch';
import CollapsibleSearchBox from '@components/core/CollapsibleSearchBox';
import FilterBuilder, { FilterState } from '@lib/filters';
import { MYTHOS_CARDS_QUERY, where, combineQueries, BASIC_QUERY, BROWSE_CARDS_QUERY, combineQueriesOpt } from '@data/query';
import Card from '@data/Card';
import { s, xs } from '@styles/space';
import ArkhamButton from '@components/core/ArkhamButton';
import StyleContext from '@styles/StyleContext';
import DbCardResultList from './DbCardResultList';

const DIGIT_REGEX = /^[0-9]+$/;

interface Props {
  componentId: string;
  baseQuery?: Brackets;
  mythosToggle?: boolean;
  showNonCollection?: boolean;
  selectedSort?: SortType;
  filters?: FilterState;
  mythosMode?: boolean;
  visible: boolean;
  toggleMythosMode: () => void;
  clearSearchFilters: () => void;
  tabooSetOverride?: number;

  investigator?: Card;
  originalDeckSlots?: Slots;
  deckCardCounts?: Slots;
  onDeckCountChange?: (code: string, count: number) => void;
  limits?: Slots;
  header?: React.ReactElement;
  renderFooter?: (slots?: Slots, controls?: React.ReactNode) => ReactNode;
  storyOnly?: boolean;

  initialSort?: SortType;
}

interface State {
  searchText: boolean;
  searchFlavor: boolean;
  searchBack: boolean;
  searchTerm?: string;
  searchCode?: number;
  searchQuery?: RegExp;
}

function searchOptionsHeight(fontScale: number) {
  return 20 + (fontScale * 20 + 8) * 3 + 12;
}

const FILTER_BUILDER = new FilterBuilder('filters');

interface SearchState {
  searchCode?: number;
  searchQuery?: RegExp;
}

function SearchOptions({
  searchText,
  searchFlavor,
  searchBack,
  toggleSearchText,
  toggleSearchFlavor,
  toggleSearchBack,
}: {
  searchText: boolean;
  searchFlavor: boolean;
  searchBack: boolean;
  toggleSearchText: () => void;
  toggleSearchFlavor: () => void;
  toggleSearchBack: () => void;
}) {
  const { colors, fontScale, typography } = useContext(StyleContext);
  return (
    <>
      <View style={[styles.column, { alignItems: 'center', flex: 1 }]}>
        <Text style={[typography.large, { color: colors.M, fontSize: 20 * fontScale, fontFamily: 'Alegreya-Bold' }]}>
          { t`Search in:` }
        </Text>
      </View>
      <View style={styles.column}>
        <View style={styles.row}>
          <Text style={[typography.searchLabel, styles.searchOption, typography.dark]}>
            { t`Game Text` }
          </Text>
          <ArkhamSwitch
            useGestureHandler
            value={searchText}
            onValueChange={toggleSearchText}
          />
        </View>
        <View style={styles.row}>
          <Text style={[typography.searchLabel, styles.searchOption, typography.dark]}>
            { t`Flavor Text` }
          </Text>
          <ArkhamSwitch
            useGestureHandler
            value={searchFlavor}
            onValueChange={toggleSearchFlavor}
          />
        </View>
        <View style={styles.row}>
          <Text style={[typography.searchLabel, styles.searchOption, typography.dark]}>
            { t`Card Backs` }
          </Text>
          <ArkhamSwitch
            useGestureHandler
            value={searchBack}
            onValueChange={toggleSearchBack}
          />
        </View>
      </View>
    </>
  );
}

function ExpandModesButtons({
  hasFilters,
  mythosToggle,
  toggleMythosMode,
  clearSearchFilters,
  mythosMode,
}: {
  hasFilters: boolean;
  mythosToggle?: boolean;
  toggleMythosMode: () => void;
  clearSearchFilters: () => void;
  mythosMode?: boolean;
}) {
  if (!mythosToggle && !hasFilters) {
    return null;
  }
  return (
    <View>
      { !!mythosToggle && (
        <ArkhamButton
          icon="search"
          onPress={toggleMythosMode}
          title={mythosMode ? t`Search player cards` : t`Search encounter cards`}
        />
      ) }
      { !!hasFilters && (
        <ArkhamButton
          icon="search"
          onPress={clearSearchFilters}
          title={t`Clear search filters`}
        />
      ) }
    </View>
  );
}

function ExpandSearchButtons({
  hasFilters,
  mythosToggle,
  toggleMythosMode,
  clearSearchFilters,
  mythosMode,
  searchTerm,
  searchText,
  searchBack,
  clearSearchTerm,
  toggleSearchText,
  toggleSearchBack,
}: {
  hasFilters: boolean;
  mythosToggle?: boolean;
  toggleMythosMode: () => void;
  clearSearchFilters: () => void;
  searchText: boolean;
  searchTerm?: string;
  searchBack: boolean;
  mythosMode?: boolean;
  clearSearchTerm: () => void;
  toggleSearchText: () => void;
  toggleSearchBack: () => void;
}) {
  if (!searchTerm) {
    return (
      <ExpandModesButtons
        hasFilters={hasFilters}
        mythosToggle={mythosToggle}
        toggleMythosMode={toggleMythosMode}
        clearSearchFilters={clearSearchFilters}
        mythosMode={mythosMode}
      />
    )
  }
  return (
    <View>
      { !!searchTerm && (
        <ArkhamButton
          icon="search"
          onPress={clearSearchTerm}
          title={t`Clear "${searchTerm}" search`}
        />
      ) }
      { !searchText && (
        <ArkhamButton
          icon="search"
          onPress={toggleSearchText}
          title={t`Search game text`}
        />
      ) }
      { !searchBack && (
        <ArkhamButton
          icon="search"
          onPress={toggleSearchBack}
          title={t`Search card backs`}
        />
      ) }
      <ExpandModesButtons
        hasFilters={hasFilters}
        mythosToggle={mythosToggle}
        toggleMythosMode={toggleMythosMode}
        clearSearchFilters={clearSearchFilters}
        mythosMode={mythosMode}
      />
    </View>
  );
}

export default function({
  componentId,
  baseQuery,
  mythosToggle,
  showNonCollection,
  selectedSort,
  filters,
  mythosMode,
  visible,
  toggleMythosMode,
  clearSearchFilters,
  tabooSetOverride,
  investigator,
  originalDeckSlots,
  deckCardCounts,
  onDeckCountChange,
  limits,
  header,
  renderFooter,
  storyOnly,
  initialSort,
}: Props) {
  const { fontScale } = useContext(StyleContext);
  const [searchText, setSearchText] = useState(false);
  const [searchFlavor, setSearchFlavor] = useState(false);
  const [searchBack, setSearchBack] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [searchState, setSearchState] = useState<SearchState>({});
  const toggleSearchText = useCallback(() => setSearchText(!searchText), [searchText]);
  const toggleSearchFlavor = useCallback(() => setSearchFlavor(!searchFlavor), [searchFlavor]);
  const toggleSearchBack = useCallback(() => setSearchBack(!searchBack), [searchBack]);
  const clearSearchTerm = useCallback(() => setSearchTerm(''), []);
  const updateSearch = useCallback((searchTerm: string) => {
    if (!searchTerm) {
      setSearchState({});
      return;
    }
    const searchCode = DIGIT_REGEX.test(searchTerm) ? parseInt(searchTerm, 10) : undefined;
    const term = searchTerm.replace(/“|”/g, '"').replace(/‘|’/, '\'');
    setSearchState({
      searchQuery: new RegExp(`.*${RegexEscape(term)}.*`, 'i'),
      searchCode,
    });
  }, []);
  const debouncedUpdateSearch = debounce(50, updateSearch);
  const searchUpdated = useCallback((text: string) => {
    setSearchTerm(text);
    debouncedUpdateSearch(text);
  }, []);

  const filterCardText = useCallback((card: Card): boolean => {
    const {
      searchQuery,
      searchCode,
    } = searchState;
    if (searchCode && card.position === searchCode) {
      return true;
    }
    if (!searchQuery || searchTerm === '' || !searchTerm) {
      return true;
    }
    if (searchBack) {
      if (searchQuery.test(card.name) ||
        (card.linked_card && searchQuery.test(card.linked_card.name)) ||
        (card.back_name && searchQuery.test(card.back_name)) ||
        (card.linked_card && card.linked_card.back_name && searchQuery.test(card.linked_card.back_name)) ||
        (card.subname && searchQuery.test(card.subname)) ||
        (card.linked_card && card.linked_card.subname && searchQuery.test(card.linked_card.subname))
      ) {
        return true;
      }
    } else {
      if (searchQuery.test(card.renderName) || (card.renderSubname && searchQuery.test(card.renderSubname))) {
        return true;
      }
    }
    if (searchText) {
      if (
        (card.real_text && searchQuery.test(card.real_text)) ||
        (card.linked_card && card.linked_card.real_text && searchQuery.test(card.linked_card.real_text)) ||
        (card.traits && searchQuery.test(card.traits)) ||
        (card.linked_card && card.linked_card.traits && searchQuery.test(card.linked_card.traits))
      ) {
        return true;
      }
      if (searchBack && (
        (card.back_text && searchQuery.test(card.back_text)) ||
        (card.linked_card && card.linked_card.back_text && searchQuery.test(card.linked_card.back_text))
      )) {
        return true;
      }
    }
    if (searchFlavor) {
      if (
        (card.flavor && searchQuery.test(card.flavor)) ||
        (card.linked_card && card.linked_card.flavor && searchQuery.test(card.linked_card.flavor))
      ) {
        return true;
      }
      if (searchBack && (
        (card.back_flavor && searchQuery.test(card.back_flavor)) ||
        (card.linked_card && card.linked_card.back_flavor && searchQuery.test(card.linked_card.back_flavor))
      )) {
        return true;
      }
    }
    return false;
  }, [searchState, searchBack, searchFlavor, searchText, searchTerm]);

  const textQuery = useMemo(() => {
    const {
      searchCode,
    } = searchState;
    const parts: Brackets[] = [];
    if (searchCode) {
      parts.push(where(`c.position = :searchCode`, { searchCode }));
    }
    if (searchTerm === '' || !searchTerm) {
      return combineQueriesOpt(parts, 'and');
    }
    const safeSearchTerm = `%${searchTerm}%`;
    console.log(safeSearchTerm);
    if (searchBack) {
      parts.push(where([
        'c.name like :searchTerm',
        '(c.linked_card is not null AND c.linked_card.name like :searchTerm)',
        '(c.back_name is not null AND c.back_name like :searchTerm)',
        '(c.linked_card is not null AND c.linked_card.back_name is not null and c.linked_card.back_name like :searchTerm)',
        '(c.subname is not null AND c.subname like :searchTerm)',
        '(c.linked_card is not null AND c.linked_card.subname is not null AND c.linked_card.subname like :searchTerm)'
      ].join(' OR '), { searchTerm: safeSearchTerm }));
    } else {
      parts.push(where('c.renderName like :searchTerm OR (c.renderSubname is not null AND c.renderSubname like :searchTerm)', { searchTerm: safeSearchTerm }))
    }
    if (searchText) {
      parts.push(where([
        '(c.text is not null AND c.text like :searchTerm)',
        '(c.traits is not null AND c.traits like :searchTerm)',
      ].join(' OR '), { searchTerm: safeSearchTerm }));
      if (searchBack) {
        parts.push(where([
          '(c.linked_card is not null AND c.linked_card.text is not null AND c.linked_card.text like :searchTerm)',
          '(c.linked_card is not null AND c.linked_card.traits AND c.linked_card.traits like :searchTerm)',
          '(c.back_text is not null AND c.back_text like :searchTerm)',
          '(c.linked_card is not null AND c.linked_card.back_text is not null AND c.linked_card.back_text like :searchTerm)',
        ].join(' OR '), { searchTerm: safeSearchTerm }));
      }
    }
    if (searchFlavor) {
      parts.push(where('(c.flavor is not null AND c.flavor like :searchTerm)', { searchTerm: safeSearchTerm }));
      '(c.linked_card is no'
      if (searchBack) {
        parts.push(where([
          '(c.back_flavor is not null AND c.back_flavor like :searchTerm)',
          '(c.linked_card is not null AND c.linked_card.flavor is not null AND c.linked_card.flavor like :searchTerm)',
          '(c.linked_card is not null AND c.linked_card.back_flavor is not null AND c.linked_card.back_flavor like :searchTerm)',
        ].join(' OR '), { searchTerm: safeSearchTerm }));
      }
    }
    return combineQueriesOpt(parts, 'or');
  }, [searchState, searchBack, searchFlavor, searchText, searchTerm]);

  const controls = (
    <SearchOptions
      searchText={searchText}
      searchFlavor={searchFlavor}
      searchBack={searchBack}
      toggleSearchText={toggleSearchText}
      toggleSearchFlavor={toggleSearchFlavor}
      toggleSearchBack={toggleSearchBack}
    />
  );

  const query = useMemo(() => {
    const queryParts: Brackets[] = [];
    if (mythosToggle) {
      if (mythosMode) {
        queryParts.push(MYTHOS_CARDS_QUERY);
      } else {
        queryParts.push(BROWSE_CARDS_QUERY);
      }
    }
    if (baseQuery) {
      queryParts.push(baseQuery);
    }
    if (selectedSort === SORT_BY_ENCOUNTER_SET) {
      //queryParts.push(where(`c.encounter_code is not null OR linked_card.encounter_code is not null`));
    }
    return combineQueries(
      BASIC_QUERY,
      queryParts,
      'and'
    );
  }, [baseQuery, mythosToggle, selectedSort, mythosToggle, mythosMode]);
  const filterQuery = useMemo(() => filters && FILTER_BUILDER.filterToQuery(filters), [filters]);
  return (
    <CollapsibleSearchBox
      prompt={t`Search for a card`}
      advancedOptions={{
        controls,
        height: searchOptionsHeight(fontScale),
      }}
      searchTerm={searchTerm || ''}
      onSearchChange={searchUpdated}
    >
      { (handleScroll, showHeader) => (
        <>
          <DbCardResultList
            componentId={componentId}
            tabooSetOverride={tabooSetOverride}
            query={query}
            filterQuery={filterQuery || undefined}
            textQuery={textQuery}
            searchTerm={searchTerm}
            sort={selectedSort}
            investigator={investigator}
            originalDeckSlots={originalDeckSlots}
            deckCardCounts={deckCardCounts}
            onDeckCountChange={onDeckCountChange}
            limits={limits}
            handleScroll={handleScroll}
            showHeader={showHeader}
            expandSearchControls={(
              <ExpandSearchButtons
                hasFilters={!!filterQuery}
                mythosToggle={mythosToggle}
                toggleMythosMode={toggleMythosMode}
                clearSearchFilters={clearSearchFilters}
                mythosMode={mythosMode}
                searchTerm={searchTerm}
                searchText={searchText}
                searchBack={searchBack}
                clearSearchTerm={clearSearchTerm}
                toggleSearchText={toggleSearchText}
                toggleSearchBack={toggleSearchBack}
              />
            )}
            header={header}
            renderFooter={renderFooter}
            showNonCollection={showNonCollection}
            storyOnly={storyOnly}
            mythosToggle={mythosToggle}
//            mythosMode={mythosToggle && mythosMode}
            initialSort={initialSort}
          />
          { !!renderFooter && (
            <View style={styles.footer}>
              { renderFooter() }
            </View>
          ) }
        </>
      ) }
    </CollapsibleSearchBox>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  searchOption: {
    marginLeft: s,
    marginRight: xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
