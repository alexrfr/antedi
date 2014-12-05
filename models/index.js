if (!global.hasOwnProperty('db')) {

	var mongoose = require('mongoose');

	var dbName = 'antedi'

	var uristring =
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://heroku_app32142267:u11ru90uNyG0_oFiDqOtyCb2n-o24GIb@ds061200.mongolab.com:61200/heroku_app32142267';
	
	//'mongodb://localhost/' + dbName;

	// Makes connection asynchronously.  Mongoose will queue up database
	// operations and release them when the connection is complete.
	mongoose.connect(uristring, function (err, res) {
		if (err) {
			console.log ('mongoose.connect: ERROR connecting to: ' + uristring + '. ' + err);
		} else {
			console.log ('mongoose.connect: Succeeded connected to: ' + uristring);
		}
	});

	global.db = {
		mongoose: mongoose,

		User      :   require('./User')(mongoose),
		Articulo  :   require('./Articulo')(mongoose)   

	};
}

module.exports = global.db;