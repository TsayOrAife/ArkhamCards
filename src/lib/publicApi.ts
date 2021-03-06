import { chunk, filter, flatMap, forEach, groupBy, head, map, partition, sortBy, uniq, values } from 'lodash';
import { Alert } from 'react-native';

import { CardCache, TabooCache, Pack } from '@actions/types';
import { Rule as JsonRule } from '@data/scenario/types';
import Card from '@data/Card';
import Rule from '@data/Rule';
import Database from '@data/Database';
import TabooSet from '@data/TabooSet';
import FaqEntry from '@data/FaqEntry';

export const syncTaboos = async function(
  db: Database,
  lang?: string,
  cache?: TabooCache
): Promise<TabooCache | null> {
  const langPrefix = lang && lang !== 'en' ? `${lang}.` : '';
  const uri = `https://${langPrefix}arkhamdb.com/api/public/taboos/`;
  const headers = new Headers();
  if (cache && cache.lastModified && cache.tabooCount > 0) {
    const cards = await db.cards();
    const tabooCount = await cards.createQueryBuilder()
      .where('taboo_set_id > 0')
      .getCount();
    if (tabooCount === cache.tabooCount) {
      headers.append('If-Modified-Since', cache.lastModified);
    }
  }
  const response = await fetch(uri, {
    method: 'GET',
    headers,
  });
  if (response.status === 304 && cache) {
    return cache;
  }
  const lastModified = response.headers.get('Last-Modified') || undefined;
  const json = await response.json();
  const allTabooCards = uniq(
    flatMap(json, tabooJson => {
      const cards = JSON.parse(tabooJson.cards);
      return map(cards, card => card.code);
    })
  );
  const cardsRep = await db.cards();
  await cardsRep.createQueryBuilder().where('taboo_set_id > 0').delete().execute();

  const tabooSetsRep = await db.tabooSets();
  await tabooSetsRep.createQueryBuilder().delete().execute();

  const tabooSets: TabooSet[] = [];
  for (let i = 0; i < json.length; i++) {
    const tabooJson = json[i];
    const cards = JSON.parse(tabooJson.cards);
    try {
      tabooSets.push(TabooSet.fromJson(tabooJson, cards.length));
      for (let j = 0; j < allTabooCards.length; j++) {
        const tabooCode = allTabooCards[j];
        const card = await cardsRep.createQueryBuilder('c')
          .where('(c.code = :code AND (c.taboo_set_id is null OR c.taboo_set_id = 0))')
          .setParameters({ code: tabooCode })
          .addSelect(Card.ELIDED_FIELDS)
          .getOne();
        if (card) {
          const tabooCard = Card.placeholderTabooCard(tabooJson.id, card);
          cardsRep.insert(tabooCard);
        }
      }
      for (let j = 0; j < cards.length; j++) {
        const cardJson = cards[j];
        const code: string = cardJson.code;
        const card = await cardsRep.createQueryBuilder('c')
          .where('(c.code = :code AND (c.taboo_set_id is null OR c.taboo_set_id = 0))')
          .setParameters({ code: cardJson.code })
          .addSelect(Card.ELIDED_FIELDS)
          .getOne();
        if (card) {
          try {
            // Mark the original card as the 'vanilla' version.
            if (card.taboo_set_id !== 0) {
              await cardsRep.update({ id: card.id }, { taboo_set_id: 0 });
            }
            const tabooCard = Card.fromTabooCardJson(tabooJson.id, cardJson, card);
            await cardsRep.save(tabooCard);
          } catch (e) {
            Alert.alert(`${e}`);
            console.log(e);
          }
        } else {
          console.log(`Could not find old card: ${code}`);
        }
      }
    } catch (e) {
      Alert.alert(`${e}`);
      console.log(e);
    }
  }

  await tabooSetsRep.insert(tabooSets);

  const tabooCount = await cardsRep.createQueryBuilder()
    .where('taboo_set_id > 0')
    .getCount();
  return {
    tabooCount,
    lastModified,
  };
};

