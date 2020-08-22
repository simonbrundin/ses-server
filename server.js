const express = require('express');
const { json } = require('express');
const app = express();

var cors = require('cors');

var databas = require("knex")({
  client: "pg",
  connection: {
    host: "ec2-54-228-209-117.eu-west-1.compute.amazonaws.com",
    user: "gjedfoxspsphbk",
    password:
      "5b932fe02e6e00f011d1d99402f7b9c20563b7a48b65c57bd2874a83047f82bb",
    database: "d5b9uiqv8vquho",
    ssl: true
  },
});

const port = process.env.PORT || 7777;

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

// Skicka spelarinfo

app.post('/spelare', (req, res) => {



  let spelare = req.body.spelare;
  databas
    .select("firstname")
    .from("spelare")
    .where('ID', spelare)
    .then((array) => {
      let förnamn = array[0].firstname;

      res.json(förnamn);

    })
});





// Hämta luckor
app.post('/luckor', (req, res) => {



  let spelare = req.body.spelare;
  databas
    .select("uddaveckor")
    .from("spelare")
    .where('ID', spelare)
    .then((array) => {
      let uddaveckor = array[0].uddaveckor;
      databas
        .select("jämnaveckor")
        .from("spelare")
        .where('ID', spelare)
        .then((array) => {
          let jämnaveckor = array[0].jämnaveckor;

          /* let uddaveckor = this.uddaveckor; */
          let response = {
            u: uddaveckor,
            j: jämnaveckor
          }

          res.json(response);

        })
    });
});

// Spara luckor
app.post('/sparaluckor', (req, res) => {

  databas('spelare')
    .where({ ID: req.body.spelare })
    .update({ uddaveckor: req.body.oddSlots }).then(() => {

    });
  databas('spelare')
    .where({ ID: req.body.spelare })
    .update({ jämnaveckor: req.body.evenSlots }).then(() => {

    });
  res.json('sparat')
})

// Hämta möjliga matchtider

app.post('/matchluckor', (req, res) => {
  let hemma1 = 7;
  let hemma2 = 5;
  let borta1 = 10;
  let borta2 = 13;
  databas.select('uddaveckor', 'jämnaveckor').from('spelare').where('ID', hemma1).orWhere('ID', hemma2).orWhere('ID', borta1).orWhere('ID', borta2).then((array) => {

    /* console.log(array[0]); */
    /* console.log('hemma1: udda veckor = ' + array[0].uddaveckor);
    console.log('hemma2: udda veckor = ' + array[1].uddaveckor);
    console.log('borta1: udda veckor = ' + array[2].uddaveckor);
    console.log('borta2: udda veckor = ' + array[3].uddaveckor); */
    var intersection1 = array[0].uddaveckor.filter(function (e) {
      return array[1].uddaveckor.indexOf(e) > -1;
    });
    var intersection2 = intersection1.filter(function (e) {
      return array[2].uddaveckor.indexOf(e) > -1;

    });
    var intersection3 = intersection2.filter(function (e) {
      return array[3].uddaveckor.indexOf(e) > -1;
    });
    if (intersection3.length < 2) {
      let uddaluckor = [];
      console.log('inga gemensamma luckor');

    } else {
      let convertedSlots = [];
      for (var i = 0, len = intersection3.length; i < len; i++) {
        let dagMotNummer = intersection3[i].replace("M", "1").replace("Ti", "2").replace("O", "3").replace("To", "4").replace("F", "5").replace("L", "6").replace("S", "7");
        console.log(dagMotNummer);
        let numberFromString = parseInt(dagMotNummer);
        convertedSlots.push(numberFromString);
      }
      convertedSlots.sort();

      for (let index = 0; index < convertedSlots.length; index++) {
        const element = array[index];

      }


      console.log(convertedSlots);
    }

  })
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







