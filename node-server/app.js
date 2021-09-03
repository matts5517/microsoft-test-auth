require("dotenv").config();
const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const routes = require("./router/router.js");
app.use("/", routes);

app.get("/", (req, res) => {
  res.send({ msg: "catch all route, do nothing" });
});

app.listen(3000, () => console.log(`Listening on: 3000`));
module.exports.handler = serverless(app);
