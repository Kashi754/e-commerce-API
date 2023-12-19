const express = require('express');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();

//import last
import 'dotenv/config';

const app = express();

const PORT = process.env.PORT || 5000;
app.use(express.static(pathToSwaggerUi));

app.use(cors());

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('tiny'));
}

const apiRouter = require('./routes/index');
app.use('/', apiRouter);

if(process.env.NODE_ENV === 'development') {
    app.use(errorHandler());
}

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}!`);
});