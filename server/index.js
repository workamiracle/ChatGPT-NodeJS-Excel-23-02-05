require("dotenv").config();

const express = require("express");
const app = express();
const port = 5000;

app.use(express.json());

// adding body-parser and cors
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.use('/run', require('./routes/run'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
