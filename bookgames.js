const puppeteer = require('puppeteer');
var databas = require('knex')({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
require('dotenv').config();

const leagueStartDate = new Date('2021-04-08T00:00:00.000Z');
const hourOffset = 2;
const allGamesInLeague = [
  {
    ID: 192,
    hemma1: 143,
    hemma2: 137,
    borta1: 134,
    borta2: 138,
    pointshemma: 0,
    pointsborta: 0,
    bookedtime: null,
    oddslots: ['60700', '60730'],
    evenslots: ['31000', '31030', '41000', '41030'],
    total: 0,
  },
  // {
  //   ID: 170,
  //   hemma1: 141,
  //   hemma2: 143,
  //   borta1: 139,
  //   borta2: 140,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: ['31000', '31030', '41000', '41030'],
  //   total: 0,
  // },
  // {
  //   ID: 186,
  //   hemma1: 143,
  //   hemma2: 142,
  //   borta1: 134,
  //   borta2: 144,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: ['31000', '31030', '41000', '41030'],
  //   total: 0,
  // },
  // {
  //   ID: 173,
  //   hemma1: 139,
  //   hemma2: 134,
  //   borta1: 138,
  //   borta2: 143,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: ['31000', '31030', '41000', '41030'],
  //   total: 0,
  // },
  // {
  //   ID: 188,
  //   hemma1: 140,
  //   hemma2: 138,
  //   borta1: 143,
  //   borta2: 139,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: ['31000', '31030', '41000', '41030'],
  //   total: 0,
  // },
  // {
  //   ID: 198,
  //   hemma1: 141,
  //   hemma2: 137,
  //   borta1: 139,
  //   borta2: 138,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 197,
  //   hemma1: 144,
  //   hemma2: 136,
  //   borta1: 142,
  //   borta2: 145,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 191,
  //   hemma1: 134,
  //   hemma2: 141,
  //   borta1: 144,
  //   borta2: 142,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 189,
  //   hemma1: 144,
  //   hemma2: 139,
  //   borta1: 142,
  //   borta2: 141,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 167,
  //   hemma1: 142,
  //   hemma2: 140,
  //   borta1: 141,
  //   borta2: 136,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 185,
  //   hemma1: 135,
  //   hemma2: 137,
  //   borta1: 145,
  //   borta2: 138,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 178,
  //   hemma1: 135,
  //   hemma2: 139,
  //   borta1: 138,
  //   borta2: 141,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 174,
  //   hemma1: 135,
  //   hemma2: 141,
  //   borta1: 139,
  //   borta2: 142,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 171,
  //   hemma1: 138,
  //   hemma2: 136,
  //   borta1: 137,
  //   borta2: 145,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 182,
  //   hemma1: 145,
  //   hemma2: 141,
  //   borta1: 136,
  //   borta2: 142,
  //   pointshemma: 2,
  //   pointsborta: 4,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 168,
  //   hemma1: 139,
  //   hemma2: 145,
  //   borta1: 138,
  //   borta2: 137,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 184,
  //   hemma1: 136,
  //   hemma2: 139,
  //   borta1: 140,
  //   borta2: 141,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 180,
  //   hemma1: 135,
  //   hemma2: 138,
  //   borta1: 137,
  //   borta2: 139,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 172,
  //   hemma1: 135,
  //   hemma2: 142,
  //   borta1: 141,
  //   borta2: 144,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 181,
  //   hemma1: 137,
  //   hemma2: 142,
  //   borta1: 145,
  //   borta2: 144,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 169,
  //   hemma1: 135,
  //   hemma2: 144,
  //   borta1: 142,
  //   borta2: 134,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 176,
  //   hemma1: 138,
  //   hemma2: 144,
  //   borta1: 137,
  //   borta2: 134,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [],
  //   total: 2,
  // },
  // {
  //   ID: 194,
  //   hemma1: 142,
  //   hemma2: 138,
  //   borta1: 141,
  //   borta2: 139,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: ['60700', '60730'],
  //   total: 4,
  // },
  // {
  //   ID: 177,
  //   hemma1: 145,
  //   hemma2: 143,
  //   borta1: 136,
  //   borta2: 140,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: [],
  //   evenslots: ['31000', '31030', '41000', '41030'],
  //   total: 4,
  // },
  // {
  //   ID: 183,
  //   hemma1: 140,
  //   hemma2: 144,
  //   borta1: 143,
  //   borta2: 134,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: [],
  //   evenslots: ['31000', '31030', '41000', '41030'],
  //   total: 4,
  // },
  // {
  //   ID: 166,
  //   hemma1: 135,
  //   hemma2: 134,
  //   borta1: 144,
  //   borta2: 143,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: [],
  //   evenslots: ['31000', '31030', '41000', '41030'],
  //   total: 4,
  // },
  // {
  //   ID: 175,
  //   hemma1: 137,
  //   hemma2: 140,
  //   borta1: 145,
  //   borta2: 136,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: ['31000', '31030', '41000', '41030'],
  //   total: 6,
  // },
  // {
  //   ID: 187,
  //   hemma1: 135,
  //   hemma2: 145,
  //   borta1: 136,
  //   borta2: 137,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: ['31000', '31030', '41000', '41030'],
  //   total: 6,
  // },
  // {
  //   ID: 190,
  //   hemma1: 135,
  //   hemma2: 136,
  //   borta1: 140,
  //   borta2: 145,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: ['31000', '31030', '41000', '41030'],
  //   total: 6,
  // },
  // {
  //   ID: 196,
  //   hemma1: 135,
  //   hemma2: 143,
  //   borta1: 134,
  //   borta2: 140,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: [],
  //   evenslots: [
  //     '11000',
  //     '11030',
  //     '21000',
  //     '21030',
  //     '31000',
  //     '31030',
  //     '41000',
  //     '41030',
  //   ],
  //   total: 8,
  // },
  // {
  //   ID: 193,
  //   hemma1: 135,
  //   hemma2: 140,
  //   borta1: 143,
  //   borta2: 136,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: [],
  //   evenslots: [
  //     '11000',
  //     '11030',
  //     '21000',
  //     '21030',
  //     '31000',
  //     '31030',
  //     '41000',
  //     '41030',
  //   ],
  //   total: 8,
  // },
  // {
  //   ID: 179,
  //   hemma1: 136,
  //   hemma2: 134,
  //   borta1: 140,
  //   borta2: 143,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: [],
  //   evenslots: [
  //     '11000',
  //     '11030',
  //     '21000',
  //     '21030',
  //     '31000',
  //     '31030',
  //     '41000',
  //     '41030',
  //   ],
  //   total: 8,
  // },
  // {
  //   ID: 195,
  //   hemma1: 134,
  //   hemma2: 145,
  //   borta1: 144,
  //   borta2: 137,
  //   pointshemma: 0,
  //   pointsborta: 0,
  //   bookedtime: null,
  //   oddslots: ['60700', '60730'],
  //   evenslots: [
  //     '31000',
  //     '31030',
  //     '41000',
  //     '41030',
  //     '41100',
  //     '41130',
  //     '51000',
  //     '51030',
  //     '71000',
  //     '71030',
  //   ],
  //   total: 12,
  // },
];
const club =
  'https://playtomic.io/checkout/booking?s=f9497971-ee4b-4c80-95d4-742229424480~48a9d6bf-c4df-4b53-8514-7662dd048d44~';

const numberOfPlayers =
  (-(-(1 / 4)) + Math.sqrt(allGamesInLeague.length * 16 + 1) / 4) /
  (2 * (1 / 4));
const gamesPerWeek = numberOfPlayers / 4;
const weeks = (allGamesInLeague.length * 4) / numberOfPlayers;

async function bookTimeInPlaytomic(time) {
  let year = time.getFullYear();
  let month = time.getMonth();
  month++;
  if (month < 10) {
    month = '0' + month;
  }
  console.log(month);
  let date = time.getDate();
  if (date < 10) {
    date = '0' + date;
  }
  let hours = time.getHours();
  if (hours < 10) {
    hours = '0' + hours;
  }
  let minutes = time.getMinutes();
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  const firstUrl =
    'https://playtomic.io/checkout/booking?s=f9497971-ee4b-4c80-95d4-742229424480~48a9d6bf-c4df-4b53-8514-7662dd048d44~2021-04-01T12%3A00~90';
  const url =
    'https://playtomic.io/checkout/booking?s=f9497971-ee4b-4c80-95d4-742229424480~48a9d6bf-c4df-4b53-8514-7662dd048d44~' +
    year +
    '-' +
    month +
    '-' +
    date +
    'T' +
    hours +
    '%3A' +
    minutes +
    '~90';
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const navigationPromise = page.waitForNavigation();
  console.log(url);
  await page.goto(firstUrl);

  page.setViewport({ width: 2560, height: 1361 });

  await navigationPromise;
  await page.waitForSelector(
    '#root > div > div.cookies.cookies--shown > div > div.cookies__accept > a > div'
  );
  await page.click(
    '#root > div > div.cookies.cookies--shown > div > div.cookies__accept > a > div'
  );
  await navigationPromise;
  await page.waitForSelector('#sign-up__email');
  await page.type('#sign-up__email', 'simonbrundin@gmail.com');
  await page.type('#sign-up__password', 'hHBwcaAmZ8xsxr6');
  await navigationPromise;
  await page.waitForSelector('#sign-in__submit > div');
  await page.click('#sign-in__submit > div');
  await navigationPromise;
  const page2 = await browser.newPage();
  page2.setViewport({ width: 2560, height: 1361 });
  await page2.goto(url);
  await navigationPromise;
  await page2.waitForSelector('#sign-up__email');
  await page2.type('#sign-up__email', 'simonbrundin@gmail.com');
  await page2.type('#sign-up__password', 'hHBwcaAmZ8xsxr6');
  await navigationPromise;
  await page2.waitForSelector('#sign-in__submit > div');
  await page2.click('#sign-in__submit > div');
  await navigationPromise;
  await page2.waitForSelector(
    '.checkout > .checkout__content > .checkout__box > .checkout__details > div'
  );

  await page.waitForSelector(
    '.checkout__details > div > .checkout__buttons > .button > div'
  );
  await page.click(
    '.checkout__details > div > .checkout__buttons > .button > div'
  );
  await navigationPromise;
  await page.screenshot('./screenshot.png');
  await browser.close();
}
function isWeekOdd(monday) {
  // Copy date so don't modify original
  let date = new Date(monday);
  // d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  if (weekNo % 2 === 1) {
    return true;
  } else {
    return false;
  }
}
function prioritizeBookingOrder(games) {
  // Kriterier
}
function transferGames(from, to) {
  from.forEach((game) => {
    to.push(game);
  });
  from = [];
  return to;
}
function copyArray(from, to) {
  from.forEach((element) => {
    to.push(element);
  });
}
function thisWeeksGames() {
  let games = [];
  for (let i = 0; i < gamesPerWeek + 1; i++) {
    games.push(gamesLeftExceptLastWeek[0]);
    gamesLeftExceptLastWeek.splice(0, 1);
  }
  return games;
}
function gamesToBookThisWeek() {
  let gamesToBook = [];
  transferGames(gamesLeftFromLastWeek, gamesToBook);
  transferGames(thisWeeksGames(), gamesToBook);
  prioritizeBookingOrder(gamesToBook);
  return gamesToBook;
}
function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}
function getWeek(matchOrderNumber) {
  const weeks = numberOfPlayers - 1;
  const percentIntoLeague = matchOrderNumber / allGamesInLeague.length;
  const week = weeks * percentIntoLeague;
  return week;
}

