const express = require('express');
const db = require('../../database/db.js');
const Petrolstation = require('../instances/petrolstation.js');
const petrolstation = new Petrolstation();
const router = express.Router();

var check_for_initialisation = (req, resp, next) => {

	if(! (req.query && req.query.id && Petrolstation.costumerFuelingAt[req.query.id] && Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[req.query.id]].id == req.query.id)) 
		return resp.status(200).json({message: 'Please initialize the fueling firstly.'});

	next();

}

router.get('/getStationInfo', (req, resp, next) => {

	resp.status(200).json(Petrolstation.stationInfoObject);

});

router.get('/initializeFueling', (req, resp, next) => {

	if(! (req.query.fuel_type && req.query.station)) return next('You missed the required parameter.');

	petrolstation.initialize_fueling(req.query.fuel_type, req.query.station, (err, result) => {

		if(err) return next(err);

		resp.status(200).json({
			id: result
		});

	});

});

router.get('/startFueling', check_for_initialisation, (req, resp, next) => {	

	if(petrolstation.start_fueling(req.query.id)){
		resp.status(200).json({

			message: 'Start fueling.'

		});
	}else{
		next('Anything went wrong.');
	}
});

router.get('/getFueling', check_for_initialisation, (req, resp, next) => {	

	resp.status(200).json({

			data: petrolstation.get_fueling(req.query.id)

	});

});

router.get('/pauseFueling', check_for_initialisation, (req, resp, next) => {

	petrolstation.pause_fueling(req.query.id, (err, success) => {

		if(err) return next(err);

		resp.status(200).json({
			message: 'Pause fueling'
		});

	});

});

router.get('/endFueling', check_for_initialisation, (req, resp, next) => {

	petrolstation.end_fueling(req.query.id, (err, result) => {

		if(err) return next(err);

		resp.status(200).json({
			data: result
		});

	});

});

module.exports = router;