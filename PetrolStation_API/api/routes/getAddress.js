const express = require('express');
const db = require('../../database/db.js');
const router = express.Router();

router.get('/', (req, res, next) => {

	db.connect();
	db.get_IOTA_address(function(err, rows){

		db.end();

		if(err)	throw err;

		var highest_timestamp = 0;
		var address = '';

		for (var row of rows){
			if(parseInt(row.timestamp) > highest_timestamp){

				highest_timestamp = parseInt(row.timestamp);
				address = row.address;

			}
		}

		res.status(200).json({
			address: address
		});

	});

});

module.exports = router;