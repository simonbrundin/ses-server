const express = require('express');
const { json } = require('express');
const app = express();

var cors = require('cors');
const e = require('cors');

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

const port = process.env.PORT || 7777;

const appVersion = '1.0.0';

app.listen(port, () => {
  console.log('Porten är ' + port);
});


// Middleware - Gör saker med alla request innan de hanteras
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
// Logga reguesten
/* app.use((req, res, next) => {
  console.log(req.headers);
  next();
}) */

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// ----------------------------------------------------------------------------

// Skicka appversion

app.post('/getappversion', (req, res) => {

  res.json(appVersion);

});





// Skicka spelarinfo

app.post('/getuser', (req, res) => {
  databas
    .select("*")
    .from("spelare")
    .where('socialID', req.body.socialID)
    .then((array) => {
      res.json(array);
    })
});





// Hämta luckor
app.post('/luckor', (req, res) => {

  let spelare = req.body.spelare;
  databas
    .select("oddslots")
    .from("spelare")
    .where('socialID', spelare)
    .then((array) => {
      let oddslots = array[0].oddslots;
      databas
        .select("evenslots")
        .from("spelare")
        .where('socialID', spelare)
        .then((array) => {
          let evenslots = array[0].evenslots;

          /* let oddslots = this.oddslots; */
          let response = {
            u: oddslots,
            j: evenslots
          }
          // console.log(response);
          res.json(response);

        })
    });
});

// Spara luckor
app.post('/sparaluckor', (req, res) => {
  console.log(req.body.oddSlots);
  if (req.body.oddSlots !== []) {
    databas('spelare')
      .where({ socialID: req.body.spelare })
      .update({ oddslots: req.body.oddSlots }).then(() => {

      });
  }
  console.log(req.body.evenSlots);
  if (req.body.evenslots !== []) {
    databas('spelare')
      .where({ socialID: req.body.spelare })
      .update({ evenslots: req.body.evenSlots }).then(() => {

      });

  }
  res.json('sparat');
})

// Hämta möjliga matchtider

app.post('/updatecommonslots', (req, res) => {
  databas('matcher-' + req.body.city + '-' + req.body.league).select('*').then((array) => {
    array.forEach(match => {


      let hemma1 = match.hemma1;
      let hemma2 = match.hemma2;
      let borta1 = match.borta1;
      let borta2 = match.borta2;
      databas('spelare').select('oddslots', 'evenslots').where('ID', hemma1).orWhere('ID', hemma2).orWhere('ID', borta1).orWhere('ID', borta2).then((array) => {

        // Udda luckor
        let commonOddSlots = [];
        var intersection1 = array[0].oddslots.filter(function (e) {
          return array[1].oddslots.indexOf(e) > -1;
        });
        var intersection2 = intersection1.filter(function (e) {
          return array[2].oddslots.indexOf(e) > -1;
        });
        var intersection3 = intersection2.filter(function (e) {
          return array[3].oddslots.indexOf(e) > -1;
        });

        if (intersection3.length < 2) {
          commonOddSlots = [];
          console.log('inga gemensamma udda luckor');

        } else {
          let allCommonOddSlots = [];
          for (var i = 0, len = intersection3.length; i < len; i++) {
            let dagMotNummer = intersection3[i].replace("M", "1").replace("Ti", "2").replace("O", "3").replace("To", "4").replace("F", "5").replace("L", "6").replace("S", "7");

            let numberFromString = parseInt(dagMotNummer);
            allCommonOddSlots.push(numberFromString);
          }
          allCommonOddSlots.sort();

          for (let index = 0; index < allCommonOddSlots.length; index++) {
            if ((allCommonOddSlots[index + 1] - allCommonOddSlots[index]) === 100) {
              commonOddSlots.push(allCommonOddSlots[index]);
              let add30 = allCommonOddSlots[index] + 30;
              commonOddSlots.push(add30);
            };



          }
        }

        // Jämna luckor
        let commonEvenSlots = [];
        var intersection1 = array[0].evenslots.filter(function (e) {
          return array[1].evenslots.indexOf(e) > -1;
        });
        var intersection2 = intersection1.filter(function (e) {
          return array[2].evenslots.indexOf(e) > -1;
        });
        var intersection3 = intersection2.filter(function (e) {
          return array[3].evenslots.indexOf(e) > -1;
        });

        if (intersection3.length < 2) {
          commonEvenSlots = [];
          console.log('inga gemensamma jämna luckor');

        } else {
          let allCommonEvenSlots = [];
          for (var i = 0, len = intersection3.length; i < len; i++) {
            let dagMotNummer = intersection3[i].replace("M", "1").replace("Ti", "2").replace("O", "3").replace("To", "4").replace("F", "5").replace("L", "6").replace("S", "7");

            let numberFromString = parseInt(dagMotNummer);
            allCommonEvenSlots.push(numberFromString);
          }
          allCommonEvenSlots.sort();
          for (let index = 0; index < allCommonEvenSlots.length; index++) {
            if ((allCommonEvenSlots[index + 1] - allCommonEvenSlots[index]) === 100) {
              commonEvenSlots.push(allCommonEvenSlots[index]);
              let add30 = allCommonEvenSlots[index] + 30;
              commonEvenSlots.push(add30);
            };
          }
        }



        // Lägg till gemensamma luckor i matchdatabasen

        databas('matcher-' + req.body.city + '-' + req.body.league)
          .where({ ID: match.ID })
          .update({
            oddslots: commonOddSlots,
            evenslots: commonEvenSlots
          })
          .then(() => {
            console.log('klart');

          });
        res.json('klart');
        // .then((row) => { console.log(row) })

      })

    })
  });

})


