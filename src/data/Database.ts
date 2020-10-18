import { findIndex, flatMap, forEach, map, pull, sortBy, sortedUniq } from 'lodash';
import { createConnection, Brackets, Connection, Repository, EntitySubscriberInterface, SelectQueryBuilder, InsertResult, OrderByCondition } from 'typeorm/browser';

import Card, { PartialCard } from './Card';
import EncounterSet from './EncounterSet';
import FaqEntry from './FaqEntry';
import TabooSet from './TabooSet';
import Rule from './Rule';
import { QuerySort } from './types';
import { tabooSetQuery, where } from './query';
import syncPlayerCards, { PlayerCardState } from './syncPlayerCards';
import { SortType } from '@actions/types';

type DatabaseListener = () => void;

export interface SectionCount {
  id: string | number | null;
  count: number;
}

export default class Database {
  static SCHEMA_VERSION: number = 22;
  connectionP: Promise<Connection>;

  state?: PlayerCardState;
  listeners: DatabaseListener[] = [];

  constructor(latestVersion?: number) {
    const recreate = !latestVersion || latestVersion !== Database.SCHEMA_VERSION;

    this.connectionP = createConnection({
      type: 'react-native',
      database: 'arkham4',
      location: 'default',
      logging: [
        'error',
        // 'query',
        'schema',
      ],
      dropSchema: recreate,
      synchronize: recreate,
      // maxQueryExecutionTime: 4000,
      // migrations:['migrations/migration.js'],
      entities: [
        Card,
        EncounterSet,
        FaqEntry,
        TabooSet,
        Rule,
      ],
    });
    this.connectionP.then(connection => {
//      connection.query('EXPLAIN QUERY PLAN SELECT "c"."sort_by_type", count(*) as count FROM "card" "c" LEFT JOIN "card" "linked_card" ON "linked_card"."id"="c"."linked_card_id" WHERE ("c"."taboo_set_id" is null OR "c"."taboo_set_id" = 2) AND ((("c"."browse_visible") AND ("c"."deck_limit" >= 0)) AND ("c"."encounter_code" is not null AND ("c"."non_spoiler" is null or "c"."non_spoiler" = false))) GROUP BY "c"."sort_by_type"').then(console.log)
    })
  }

  addListener(change: () => void) {
    this.listeners.push(change);
  }

  removeListener(change: () => void) {
    pull(this.listeners, change);
  }

  reloadPlayerCards() {
    // console.log('RELOADING PLAYER CARDS');
    return syncPlayerCards(this, this._updatePlayerCards);
  }

  private _updatePlayerCards = (state: PlayerCardState) => {
    // console.log('PLAYER CARDS UDPATED');
    this.state = state;
    forEach(this.listeners, listener => listener());
  };

  async cards(): Promise<Repository<Card>> {
    const connection = await this.connectionP;
    return connection.getRepository(Card);
  }

  async rules(): Promise<Repository<Rule>> {
    const connection = await this.connectionP;
    return connection.getRepository(Rule);
  }

  async cardsQuery(): Promise<SelectQueryBuilder<Card>> {
    const cards = await this.cards();
    return cards.createQueryBuilder('c')
      .leftJoinAndSelect('c.linked_card', 'linked_card');
  }

  async tabooSets(): Promise<Repository<TabooSet>> {
    const connection = await this.connectionP;
    return connection.getRepository(TabooSet);
  }

  async faqEntries(): Promise<Repository<FaqEntry>> {
    const connection = await this.connectionP;
    return connection.getRepository(FaqEntry);
  }

  async encounterSets(): Promise<Repository<EncounterSet>> {
    const connection = await this.connectionP;
    return connection.getRepository(EncounterSet);
  }

  async addSubscriber(subscriber: EntitySubscriberInterface) {
    const connection = await this.connectionP;
    connection.subscribers.push(subscriber);
  }

  async removeSubscriber(subscriber: EntitySubscriberInterface) {
    const connection = await this.connectionP;
    const index = findIndex(connection.subscribers, sub => sub === subscriber);
    if (index !== -1) {
      connection.subscribers.splice(index, 1);
    }
  }

  async clearCache(): Promise<void> {
    const connection = await this.connectionP;
    if (connection.queryResultCache) {
      await connection.queryResultCache.clear();
    }
  }

  async insertCards(
    cards: Card[]
  ): Promise<InsertResult> {
    const query = (await this.cards())
      .createQueryBuilder()
      .insert()
      .into(Card)
      .values(cards)
      .orIgnore();
    return await query.execute();
  }

  async insertRules(
    rules: Rule[]
  ): Promise<InsertResult> {
    const query = (await this.rules())
      .createQueryBuilder()
      .insert()
      .into(Rule)
      .values(rules)
      .orIgnore();
    return await query.execute();
  }

