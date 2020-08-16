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
    .update({ uddaveckor: req.body.uddaLuckor }).then(() => {

    });
  databas('spelare')
    .where({ ID: req.body.spelare })
    .update({ jämnaveckor: req.body.jämnaLuckor }).then(() => {

    });
})

// Hämta matchindo

app.post('/matchdata', (req, res) => {



  let matchnr = req.body.matchnr;
  databas
    .select("hemma1")
    .from("matcher-timrå-H2-södra")
    .where('ID', matchnr)
    .then((array) => {
      let hemma1 = array[0].hemma1;

      res.json(hemma1);

    })
});