async function insertChunk<T>(things: T[], insert: (things: T[]) => Promise<void>) {
  const chunkThings = chunk(things, 10);
  for (let i = 0; i < chunkThings.length; i++) {
    const toInsert = chunkThings[i];
    await insert(toInsert);
  }
}

function rulesJson(lang?: string) {
  switch (lang) {
    case 'es':
      return require('../../assets/rules_es.json');
    case 'en':
    default:
      return require('../../assets/rules.json');
  }
}

export const syncRules = async function(
  db: Database,
  lang?: string
): Promise<void> {
  const rules: JsonRule[] = rulesJson(lang);
  await db.insertRules(
    flatMap(rules, (jsonRule, index) => {
      const rule = Rule.parse(lang || 'en', jsonRule, index);
      return [rule, ...(rule.rules || [])];
    })
  );
};

export const syncCards = async function(
  db: Database,
  packs: Pack[],
  in_collection: { [key: string]: boolean | undefined },
  spoilers: { [key: string]: boolean | undefined },
  lang?: string,
  cache?: CardCache
): Promise<CardCache | null> {
  const langPrefix = lang && lang !== 'en' ? `${lang}.` : '';
  const uri = `https://${langPrefix}arkhamdb.com/api/public/cards/?encounter=1`;
  const packsByCode: { [code: string]: Pack } = {};
  const cycleNames: {
    [cycle_position: number]: {
      name?: string;
      code?: string;
    };
  } = {};
  forEach(packs, pack => {
    packsByCode[pack.code] = pack;
    if (pack.position === 1) {
      cycleNames[pack.cycle_position] = pack;
    }
  });
  cycleNames[50] = {};
  cycleNames[60] = {};
  cycleNames[70] = {};
  cycleNames[80] = {};
  cycleNames[90] = {};
  const headers = new Headers();
  if (cache &&
    cache.lastModified &&
    cache.cardCount > 0
  ) {
    const cards = await db.cards();
    const cardCount = await cards.createQueryBuilder('card')
      .where('card.taboo_set_id is null OR card.taboo_set_id = 0')
      .getCount();
    if (cardCount === cache.cardCount) {
      headers.append('If-Modified-Since', cache.lastModified);
    }
  }
  try {
    const response = await fetch(uri, {
      method: 'GET',
      headers,
    });
    if (response.status === 304 && cache) {
      return cache;
    }

    const lastModified = response.headers.get('Last-Modified') || undefined;
    const json = await response.json();
    const encounterSets = await db.encounterSets();
    const cards = await db.cards();
    const tabooSets = await db.tabooSets();
    const rules = await db.rules();

    // Delete the tables.
    await cards.createQueryBuilder().delete().execute();
    await encounterSets.createQueryBuilder().delete().execute();
    await tabooSets.createQueryBuilder().delete().execute();
    await rules.createQueryBuilder().delete().execute();
    await db.clearCache();
    await syncRules(db, lang);
    // console.log(`${await cards.count() } cards after delete`);
    const cardsToInsert: Card[] = [];
    forEach(json, cardJson => {
      try {
        const card = Card.fromJson(cardJson, packsByCode, cycleNames, lang || 'en');
        if (card) {
          if (in_collection[card.pack_code]) {
            card.in_collection = true;
          }
          if (card.encounter_code && !spoilers[card.pack_code]) {
            card.spoiler = true;
          }
          cardsToInsert.push(card);
        }
      } catch (e) {
        Alert.alert(`${e}`);
        console.log(e);
        console.log(cardJson);
      }
    });
    const linkedSet = new Set(flatMap(cardsToInsert, (c: Card) => c.linked_card ? [c.code, c.linked_card] : []));
    const dedupedCards = filter(cardsToInsert, (c: Card) => !!c.linked_card || !linkedSet.has(c.code));
    const flatCards = flatMap(dedupedCards, (c: Card) => {
      return c.linked_card ? [c, c.linked_card] : [c];
    });
    const encounter_card_counts: {
      [encounter_code: string]: number | undefined;
    } = {};

    const bondedNames: string[] = [];
    forEach(flatCards, card => {
      if (!card.hidden && card.encounter_code) {
        encounter_card_counts[card.encounter_code] = (encounter_card_counts[card.encounter_code] || 0) + (card.quantity || 1);
      }
      if (card.bonded_name) {
        bondedNames.push(card.bonded_name);
      }
    });
    const bondedSet = new Set(bondedNames);
    forEach(flatCards, card => {
      if (card.encounter_code) {
        card.encounter_size = encounter_card_counts[card.encounter_code] || 0;
        encounter_card_counts;
      }
      if (bondedSet.has(card.real_name)) {
        card.bonded_from = true;
      }
    });
    forEach(groupBy(flatCards, card => card.id), dupes => {
      if (dupes.length > 1) {
        forEach(dupes, (dupe, idx) => {
          dupe.id = `${dupe.id}_${idx}`;
        });
      }
    });

    const [linkedCards, normalCards] = partition(dedupedCards, card => !!card.linked_card);
    // console.log('Parsed all cards');
    await insertChunk(flatMap(linkedCards, c => c.linked_card ? [c.linked_card] : []), async(c: Card[]) => {
      await cards.insert(c);
    });
    // console.log('Inserted back-link cards');
    await insertChunk(linkedCards, async(c: Card[]) => {
      await cards.insert(c);
    });
    // console.log('Inserted front link cards');
    await insertChunk(normalCards, async(c: Card[]) => {
      await cards.insert(c);
    });
    // console.log('Inserted normal cards');
    console.log('Inserted front link cards');


    const playerCards = await cards.createQueryBuilder()
      .where('deck_limit > 0 AND spoiler != true AND xp is not null AND (taboo_set_id is null OR taboo_set_id = 0)')
      .getMany();
    const cardsByName = values(groupBy(playerCards, card => card.real_name));

    // console.log(`Working on upgrades now.`);
    for (let i = 0; i < cardsByName.length; i++) {
      const cardsGroup = cardsByName[i];
      if (cardsGroup.length > 1) {
        const maxXpCard = head(sortBy(cardsGroup, card => -(card.xp || 0)));
        if (maxXpCard) {
          for (let j = 0; j < cardsGroup.length; j++) {
            const card = cardsGroup[j];
            const xp = card.xp || 0;
            await cards.update({ id: card.id }, { has_upgrades: xp < (maxXpCard.xp || 0) });
          }
        }
      }
    }
    const cardCount = await cards.createQueryBuilder('card')
      .where('card.taboo_set_id is null OR card.taboo_set_id = 0')
      .getCount();
    return {
      cardCount,
      lastModified,
    };
  } catch (e) {
    console.log(e);
    return Promise.resolve(null);
  }
};

export const getFaqEntry = async function(db: Database, code: string) {
  const faqs = await db.faqEntries();
  const faqEntry = await faqs.createQueryBuilder()
    .where('code = :code')
    .setParameters({ code })
    .getOne();

  const headers = new Headers();
  if (faqEntry && faqEntry.lastModified) {
    headers.append('If-Modified-Since', faqEntry.lastModified);
  }
  const uri = `https://arkhamdb.com/api/public/faq/${code}.json`;
  const response = await fetch(uri, {
    method: 'GET',
    headers: headers,
  });
  if (response.status === 304) {
    return Promise.resolve(true);
  }
  const lastModified = response.headers.get('Last-Modified') || undefined;
  const json = await response.json();
  if (json.length) {
    faqs.save(FaqEntry.fromJson(code, json[0], lastModified));
    return true;
  }
  faqs.save(FaqEntry.empty(code, lastModified));
  return false;
};

export default {
  syncCards,
  syncTaboos,
  getFaqEntry,
};
