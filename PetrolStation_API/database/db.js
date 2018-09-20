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

connection.getUserPassword = function(username, callback){

	if(!username) return false;

	var sql = 'SELECT password FROM user WHERE username="' + username + '"';

	connection.query(sql, callback);

}

connection.set_new_IOTA_address = function(address, callback){

	if(!address) return callback('No Address has been commited');

	var sql = "INSERT INTO address (timestamp, address) VALUES ?";
	var values = [
		[Date.now(), address]
	]

	connection.query(sql, [values], callback);

}

module.exports = connection;