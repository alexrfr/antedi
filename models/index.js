if (!global.hasOwnProperty('db')) {

	var mongoose = require('mongoose');

	var dbName = 'vendoferta'

	var uristring =
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://heroku_app23353677:akulk5943aorm4rkn2dhbmq1vo@ds031628.mongolab.com:31628/heroku_app23353677';
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