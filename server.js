const express = require('express');
const app = express();
var knex = require("knex")({
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
app.listen(process.env.PORT || 5000);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.headers);
  next();
})

app.get('/', (req, res) => {
  res.send('Startsida');
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;


knex
  .select("*")
  .from("users")
  .then((data) => {
    console.log(data);
  });