const express = require("express");
const fs = require("fs");
var cors = require("cors");
var jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const auth0PublicKey = fs.readFileSync("./auth0_public.key", "utf-8");

var databas = require("knex")({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

const port = process.env.PORT;

const appVersion = "1.0.0";

// Middleware - Gör saker med alla request innan de hanteras
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.listen(port, () => {
  console.log("Porten är " + port);
});

function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, auth0PublicKey, (err, user) => {
    if (err !== null) return res.json("Förnya token").sendStatus(403);
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
}
// ----------------------------------------------------------------------------

// const getAllLeagueNames = async function () {
//   return await getAllLeagueNamesAwait();
// }

const allLeagueNames = [];
databas
  .raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
  .then((serier) => {
    serier.rows.forEach((table) => {
      let name = table.tablename;
      if (name.startsWith("matcher-")) {
        allLeagueNames.push(name);
      }
    });
  });

// ----------------------------------------------------------------------------

// Skicka appversion

app.post("/getappversion", (req, res) => {
  res.json(appVersion);
});

// Skicka alla liganamn

app.get("/getleaguenames", (req, res) => {
  res.json(allLeagueNames);
});

// Skicka spelarinfo
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

function createNewUser(socialID) {
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

app.get("/user", authenticateToken, async (req, res) => {
  const socialID = req.user.sub;
  switch (await isUserExisting(socialID)) {
    case false:
      createNewUser(socialID);
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

app.post("/getuser", (req, res) => {
  databas
    .select("*")
    .from("spelare")
    .where("socialID", req.body.socialID)
    .then((array) => {
      res.json(array);
    });
});

// Boka alla matcher i en serie

app.post("/bookmatches", (req, res) => {
  // Alla matcher som har gemensamma luckor sorterade efter ID
  databas
    .select("ID", "oddslots", "evenslots")
    .from(req.body.league)
    .where("commonslots" !== "{}")
    .orderBy("ID")
    .then((array) => {
      // Gå igenom en match i taget - Går ju att testa att bara ta en match först genom [0]
      array.forEach();
      array[0];
    });

  res.json(array);

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

app.post("/matchinfo", (req, res) => {
  console.log(req.body.league);
  databas(req.body.league)
    .select("*")
    .where("ID", req.body.matchID)
    .then((array) => {
      res.json(array);
    });
});

// Skicka spelarna som fyllt i schemat

app.get("/players-without-league", (req, res) => {
  let spelareArray = [];
  databas("spelare")
    .select("*")
    .where("league", "")
    .then((array) => {
      array.forEach((spelare) => {
        let namn = spelare.firstname + " " + spelare.lastname;
        console.log(namn);
        spelareArray.push(namn);
      });
    })
    .then(() => {
      res.json(spelareArray);
    });
});

// Skicka ligor där alla platser är fulla

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

// Hämta luckor
app.post("/luckor", (req, res) => {
  let spelare = req.body.spelare;
  databas
    .select("*")
    .from("spelare")
    .where("socialID", spelare)
    .then((array) => {
      let oddslots = array[0].oddslots;
      let evenslots = array[0].evenslots;
      let luckor = {
        u: oddslots,
        j: evenslots,
      };
      res.json(luckor);
    });
});

// Spara luckor
app.post("/sparaluckor", (req, res) => {
  console.log(req.body.oddSlots);
  if (req.body.oddSlots !== []) {
    databas("spelare")
      .where({ socialID: req.body.spelare })
      .update({ oddslots: req.body.oddSlots })
      .then(() => {});
  }
  console.log(req.body.evenSlots);
  if (req.body.evenslots !== []) {
    databas("spelare")
      .where({ socialID: req.body.spelare })
      .update({ evenslots: req.body.evenSlots })
      .then(() => {});
  }
  res.json("sparat");
});

// Uppdatera gemensamma luckor

app.get("/updatecommonslots", (req, res) => {
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

// Hämta matchdata

app.post("/matchdata", (req, res) => {
  let matchnr = req.body.matchID;
  console.log(matchnr);
  databas
    .select("*")
    .from("spelare")
    .join(req.body.league)
    .where("ID", req.body.matchID)
    .then((array) => {
      console.log(array);
      let hemma1 = array[0].hemma1;

      res.json(hemma1);
    });
});

// Lägg till spelare i databas med email
app.post("/addplayer", (req, res) => {
  let emailExists = false;

  if (req.body.cont) {
  }
  databas("spelare")
    .select("*")
    .where("email", req.body.email)
    .then((array) => {
      if (array.length > 0) {
        emailExists = true;
        res.json("Du är redan anmäld");
        console.log("Email finns");
      } else {
        databas("spelare")
          .insert({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            city: req.body.city,
            tel: req.body.tel,
            level: req.body.level,
          })
          .then(res.json("ok"));
      }
    });
});

// Lägg till spelare i databas utan email
app.post("/addplayerwithoutemail", (req, res) => {
  databas("spelare")
    .insert({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      city: req.body.city,
      gender: req.body.gender,
      league: req.body.league,
    })
    .then(res.json("ok"));
});

// Uppdatera kontaktuppgifter

app.post("/updateuser", (req, res) => {
  databas("spelare")
    .select("*")
    .where("socialID", req.body.socialID)
    .then((array) => {
      if (array.length > 0) {
        databas("spelare")
          .where({ socialID: req.body.socialID })
          .update({
            firstname: req.body.firstName,
            lastname: req.body.lastName,
            email: req.body.email,
            tel: req.body.tel,
          })
          .then(() => {
            res.json("Sparat");
          });
      } else {
        databas("spelare")
          .insert({
            socialID: req.body.socialID,
            firstname: req.body.firstName,
            lastname: req.body.lastName,
            email: req.body.email,
            tel: req.body.tel,
            city: "timra",
            oddslots: {},
            evenslots: {},
          })
          .then(res.json("Ny användare registrerad"));
      }
    });
});

// Uppdatera matchinformation

app.post("/updatematch", (req, res) => {
  databas(req.body.league)
    .where({ ID: req.body.ID })
    .update({
      pointshemma: req.body.pointshemma,
      pointsborta: req.body.pointsborta,
    })
    .then(() => {
      res.json("Sparat");
    });
});

// Hämta resultat

// Lägg till spelare i databas utan email
app.post("/table/:city/:league", (req, res) => {
  let playerArray = [];

  databas("spelare")
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

// Hämta kommande matcher
app.post("/upcoming", (req, res) => {
  let city = req.body.city;
  let league = req.body.league;
  let playerID = req.body.playerID;
  console.log(city, league, playerID);

  databas("matcher-" + city + "-" + league)
    .select({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      city: req.body.city,
      gender: req.body.gender,
      league: req.body.league,
    })
    .then(res.json("ok"));
});

// Hämta alla matcher i SES

app.post("/allmatches", (req, res) => {
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
          })
          .then(() => {
            finishedLeagues++;
            if (finishedLeagues === serieLength) {
              console.log(leagues);
              res.json(leagues);
            } else {
              null;
            }
          });
      });
    });
});