  async getRulesPaged(
    page: number,
    pageSize: number,
    query?: Brackets
  ): Promise<Rule[]> {
    let rulesQuery = (await this.rules()).createQueryBuilder('r').leftJoinAndSelect('r.rules', 'sub_rules');
    if (query) {
      rulesQuery = rulesQuery.where(query);
    }
    return await rulesQuery
      .orderBy('r.order', 'ASC')
      .skip(pageSize * page)
      .take(pageSize)
      .getMany();
  }

  async getDistinctFields(
    field: string,
    query?: Brackets,
    tabooSetId?: number,
    processValue?: (value: string) => string[],
  ): Promise<string[]> {
    const cards = await this.cards();
    let cardsQuery = cards.createQueryBuilder('c')
      .select(`distinct c.${field} as value, linked_card.${field} as linked_value`)
      .leftJoin('c.linked_card', 'linked_card');
    cardsQuery = cardsQuery.where(tabooSetQuery(tabooSetId));
    if (query) {
      cardsQuery = cardsQuery.andWhere(query);
    }
    const results = await cardsQuery.getRawMany();
    return sortedUniq(sortBy(flatMap(results, (result) => {
      const values: string[] = [];
      if (result.value !== null) {
        values.push(result.value);
      }
      if (result.linked_value !== null) {
        values.push(result.linked_value)
      }
      if (processValue) {
        return flatMap(values, processValue);
      }
      return values;
    }), x => x));
  }

  async getPartialCards(
    query?: Brackets,
    tabooSetId?: number,
    sort?: SortType,
  ): Promise<PartialCard[]> {
    const cards = await this.cards();
    let cardsQuery = cards.createQueryBuilder('c')
      .select(PartialCard.selectStatement(sort))
      .leftJoin('c.linked_card', 'linked_card');
    cardsQuery = cardsQuery.where(tabooSetQuery(tabooSetId));
    if (query) {
      cardsQuery = cardsQuery.andWhere(query);
    }
    const sortQuery = Card.querySort(sort);
    if (sortQuery.length) {
      const orderBy: OrderByCondition = {};
      forEach(sortQuery, ({ s, direction }) => {
        orderBy[s] = direction;
      });
      cardsQuery.orderBy(orderBy)
    }
    const time = new Date();
    const result = await cardsQuery.getRawMany();
    console.log(`Elapsed: ${new Date().getTime() - time.getTime()}`);
    return flatMap(result, raw => PartialCard.fromRaw(raw, sort) || []);
  }

  async getCards(
    query?: Brackets,
    tabooSetId?: number,
    sort?: QuerySort[]
  ): Promise<Card[]> {
    const cardsQuery = await this.applyCardsQuery(query, tabooSetId, sort);
    return await cardsQuery.getMany();
  }

  async getCardsByIds(
    ids: string[]
  ): Promise<Card[]> {
    const cards = await this.cards();
    return await cards.createQueryBuilder('c')
      .leftJoinAndSelect('c.linked_card', 'linked_card')
      .where(where(`c.id IN (:...cardIds)`, { cardIds: ids }))
      .getMany();
  }


  async getCard(
    query?: Brackets,
    tabooSetId?: number,
    sort?: QuerySort[],
  ): Promise<Card | undefined> {
    const cardsQuery = await this.applyCardsQuery(query, tabooSetId, sort);
    return await cardsQuery.getOne();
  }

  async getCardCount(
    query?: Brackets,
    tabooSetId?: number,
  ): Promise<number> {
    const cardsQuery = await this.applyCardsQuery(query, tabooSetId);
    return await cardsQuery.getCount();
  }

  async getCardGroupCount(
    groupBy: string,
    extractor: (item: any) => SectionCount,
    query?: Brackets,
    tabooSetId?: number
  ): Promise<SectionCount[]> {
    const cardsQuery = await this.applyCardsQuery(query, tabooSetId, undefined, groupBy);
    const results = await cardsQuery.select(`${groupBy}, count(*) as count`).getRawMany();
    return map(results, extractor);
  }

  private async applyCardsQuery(
    query?: Brackets,
    tabooSetId?: number,
    sort?: QuerySort[],
    groupBy?: string
  ): Promise<SelectQueryBuilder<Card>> {
    let cardsQuery = await this.cardsQuery();
    cardsQuery.where(tabooSetQuery(tabooSetId));
    if (query) {
      cardsQuery = cardsQuery.andWhere(query);
    }
    if (sort && sort.length) {
      const orderBy: OrderByCondition = {};
      forEach(sort, ({ s, direction }) => {
        orderBy[s] = direction;
      });
      cardsQuery.orderBy(orderBy)
    }
    if (groupBy) {
      cardsQuery = cardsQuery.groupBy(groupBy)
    }
    return cardsQuery;
  }
}
