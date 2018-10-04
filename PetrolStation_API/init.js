const fs = require('fs');

var init = function(){

	var http = require('http');
	var api = require('./api');
	var port = 1717;
	var server = http.createServer(api);
	server.listen(port);

	console.log('API has started and is listening to Port ' + port + '...');

}

var lookForDatabaseCfg = function(){

	var url = './database/db_init.json';

	if( ! fs.existsSync(url) ){

		const readline = require('readline-sync');

		console.log('Please enter some data to initialise the Database:');

		var db_login_data = {

			host: readline.question('Location: '),
			user: readline.question('Username: '),
			password: readline.question('Password: '),
			database: readline.question('Database: ')

		};

		json_string = JSON.stringify(db_login_data);

		fs.writeFile(url, json_string, function(err){ if(err) throw err; init(); });

	}else{

		init();

	}

}

lookForDatabaseCfg();