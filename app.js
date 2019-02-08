'use strict';
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// declare routes
// const auth = require('./routes/auth');
const venues = require('./routes/venues');
const beers = require('./routes/beers');

// db connect
mongoose.connect('mongodb://tapman:tapman1@ds026658.mlab.com:26658/tapmantest', {
  useNewUrlParser: true,
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE
});

// CORS
// headers must include credentials and origin matching "tapman.beer" in order to allow access.
app.use(cors({
  credentials: true,
  origin: (origin, cb) => {
    if (!origin) {
      console.error('no headers received');
    } else if (origin.includes('tapman.beer') || origin.includes('localhost')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
}));

// session
app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  secret: 'some-string',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// use routes
// app.use('/auth', auth);
app.use('/venues', venues);
app.use('/beers', beers);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({ code: 'not-found' });
});

app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500).json({ code: 'unexpected' });
  }
});

module.exports = app;
