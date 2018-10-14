const iota = require('iota.lib.js');

var PetrolstatioIotaInterface = function(seed){

	this.seed = 'SJCKLDKFKLVJFLKSLOOSKCMJVJKDKS9VMJBJSKSDFKJKLJCVNMBLFDJKSADJFSDFJHJKCFVDKSDKLFJJK';
	this.iota = new iota({
		provider: 'https://potato.iotasalad.org:14265'
	});

}

PetrolstatioIotaInterface.prototype.addNewAddressToTangle = async function(callback) {

	//Get the newest unused address
	let get_address = new Promise((res, rej)=>{

		this.iota.api.getNewAddress(this.seed, {index: 0}, (err, address)=>{
			if(err){
				callback(err);
				rej(err);
			}else{
				callback(null, address);
				res(address);
			}
		});

	});

	//Put the data into the transfers Array
	try{
		let address = await get_address;
		let depth = 3;
		let minWeightMagnitude = 14;
		let transfers = [{
			value: 0,
			address: address
		}];

		//send the transfer to the tangle
		this.iota.api.sendTransfer(this.seed, depth, minWeightMagnitude, transfers, (err, object)=>{
			if(err){
				console.log(err);
			}else{
				console.log(object);
			}
		});

	}catch(err){
		callback(err);
	}

};

module.exports = PetrolstatioIotaInterface;

