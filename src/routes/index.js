const express = require('express');
const openApi = require('../../public/res/openapi.json');

const apiRouter = express.Router();

apiRouter.get('/openapi.json', (req, res, next) => {
    res.json(openApi);
});


module.exports = apiRouter;