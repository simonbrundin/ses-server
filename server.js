const express = require('express');
const app = express();

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
