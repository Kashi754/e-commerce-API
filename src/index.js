const express = require('express');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();
const passport = require('passport');
const session = require('express-session');

// Import Passport config
require('./config/passport');

//import last
import 'dotenv/config';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.static(pathToSwaggerUi));

// App Config
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('tiny'));
}

// Session Config
const KnexSessionStore = require('connect-session-knex')(session);
const { knex } = require('./db/db');

const store = new KnexSessionStore({
    knex,
    tablename: 'sessions'
});

app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 5, //5 minutes, for testing
        },
        store
    })
);

// Passport Config
app.use(passport.initialize());
app.use(passport.session());

// Router
const apiRouter = require('./routes/apiRouter');
app.use('/', apiRouter);

// ErrorHandler
if(process.env.NODE_ENV === 'development') {
    app.use(errorHandler());
}

// Spin Up the Server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}!`);
});