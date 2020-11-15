

var databas = require("knex")({
  client: "pg",
  connection: {
    host: "ec2-99-81-238-134.eu-west-1.compute.amazonaws.com",
    user: "dvegibxguktzkr",
    password:
      "7c2d2336f9ad43508386e6c5caa7839c995b3aac42eafbaeb2ef78b4273dc437",
    database: "dcb174s6rpt7sn",
    ssl: true
  },
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

let city = 'timra';
let league = '1';
let leagueName = 'timra-2'
let numberOfPlayers = 12;


let databaseName = 'matcher-' + leagueName;
let players = {
  1: { playedOpponents: [], playedWith: [], id: 0 },
  2: { playedOpponents: [], playedWith: [], id: 0 },
  3: { playedOpponents: [], playedWith: [], id: 0 },
  4: { playedOpponents: [], playedWith: [], id: 0 },
  5: { playedOpponents: [], playedWith: [], id: 0 },
  6: { playedOpponents: [], playedWith: [], id: 0 },
  7: { playedOpponents: [], playedWith: [], id: 0 },
  8: { playedOpponents: [], playedWith: [], id: 0 },
  9: { playedOpponents: [], playedWith: [], id: 0 },
  10: { playedOpponents: [], playedWith: [], id: 0 },
  11: { playedOpponents: [], playedWith: [], id: 0 },
  12: { playedOpponents: [], playedWith: [], id: 0 },
  13: { playedOpponents: [], playedWith: [], id: 0 },
  14: { playedOpponents: [], playedWith: [], id: 0 },
  15: { playedOpponents: [], playedWith: [], id: 0 },
  16: { playedOpponents: [], playedWith: [], id: 0 }
};

let matches = [];



function tournament(n) {
  for (var r = 1; r < n; r++) {
    // htmllist += "\n<B>" + format(r) + ":</B> 1";
    // for (var i = 2; i <= n; i++) {
    //   htmllist += " " + format(((r + i - 2) % (n - 1)) + 2);
    // }

    for (i = 1; i <= n / 2; i++) {
      if (i === 1) {
        home1 = 1;
        home2 = ((n - 1 + r - 1) % (n - 1)) + 2;
        // console.log("h" + home1, home2);
      } else if (i % 2 === 0) {
        away1 = ((r + i - 2) % (n - 1)) + 2;
        away2 = ((n - 1 + r - i) % (n - 1)) + 2;



        players[home1].playedWith.push(home2);
        players[home1].playedOpponents.push(away1);
        players[home1].playedOpponents.push(away2);
        players[home2].playedWith.push(home1);
        players[home2].playedOpponents.push(away1);
        players[home2].playedOpponents.push(away2);
        players[away1].playedWith.push(away2);
        players[away1].playedOpponents.push(home1);
        players[away1].playedOpponents.push(home2);
        players[away2].playedWith.push(away1);
        players[away2].playedOpponents.push(home1);
        players[away2].playedOpponents.push(home2);

        home1 = players[home1].id;
        home2 = players[home2].id;
        away1 = players[away1].id;
        away2 = players[away2].id;

        matches.push({
          home1: home1,
          home2: home2,
          away1: away1,
          away2: away2
        });

        databas(databaseName).insert({ hemma1: home1, hemma2: home2, borta1: away1, borta2: away2 }).then(console.log('ok'));
      } else {
        home1 = ((r + i - 2) % (n - 1)) + 2;
        home2 = ((n - 1 + r - i) % (n - 1)) + 2;
      }
    }
  }
}
databas('spelare').select('*').where({
  city: city,
  league: league
}).then((array) => {
  for (let index = 0; index < array.length; index++) {
    const playerIndex = index + 1;
    const element = array[index];
    players[playerIndex].id = element.ID;


  }
  tournament(numberOfPlayers);
  console.log(players);

  console.log(matches);
  console.log(matches.length);
});




// function newLeague(leagueName) {
//   let database = 'matcher-' + leagueName;
//   console.log(database);
//   databas(database).insert({ hemma1: '1', hemma2: '2', borta1: '3', borta2: '4' }).then(console.log('ok'));

// }




// newLeague('timrå-1');