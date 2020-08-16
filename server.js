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

// Skicka udda luckor
app.post('/luckor', (req, res) => {
  let uddaveckor = [];
  let jämnaveckor = [];
  let spelare = 7;
  databas
    .select("uddaveckor")
    .from("spelare")
    .where('ID', spelare)
    .then((array) => {
      uddaveckor = array[0].uddaveckor;
      console.log(uddaveckor);

    });
  databas
    .select("jämnaveckor")
    .from("spelare")
    .where('ID', spelare)
    .then((array) => {
      jämnaveckor = array[0].jämnaveckor;
      console.log(jämnaveckor);
    });

  if (uddaveckor == [] && jämnaveckor == []) {
    let response = {
      u: uddaveckor,
      j: jämnaveckor
    }
    console.log(response);
    res.json(response);
  } else { null }

});

// Skicka jämna luckor
/* app.get('/even', (req, res) => {
  databas
    .select("jämnaveckor")
    .from("spelare")
    .where('ID', 7)
    .then((array) => {
      res.json(array[0].jämnaveckor);
    });
}); */

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








