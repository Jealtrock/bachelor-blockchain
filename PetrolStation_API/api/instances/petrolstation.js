const db = require('../../database/db.js');

var Petrolstation = function(){};

Petrolstation.blockedStations = {};
Petrolstation.costumerFuelingAt = {};
Petrolstation.stationInfoObject = {

	'Super': {cost: '22', unit: 'liter'},
	'SuperE10': {cost: '15', unit: 'liter'},
	'Diesel': {cost: '10', unit: 'liter'},
	'ENERGY-SB': {cost: '2', unit: 'kwH'}

}

Petrolstation.prototype.initialize_fueling = async function(fuel_type, station, callback) {

	if(! Petrolstation.stationInfoObject[fuel_type]) return callback('Please select a valid fuel.');
	
	let initialize_fueling = new Promise(async (resolve, reject) => {

		let id = parseInt(Date.now()/1000);

		if(Petrolstation.blockedStations[station] && Petrolstation.blockedStations[station].blocked === true) return reject('The station is already in use.');

		initialize = new Promise((resolve, reject) => {

			db.connect();
			db.insert_new_costumer(id, station, fuel_type, (err, result) => {
				db.end();

				if(err) return reject(err);

				if(result.affectedRows > 0){

					Petrolstation.costumerFuelingAt[id] = station;
					Petrolstation.blockedStations[station] = {
						blocked: true, 
						fuel_type: fuel_type, 
						cost: 0, 
						amount: 0, 
						initTimestamp: Date.now(), 
						id: id
					};

					resolve(id);

				}else
					reject('The costumer already exists.');

			});

		});

		try{
			return resolve(await initialize);
		}catch(err){
			return reject(err);
		}

	});

	try{
		callback(null, await initialize_fueling);
	}catch(err){
		callback(err);
	}

};

Petrolstation.prototype.start_fueling = function(id){

	cost_per_unit = parseInt(Petrolstation.stationInfoObject[Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].fuel_type].cost);

	if(typeof Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].start_fueling_at === 'undefined')
		Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].start_fueling_at = Date.now();

	Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].fueling = new Promise((resolve, reject) => {

		let fueling = setInterval(() => {

			Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].cost += cost_per_unit;
			Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].amount++;

		}, 1000);

		resolve(fueling);

	});

	return true;

}

Petrolstation.prototype.get_fueling = function(id) {
	return {
		cost: Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].cost, 
		amount: Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].amount, 
		unit: Petrolstation.stationInfoObject[Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].fuel_type].unit};

};

Petrolstation.prototype.pause_fueling = async function(id, callback) {
	try{
		clearInterval(await Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].fueling);
		callback(null, true);
	}catch(err){
		callback(err);
	}
};

Petrolstation.prototype.end_fueling = async function(id, callback) {

	try{
		let fueling = await Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].fueling;
		clearInterval(fueling);
		delete Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].fueling;

		let response = Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]];
		response.end_fueling_at = Date.now();
		response.unit = Petrolstation.stationInfoObject[Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].fuel_type].unit;
		delete response.blocked;
		delete Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]];

		let response_object = new Promise((resolve, reject) => {

			db.connect();
			db.get_latest_IOTA_address((err, result) => {
				
				if(err){ 
					db.end();
					return reject(err);
				}

				response.address = result;

				db.update_costumer(id, response.cost, result, (err, result) => {
					db.end();

					if(err) return reject(err);

					resolve(response);

				});

			});

		});

		callback(null, await response_object);
	}catch(err){
		callback(err);
	}

};

module.exports = Petrolstation;