const fs = require('fs');
const mysql = require('mysql');
connection = mysql.createConnection( JSON.parse(fs.readFileSync(__dirname + '/db_init.json')) );

connection.connect = function(){

	connection = mysql.createConnection( JSON.parse(fs.readFileSync(__dirname + '/db_init.json')) );
	connection.connect();

}

connection.get_IOTA_address = function(callback, id){

	id = id || null;

	if( ! id )	var sql = 'SELECT * FROM address';
	else var sql = 'SELECT * FROM address WHERE id="' + id + '"';

	connection.query(sql, callback);

}

connection.get_latest_IOTA_address = function(callback, id){

	id = id || null;

	if( ! id )	var sql = 'SELECT * FROM address';
	else var sql = 'SELECT * FROM address WHERE id="' + id + '"';

	connection.query(sql, (err, result) => {

		if(err) return callback(err);
		if(result.length === 0) return callback('No address found.');

		let highestVal = 0;
		let address = 0;
		let counter = 0;
		for(var row of result){

			if(row.timestamp > highestVal){
				highestVal = row.timestamp;
				address = row.address;
			}

			if(counter > 0)
				address = row.address;
			
			counter++;

		}

		callback(null, address);

	});

}

connection.get_user_password = function(username, callback){

	if(!username) return false;

	var sql = 'SELECT password FROM user WHERE username="' + username + '"';

	connection.query(sql, callback);

}

connection.get_costumer_by_id = function(id, callback){

	var sql = 'SELECT * WHERE timestamp="' + id + '"';

	connection.query(sql, callback);

}

connection.set_new_IOTA_address = function(address, callback){

	if(!address) return callback('No Address has been commited');

	var sql = "INSERT INTO address (timestamp, address) VALUES ?";
	var values = [
		[parseInt(Date.now()/1000), address]
	];

	connection.query(sql, [values], callback);

}

connection.insert_new_costumer = function(id, station, fuel_type, callback){

	var sql = "INSERT INTO costumer (timestamp, station, fuel_type) VALUES ?";
	var values = [
		[id, station, fuel_type]
	];

	connection.query(sql, [values], callback);

}

connection.update_costumer = function(id, cost, address, callback){

	var sql = "UPDATE costumer SET cost = ?, address = ? WHERE timestamp = ?";
	var values = [cost, address, id];

	connection.query(sql, values, callback);

}

module.exports = connection;