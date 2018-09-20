const express = require('express');
const address_route_getAddress = require('./api/routes/getAddress.js');
const address_route_user = require('./api/routes/user.js');
const bodyParser = require('body-parser');
const api = express();

api.use(bodyParser.urlencoded({extended: true}));
api.use(bodyParser.json());

api.use('/getAddress', address_route_getAddress);
api.use('/user', (req, res, next) => {

	if(req.method === 'OPTIONS'){
		res.header('WWW-Authenticate: Basic realm="User Visible Realm"');
		return res.status(200).json({});
	}

	next();

}, address_route_user);

module.exports = api;