// Hämta matchdata

app.post('/matchdata', (req, res) => {



  let matchnr = req.body.matchnr;
  console.log(matchnr);
  databas
    .select('hemma1, hemma2, borta1, borta2')
    .from('spelare')
    .join('matcher-timrå-H2-södra')
    .where('matcher-timrå-H2-södra.ID', 1)
    .then((array) => {
      console.log(array);
      let hemma1 = array[0].hemma1;

      res.json(hemma1);

    })
});



// Lägg till spelare i databas med email
app.post('/addplayer', (req, res) => {
  let emailExists = false;

  if (req.body.cont) {

  }
  databas('spelare').select('*').where('email', req.body.email).then((array) => {
    if (array.length > 0) {
      emailExists = true;
      res.json('Du är redan anmäld')
      console.log('Email finns');
    } else {
      databas('spelare').insert({ firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email, city: req.body.city, tel: req.body.tel, level: req.body.level }).then(res.json('ok'));

    }


  })
});

// Lägg till spelare i databas utan email
app.post('/addplayerwithoutemail', (req, res) => {



  databas('spelare').insert({ firstname: req.body.firstname, lastname: req.body.lastname, city: req.body.city, gender: req.body.gender, league: req.body.league }).then(res.json('ok'));





});

// Uppdatera kontaktuppgifter

app.post('/updateuser', (req, res) => {
  databas('spelare').select('*').where('socialID', req.body.socialID).then((array) => {

    if (array.length > 0) {
      databas('spelare')
        .where({ socialID: req.body.socialID })
        .update({ firstname: req.body.firstName, lastname: req.body.lastName, email: req.body.email, tel: req.body.tel, }).then(() => {
          res.json('Sparat');
        });
    } else {
      databas('spelare').insert({ socialID: req.body.socialID, firstname: req.body.firstName, lastname: req.body.lastName, email: req.body.email, tel: req.body.tel }).then(res.json('Ny användare registrerad'));
    }
  })
});


// Hämta resultat

// Lägg till spelare i databas utan email
app.post('/table/:city/:league', (req, res) => {

  let playerArray = [];

  databas('spelare').where({
    city: req.params.city,
    league: req.params.league
  }).then(array => {
    array.forEach(player => {
      let playerID = player.ID;
      let firstname = player.firstname;
      let lastname = player.lastname;
      let homePoints = 0;
      let awayPoints = 0;
      let total = 0;
      databas('matcher-' + req.params.city + '-' + req.params.league).where('hemma1', playerID).orWhere('hemma2', playerID).sum('pointshemma').then(sum => {
        if (sum[0].sum === null) {
          homePoints = 0;
        } else {
          homePoints = sum[0].sum;
        }
        homePoints = parseInt(homePoints);
        databas('matcher-' + req.params.city + '-' + req.params.league).where('borta1', playerID).orWhere('borta2', playerID).sum('pointsborta').then(sum => {
          if (sum[0].sum === null) {
            awayPoints = 0;
          } else {
            awayPoints = sum[0].sum;
          }
          awayPoints = parseInt(awayPoints);
          total = homePoints + awayPoints;
          databas('matcher-' + req.params.city + '-' + req.params.league).where('hemma1', playerID).orWhere('hemma2', playerID).orWhere('borta1', playerID).orWhere('borta2', playerID).count('pointsborta').then(count => {
            let numberOfMatches = count[0].count;
            let ppm = Math.round(total / count[0].count * 10) / 10;
            let playerObject = {
              id: playerID,
              name: firstname + ' ' + lastname,
              matches: numberOfMatches,
              ppm: ppm,
              points: total
            }
            playerArray.push(playerObject)
            if (playerArray.length === 4) {
              res.json(playerArray);
            }
          })
        })
      })
    });


  })
});


// Hämta kommande matcher
app.post('/upcoming', (req, res) => {
  let city = req.body.city;
  let league = req.body.league;
  let playerID = req.body.playerID;
  console.log(city, league, playerID)


  databas('matcher-' + city + '-' + league).select({ firstname: req.body.firstname, lastname: req.body.lastname, city: req.body.city, gender: req.body.gender, league: req.body.league }).then(res.json('ok'));

});

// Hämta alla matcher i SES

app.post('/allmatches', (req, res) => {

  // hämta tabeller
  let leagues = [];
  let matches = [];
  databas.raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'").then(array => {
    array.rows.forEach(table => {
      let name = table.tablename;
      if (name.startsWith('matcher-')) {
        leagues.push(name)
      } else {
        null;
      }
    });

    leagues.sort();
    console.log(leagues);
    leagues.forEach(league => {
      databas(league).select('*').then(array => {
        let matchesInLeague = [];

        matchesInLeague.push(league);
        array.forEach(match => {
          if (match.pointshemma + match.pointsborta === 6) {
            match.status = 'rr'
          } else {
            match.status = 'nn'
          };
          matchesInLeague.push(match);
        });

        matches.push(matchesInLeague);
        if (matches.length === leagues.length) {

          res.json(matches);
        } else {
          null;
        }


      });


    });
  });
























});

