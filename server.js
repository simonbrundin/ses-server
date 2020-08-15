const express = require('express');
const { json } = require('express');
const app = express();
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
  console.log(port);
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Logga reguesten
/* app.use((req, res, next) => {
  console.log(req.headers);
  next();
}) */

app.get('/udda', (req, res) => {
  databas
    .select("uddaveckor")
    .from("spelare")
    .where('ID', 7)
    .then((array) => {
      res.json(array[0].uddaveckor);
    });
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;




