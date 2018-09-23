const express = require('express');
const basicAuth = require('express-basic-auth');
const passwordHash = require('password-hash');
const db = require('../../database/db.js');
const router = express.Router();

var arr_is_empty = function (array){
	return !(typeof array !== "undefined" && array !== null && array.length !== null && array.length > 0);
}

var authorizeUser = function(username, password, cb){

	db.connect();

	let db_call = new Promise((resolve, reject) => {

		db.get_user_password(username, (err, rows) => {
			db.end();
			if (!arr_is_empty(rows) && passwordHash.verify(password, rows[0].password)) resolve(true);
			else resolve(false);

		});

	});

	db_call.then(value => {

		cb(null, value);

	});

}

router.use(basicAuth({
	authorizer: authorizeUser,
	authorizeAsync: true,
	challenge: true
}));

router.post('/addNewAddress', async (req, resp, next) => {

	_add_to_db = new Promise((resolve, reject) => {

		db.connect();

		db.set_new_IOTA_address(req.body.address, (err, result) => {

			if(err){
				db.end();
				return reject(err);
			}

			let response = {};

			response.affectedRows = result.affectedRows;
			resolve(response);

		});

	});

	try{
		req.responseObject = await _add_to_db;
		next();
	}catch(err){
		return next(err);		
	}

}, async (req, resp, next) => {

	_previous_addresses = new Promise((resolve, reject) => {

		db.get_IOTA_address((err, rows) => {
			db.end();		

			if(err) return reject(err);
			
			let response = req.responseObject;
			response.saved_addresses = [];
			for (var row of rows){
				response.saved_addresses.push(row.address);
			}
			resolve(response);
		});

	});

	try{

		let response = await _previous_addresses;
		response.message = "Address is successfully added to the database and will be used for later transactions.";

		resp.status(200).json(response);

	}catch(err){
		return next(err);
	}

});

router.post('/addUser', (req, resp, next) => {

	resp.status(200).json({

		"message": "Everythings fine"

	});

});

module.exports = router;