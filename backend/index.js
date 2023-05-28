var express = require("express");
var cors = require("cors");
const mysql = require("mysql2");
require('dotenv').config()

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

var app = express();

app.use(cors());

app.get("/test", function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

app.get("/products", function (req, res, next) {
  // simple query
  connection.query("SELECT * FROM `products`", function (err, results, fields) {
    res.json(results);
  });
});

app.listen(5000, function () {
  console.log("CORS-enabled web server listening on port 5000");
});
