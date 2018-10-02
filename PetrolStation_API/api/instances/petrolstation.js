const db = require('../../database/db.js');

var intersect_key = function(o1, o2){

	keys_o1 = o1.keys();
	Keys_o2 = o2.keys();

	const [first, next] = keys_o1.length > keys_o2.length ? [keys_o1, o2] : [keys_o2, o1];
 	
 	first.filter(k => {



 	});
};

var Petrolstation = function(){};

Petrolstation.blockedStations = {};
Petrolstation.costumerFuelingAt = {};
Petrolstation.stationInfoObject = {

	Super: '22',
	SuperE10: '15',
	Diesel: '10'

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
						liter: 0, 
						timestamp: Date.now(), 
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

	cost_per_liter = parseInt(Petrolstation.stationInfoObject[Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].fuel_type]);


	Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].start_fueling_at = Date.now();
	Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].fueling = new Promise((resolve, reject) => {

		let fueling = setInterval(() => {

			Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].cost += cost_per_liter;
			Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].liter++;

		}, 1000);

		resolve(fueling);

	});

	return true;

}

Petrolstation.prototype.get_fueling = function(id) {
	return {cost: Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].cost, liter: Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].liter};

};

Petrolstation.prototype.end_fueling = async function(id, callback) {

	try{
		let fueling = await Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].fueling;
		clearInterval(fueling);
		delete Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]].fueling;

		let response = Petrolstation.blockedStations[Petrolstation.costumerFuelingAt[id]];
		response.end_fueling_at = Date.now();
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