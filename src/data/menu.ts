import type { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  // Piva
  { id: 'plzen-03',      name: 'Plzeň',              size: '0,3l', price: 50, category: 'piva', isBeer: true },
  { id: 'plzen-05',      name: 'Plzeň',              size: '0,5l', price: 55, category: 'piva', isBeer: true },
  { id: 'kozel-03',      name: 'Kozel 11',           size: '0,3l', price: 40, category: 'piva', isBeer: true },
  { id: 'kozel-05',      name: 'Kozel 11',           size: '0,5l', price: 45, category: 'piva', isBeer: true },
  { id: 'zon-03',        name: 'Čepovaná ZON Žlutá', size: '0,3l', price: 30, category: 'piva', isBeer: true },
  { id: 'zon-05',        name: 'Čepovaná ZON Žlutá', size: '0,5l', price: 35, category: 'piva', isBeer: true },
  { id: 'birell-05',     name: 'Birell',             size: '0,5l', price: 40, category: 'piva', isBeer: true },

  // Napoje
  { id: 'mattoni-still', name: 'Mattoni neperlivá',        size: '0,5l',  price: 30, category: 'napoje' },
  { id: 'mattoni-spark', name: 'Mattoni perlivá',          size: '0,5l',  price: 30, category: 'napoje' },
  { id: 'voda-03',       name: 'Jemně perlivá voda',       size: '0,3l',  price: 15, category: 'napoje' },
  { id: 'voda-05',       name: 'Jemně perlivá voda',       size: '0,5l',  price: 20, category: 'napoje' },
  { id: 'dzus',          name: 'Džus pomeranč',            size: '0,33l', price: 40, category: 'napoje' },
  { id: 'pepsi',         name: 'Pepsi',                    size: '0,33l', price: 40, category: 'napoje' },
  { id: 'mirinda',       name: 'Mirinda',                  size: '0,33l', price: 40, category: 'napoje' },
  { id: '7up',           name: '7Up',                      size: '0,33l', price: 40, category: 'napoje' },
  { id: 'tonic',         name: 'Tonic',                    size: '0,33l', price: 40, category: 'napoje' },
  { id: 'birgo',         name: 'Birgo mango & marakuja',   size: '0,5l',  price: 40, category: 'napoje' },
  { id: 'strongbow-trop',name: 'Strongbow Tropical',       size: '0,4l',  price: 45, category: 'napoje' },
  { id: 'strongbow-red', name: 'Strongbow Red Berries',    size: '0,4l',  price: 45, category: 'napoje' },
  { id: 'guarana',       name: 'Guarana energeták',        size: '0,25l', price: 40, category: 'napoje' },
  { id: 'capri',         name: 'Capri Sun',                size: '0,2l',  price: 25, category: 'napoje' },
  { id: 'kava-turecka',  name: 'Turecká káva',             size: '0,2l',  price: 35, category: 'napoje' },
  { id: 'kava-instant',  name: 'Rozpustná káva',           size: '0,2l',  price: 35, category: 'napoje' },
  { id: 'espresso',      name: 'Espresso',                 size: '0,2l',  price: 40, category: 'napoje' },
  { id: 'smetana',       name: 'Smetana do kávy',                         price:  5, category: 'napoje' },

  // Alkohol
  { id: 'bozkov-orig',  name: 'Božkov Original',        size: '0,04l', price: 40, category: 'alkohol' },
  { id: 'bozkov-vodka', name: 'Božkov Vodka',           size: '0,04l', price: 40, category: 'alkohol' },
  { id: 'bozkov-pepr',  name: 'Božkov Peprmint',        size: '0,04l', price: 40, category: 'alkohol' },
  { id: 'bozkov-modra', name: 'Božkov Modrá',           size: '0,04l', price: 40, category: 'alkohol' },
  { id: 'finlandia',    name: 'Finlandia Vodka',        size: '0,04l', price: 60, category: 'alkohol' },
  { id: 'jager',        name: 'Jägermeister',           size: '0,04l', price: 60, category: 'alkohol' },
  { id: 'beefeater',    name: 'Beefeater Gin',          size: '0,04l', price: 60, category: 'alkohol' },
  { id: 'tullamore',    name: 'Tullamore Dew',          size: '0,04l', price: 65, category: 'alkohol' },
  { id: 'divine',       name: 'Divine Fík / Zlatý',    size: '0,04l', price: 40, category: 'alkohol' },
  { id: 'becherovka',   name: 'Becherovka Orange/Grep', size: '0,04l', price: 40, category: 'alkohol' },
  { id: 'karpatka',     name: 'Fajn Karpatka hořká',   size: '0,04l', price: 40, category: 'alkohol' },

  // Jidlo
  { id: 'parek',      name: 'Párek v rohlíku',                                         price: 35, category: 'jidlo' },
  { id: 'klobasa',    name: 'Grilovaná klobása + chléb + hořčice/kečup/křen', size: '150g', price: 90, category: 'jidlo' },
  { id: 'brambурky', name: 'Cyrilovy brambůrky sůl/paprika/hříbek',                   price: 40, category: 'jidlo' },
  { id: 'tycinky',   name: 'Cyrilovy tyčinky',                                         price: 35, category: 'jidlo' },
  { id: 'krupky',    name: 'Křupky',                                                    price: 25, category: 'jidlo' },
];
