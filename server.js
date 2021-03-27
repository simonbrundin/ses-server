const express = require("express");
const fs = require("fs");
var cors = require("cors");
var jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
var databas = require("knex")({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

// Middleware - Gör saker med alla request innan de hanteras
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(setAuthenticationHeaders);
app.use(authenticateToken);

app.listen(process.env.PORT, () => {
  console.log("Port " + process.env.PORT);
});

// ----------------------------------------------------------------------------

// Skicka appversion
function setAuthenticationHeaders(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
}
function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request header
  const auth0PublicKey = fs.readFileSync("./auth0_public.key", "utf-8");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, auth0PublicKey, (err, user) => {
    if (err !== null) return res.json("Förnya token").sendStatus(403);
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
}
function isUserExisting(socialID) {
  return databas
    .select("*")
    .from("spelare")
    .where("socialID", socialID)
    .then((array) => {
      if (array.length === 0) {
        return false;
      } else {
        return true;
      }
    });
}
function createNewUserInDatabase(socialID) {
  databas
    .into("spelare")
    .insert({
      socialID: socialID,
    })
    .then((data) => {
      return data;
    });
}
function getUser(socialID) {
  return databas
    .select("*")
    .from("spelare")
    .where("socialID", socialID)
    .then((data) => {
      return data;
    });
}
function gamesSortedByCommonSlots(league) {
  return databas
    .from(league)
    .select("*")
    .then((array) => {
      array.forEach((game) => {
        let odd = game.oddslots.length;
        let even = game.evenslots.length;
        let total = odd + even;
        game.total = total;
      });
      array.sort((a, b) => (a.total > b.total ? 1 : -1));
      return array;
    });
}

app.get("/user", async (req, res) => {
  const socialID = req.user.sub;
  switch (await isUserExisting(socialID)) {
    case false:
      createNewUserInDatabase(socialID);
      await getUser(socialID).then((user) => {
        res.json(user);
      });
      break;
    case true:
      await getUser(socialID).then((user) => {
        res.json(user);
      });
      break;
  }
});
app.get("/table/:city/:league", async (req, res) => {
  let playerArray = [];

  databas
    .from("spelare")
    .where({
      city: req.params.city,
      league: req.params.league,
    })
    .then((array) => {
      array.forEach((player) => {
        let playerID = player.ID;
        let firstname = player.firstname;
        let lastname = player.lastname;
        let homePoints = 0;
        let awayPoints = 0;
        let total = 0;
        databas("matcher-" + req.params.city + "-" + req.params.league)
          .where("hemma1", playerID)
          .orWhere("hemma2", playerID)
          .sum("pointshemma")
          .then((sum) => {
            if (sum[0].sum === null) {
              homePoints = 0;
            } else {
              homePoints = sum[0].sum;
            }
            homePoints = parseInt(homePoints);
            databas("matcher-" + req.params.city + "-" + req.params.league)
              .where("borta1", playerID)
              .orWhere("borta2", playerID)
              .sum("pointsborta")
              .then((sum) => {
                if (sum[0].sum === null) {
                  awayPoints = 0;
                } else {
                  awayPoints = sum[0].sum;
                }
                awayPoints = parseInt(awayPoints);
                total = homePoints + awayPoints;
                databas("matcher-" + req.params.city + "-" + req.params.league)
                  .where("hemma1", playerID)
                  .orWhere("hemma2", playerID)
                  .orWhere("borta1", playerID)
                  .orWhere("borta2", playerID)
                  .count("pointsborta")
                  .then((count) => {
                    let numberOfMatches = count[0].count;
                    let ppm = Math.round((total / count[0].count) * 10) / 10;
                    let playerObject = {
                      id: playerID,
                      name: firstname + " " + lastname,
                      matches: numberOfMatches,
                      ppm: ppm,
                      points: total,
                    };
                    playerArray.push(playerObject);
                    if (playerArray.length === 4) {
                      res.json(playerArray);
                    }
                  });
              });
          });
      });
    });
});
app.get("/upcoming-games/:city/:league", async (req, res) => {
  const socialID = req.user.sub;
  const league = "matcher-" + req.params.city + "-" + req.params.league;
  const matchID = league + ".ID";
  const bookedtime = league + ".bookedtime";
  databas
    .select(
      matchID,
      bookedtime,
      league + ".hemma1",
      league + ".hemma2",
      league + ".borta1",
      league + ".borta2"
    )
    .from("spelare")
    .join(league, function () {
      this.on(league + ".hemma1", "=", "spelare.ID")
        .onNotNull(bookedtime)
        .orOn(league + ".hemma2", "=", "spelare.ID")
        .orOn(league + ".borta1", "=", "spelare.ID")
        .orOn(league + ".borta2", "=", "spelare.ID");
    })
    .where("spelare.socialID", socialID)
    .then((data) => {
      res.json(data);
    });
});
app.put("/user", async (req, res) => {
  const socialID = req.user.sub;
  databas
    .from("spelare")
    .where({ socialID: socialID })
    .update({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      tel: req.body.tel,
      email: req.body.email,
    })
    .then(() => {
      console.log("User saved");
      res.json("Användare uppdaterad");
    });
});
app.put("/slots", async (req, res) => {
  const socialID = req.user.sub;
  databas
    .from("spelare")
    .where({ socialID: socialID })
    .update({ oddslots: req.body.oddSlots, evenslots: req.body.evenSlots })
    .then(() => {
      console.log("Slots saved");
      res.json("Sparade luckor");
    });
});
app.get("/admin/games", async (req, res) => {
  // hämta tabeller
  let leagues = [];
  let matches = [];
  databas
    .raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
    .then((serier) => {
      serier.rows.forEach((table) => {
        let name = table.tablename;
        if (name.startsWith("matcher-")) {
          // leagues.push(name)
          let liga = {
            namn: "",
            matcher: [],
          };
          liga.namn = name;
          leagues.push(liga);
        } else {
          null;
        }
      });
      let serieLength = serier.rows.length - 1;
      let finishedLeagues = 0;

      leagues.forEach((league) => {
        // Lägg till matcher från databasen i matcher-array
        databas(league.namn)
          .select("*")
          .orderBy("ID")
          .then((matcher) => {
            matcher.forEach((match) => {
              league.matcher.push(match);
            });
            matcher.forEach((match) => {
              let odd = match.oddslots.length;
              let even = match.evenslots.length;
              let total = odd + even;
              match.total = total;
            });
            league.matcher.sort((a, b) => (a.total > b.total ? 1 : -1));
          })
          .then(() => {
            finishedLeagues++;
            if (finishedLeagues === serieLength) {
              res.json(leagues);
            } else {
              null;
            }
          });
      });
    });
});
app.get("/admin/todos/players-without-league", async (req, res) => {
  let spelareArray = [];
  databas
    .from("spelare")
    .select("*")
    .where("league", "")
    .then((array) => {
      array.forEach((spelare) => {
        let namn = spelare.firstname + " " + spelare.lastname;
        spelareArray.push(namn);
      });
    })
    .then(() => {
      res.json(spelareArray);
    });
});
app.get("/admin/game/:league/:matchID", async (req, res) => {
  databas
    .from(req.params.league)
    .select("*")
    .where("ID", req.params.matchID)
    .then((array) => {
      res.json(array);
    });
});
app.put("/admin/game/:league/:matchID", async (req, res) => {
  databas
    .from(req.params.league)
    .where({ ID: req.params.matchID })
    .update({
      pointshemma: req.body.pointshemma,
      pointsborta: req.body.pointsborta,
    })
    .then(() => {
      res.json("Poäng sparade");
    });
});
app.put("/admin/common-slots", async (req, res) => {
  databas
    .raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
    .then((serier) => {
      serier.rows.forEach((table) => {
        let name = table.tablename;

        if (name.startsWith("matcher-")) {
          console.log(name);
          databas(name)
            .select("*")
            .then((array) => {
              array.forEach((match) => {
                let hemma1 = match.hemma1;
                let hemma2 = match.hemma2;
                let borta1 = match.borta1;
                let borta2 = match.borta2;
                databas("spelare")
                  .select("oddslots", "evenslots")
                  .where("ID", hemma1)
                  .orWhere("ID", hemma2)
                  .orWhere("ID", borta1)
                  .orWhere("ID", borta2)
                  .then((array) => {
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
                      console.log("inga gemensamma udda luckor");
                    } else {
                      let allCommonOddSlots = [];
                      for (
                        var i = 0, len = intersection3.length;
                        i < len;
                        i++
                      ) {
                        let dagMotNummer = intersection3[i]
                          .replace("M", "1")
                          .replace("Ti", "2")
                          .replace("O", "3")
                          .replace("To", "4")
                          .replace("F", "5")
                          .replace("L", "6")
                          .replace("S", "7");

                        let numberFromString = parseInt(dagMotNummer);
                        allCommonOddSlots.push(numberFromString);
                      }
                      allCommonOddSlots.sort();

                      for (
                        let index = 0;
                        index < allCommonOddSlots.length;
                        index++
                      ) {
                        if (
                          allCommonOddSlots[index + 1] -
                            allCommonOddSlots[index] ===
                          100
                        ) {
                          commonOddSlots.push(allCommonOddSlots[index]);
                          let add30 = allCommonOddSlots[index] + 30;
                          commonOddSlots.push(add30);
                        }
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
                      console.log("inga gemensamma jämna luckor");
                    } else {
                      let allCommonEvenSlots = [];
                      for (
                        var i = 0, len = intersection3.length;
                        i < len;
                        i++
                      ) {
                        let dagMotNummer = intersection3[i]
                          .replace("M", "1")
                          .replace("Ti", "2")
                          .replace("O", "3")
                          .replace("To", "4")
                          .replace("F", "5")
                          .replace("L", "6")
                          .replace("S", "7");

                        let numberFromString = parseInt(dagMotNummer);
                        allCommonEvenSlots.push(numberFromString);
                      }
                      allCommonEvenSlots.sort();
                      for (
                        let index = 0;
                        index < allCommonEvenSlots.length;
                        index++
                      ) {
                        if (
                          allCommonEvenSlots[index + 1] -
                            allCommonEvenSlots[index] ===
                          100
                        ) {
                          commonEvenSlots.push(allCommonEvenSlots[index]);
                          let add30 = allCommonEvenSlots[index] + 30;
                          commonEvenSlots.push(add30);
                        }
                      }
                    }

                    // Lägg till gemensamma luckor i matchdatabasen

                    databas(name)
                      .where({ ID: match.ID })
                      .update({
                        oddslots: commonOddSlots,
                        evenslots: commonEvenSlots,
                      })
                      .then(() => {
                        null;
                      });
                    res.json("klart");
                    // .then((row) => { console.log(row) })
                  });
              });
            });
        } else {
          null;
        }
      });
    });
});
app.get("/admin/slots-by-common", async (req, res) => {
  const league = "matcher-timra-2";
  await gamesSortedByCommonSlots(league).then((slots) => {
    res.json(slots);
  });
});

app.post("/admin/book/:league", (req, res) => {
  // Alla matcher som har gemensamma luckor sorterade efter ID
  let games = gamesSortedByCommonSlots(req.params.league);
  games.forEach((game) => {});
  // Boka matchen i playtomic

  // Lägg in den bokade tiden i databasen
});

// Skicka spelarnas namn för en viss match

app.post("/getplayersnames", (req, res) => {
  databas
    .select("firstname", "lastname", "ID")
    .from("spelare")
    .where("ID", req.body.hemma1)
    .orWhere("ID", req.body.hemma2)
    .orWhere("ID", req.body.borta1)
    .orWhere("ID", req.body.borta2)
    .then((array) => {
      let spelarObjekt = {};
      array.forEach((spelare) => {
        spelarObjekt[spelare.ID] = {
          firstname: "",
          lastname: "",
        };
        spelarObjekt[spelare.ID].firstname = spelare.firstname;
        spelarObjekt[spelare.ID].lastname = spelare.lastname;
      });
      res.json(spelarObjekt);
    });
});

// Skicka matchinfo

// Skicka spelarna som fyllt i schemat

app.get("/full-leagues", (req, res) => {
  let leagues = {};
  let fullLeagues = [];
  databas("spelare")
    .select("*")
    .then((array) => {
      array.forEach((spelare) => {
        if (leagues[spelare.league] > 0) {
          leagues[spelare.league]++;
        } else {
          leagues[spelare.league] = 1;
        }
      });
    })
    .then(() => {
      for (league in leagues) {
        if (leagues[league] === 16) {
          fullLeagues.push(league);
        }
      }
    })
    .then(() => {
      res.json(fullLeagues);
    });
});

// Hämta resultat

// Lägg till spelare i databas utan email

// Hämta alla matcher i SES
