var bcrypt   = require('bcrypt-nodejs');

module.exports = function(mongoose) {

	var Schema = mongoose.Schema;

	var userSchema = new Schema({

		userName : String, 
		password : String

	});
 	
 	// methods ======================
	// generating a hash
 	userSchema.methods.generateHash = function(password) {
    	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	};

	// checking if password is valid
	userSchema.methods.validPassword = function(password) {
	    return bcrypt.compareSync(password, this.password);
	};

	return mongoose.model('User', userSchema);
}