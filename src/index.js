const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();
const passport = require('passport');
const session = require('express-session');
const rateLimiterMiddleware = require('./middleware/rateLimiterPostgres');
const forceHttps = require('./middleware/forceHttps');

// Import Passport config
require('./config/passport');

//import last
require('dotenv').config();

const app = express();

const unless = (path, middleware) => {
  return (req, res, next) => {
    if (path.indexOf(req.path) !== -1) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
};

const PORT = process.env.PORT || 5000;

app.use('/docs', express.static(pathToSwaggerUi));
app.use('/assets', express.static('public'));

// App Config
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  })
);

app.use(rateLimiterMiddleware);
app.use(unless(['/webhook'], express.json()));
app.use(unless(['/webhook'], express.urlencoded({ extended: true })));
app.use(forceHttps);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('tiny'));
}

// Session Config
const KnexSessionStore = require('connect-session-knex')(session);
const { knex } = require('./db/db');

const knexStore = new KnexSessionStore({
  knex,
  tablename: 'sessions',
});

const SessionCookie =
  process.env.NODE_ENV == 'development'
    ? {
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 60 * 24 * 2, //2 day
        httpOnly: true,
      }
    : {
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 60 * 24 * 2, //2 day
        httpOnly: true,
      };

const sess = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: knexStore,
  cookie: { ...SessionCookie },
});

if (process.env.NODE_ENV == 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.set('trust proxy', 1);
app.use(sess);

// Passport Config
app.use(passport.initialize());
app.use(passport.session());

// Router
const apiRouter = require('./routes/apiRouter');
app.use('/', apiRouter);

// ErrorHandler

// eslint-disable-next-line no-unused-vars
const jsonErrorHandler = (err, req, res, next) => {
  if (res.status)
    res.status(err.status || 500).send({
      status: err.status || 500,
      message: err.message || 'Internal Server Error',
    });
};

app.use(jsonErrorHandler);

// Spin Up the Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
