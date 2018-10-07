const express = require('express');
const address_route_getAddress = require('./api/routes/getAddress.js');
const address_route_user = require('./api/routes/user.js');
const address_route_fueling = require('./api/routes/fueling.js');
const bodyParser = require('body-parser');
const api = express();

api.use((req, resp, next) => {
	console.log(req.get('host') + req.originalUrl);
	next();
});
api.use(bodyParser.urlencoded({extended: true}));
api.use(bodyParser.json());

api.use('/getAddress', address_route_getAddress);
api.use('/fueling', address_route_fueling);
api.use('/user', address_route_user);

module.exports = api;