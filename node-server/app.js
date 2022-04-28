require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

const passport = require('passport');

const BearerStrategy = require('passport-azure-ad').BearerStrategy;

const config = {
  credentials: {
    tenantID: '79be6dc1-d78e-4bbb-b22b-d994c0a417a7',
    clientID: '043dbbb8-211c-43f2-af74-fb062d385968',
    audience: '043dbbb8-211c-43f2-af74-fb062d385968',
  },
  resource: {
    // scope: ["openid", "profile", "email"],
  },
  metadata: {
    authority: 'login.microsoftonline.com',
    discovery: '.well-known/openid-configuration',
    version: 'v2.0',
  },
  settings: {
    validateIssuer: true,
    passReqToCallback: false,
    loggingLevel: 'info',
  },
};

const options = {
  identityMetadata: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}/${config.metadata.discovery}`,
  issuer: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}`,
  clientID: config.credentials.clientID,
  audience: config.credentials.audience,
  validateIssuer: config.settings.validateIssuer,
  passReqToCallback: config.settings.passReqToCallback,
  loggingLevel: config.settings.loggingLevel,
  // scope: config.resource.scope,
};

const bearerStrategy = new BearerStrategy(options, (token, done) => {
  // Send user info using the second argument
  done(null, {}, token);
});

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(passport.initialize());

passport.use(bearerStrategy);

const routes = require('./router/router.js');
app.use('/', routes);

app.get(
  '/',
  passport.authenticate('oauth-bearer', { session: false }),
  (req, res) => {
    res.send({ msg: 'catch all route, do nothing' });
  }
);

app.listen(3000, () => console.log(`Listening on: 3000`));
module.exports.handler = serverless(app);