function getGameStartDate(matchOrderNumber) {
  const week = getWeek(matchOrderNumber);
  let gameStartDate = new Date(leagueStartDate);
  gameStartDate.setDate(gameStartDate.getDate() + week * 7);
  return getMonday(gameStartDate);
}
function changeDate(startDate, days, hours, minutes) {
  startDate.setDate(startDate.getDate() + (days - 1));
  startDate.setHours(hours, minutes);
  startDate.setHours(startDate.getHours() + hourOffset);
}

function convertSlots(slots, monday) {
  let array = [];
  slots.forEach((slot) => {
    const slotTime = new Date(monday);

    const day = parseInt(slot.charAt(0));
    const hours = parseInt(slot.substr(1, 2));
    const minutes = parseInt(slot.substr(3, 2));
    changeDate(slotTime, day, hours, minutes);
    array.push(slotTime);
  });
  return array;
}
function possibleTimes(game, startDate) {
  const monday = getMonday(startDate);

  let times = [];
  if (isWeekOdd(monday)) {
    const convertedSlots = convertSlots(game.oddslots, monday);
    convertedSlots.forEach((time) => {
      times.push(time);
    });
  } else {
    const convertedSlots = convertSlots(game.evenslots, monday);
    convertedSlots.forEach((time) => {
      times.push(time);
    });
  }

  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  if (isWeekOdd(nextMonday)) {
    const convertedSlots = convertSlots(game.oddslots, nextMonday);

    convertedSlots.forEach((time) => {
      times.push(time);
    });
  } else {
    const convertedSlots = convertSlots(game.evenslots, nextMonday);

    convertedSlots.forEach((time) => {
      times.push(time);
    });
  }
  return times;
}
function sortGamesByPossibleTimes(games) {
  let array = [];
  games.forEach((game, index) => {
    const startDate = getGameStartDate(index);
    game.possibleTimes = possibleTimes(game, startDate);
    array.push(game);
  });
  array.sort(function (a, b) {
    var x = a.possibleTimes.length < b.possibleTimes.length ? -1 : 1;
    return x;
  });
  return array;
}

function bookGame(game) {
  for (let i = 0; i < game.possibleTimes.length; i++) {
    try {
      bookTimeInPlaytomic(game.possibleTimes[i]);
      game.bookedtime = game.possibleTimes[i];
      console.log('Worked');
      break;
    } catch (error) {
      console.log('Kunde inte boka match: ' + game.ID);
      console.log(error);
    }
  }
}
function bookGames(games) {
  // Hämta alla matcher som inte är bokade
  sortGamesByPossibleTimes(games).forEach((game, index) => {
    bookGame(game);
  });
  console.log(allGamesInLeague);
}

// copyArray(allGamesInLeague, g4amesLeftExceptLastWeek);
// console.log(possibleTimes(allGamesInLeague[0], leagueStartDate));
bookGames(allGamesInLeague);
// console.log(sortGamesByPossibleTimes(allGamesInLeague));
// const week = getWeek(5);
// let gameStartDate = new Date(leagueStartDate);
// gameStartDate.setDate(gameStartDate.getDate() + week * 7);

// console.log(leagueStartDate);
// console.log(isWeekOdd(leagueStartDate));
// bookTimeInPlaytomic(leagueStartDate);
