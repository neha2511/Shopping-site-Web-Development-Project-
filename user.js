var bcrypt = require('bcrypt-nodejs');
var uuid = require('node-uuid');

const saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);

// Code by Haocen.xu@gmail.com

function user(username, password, email, name) {
	this.id = uuid.v4().toString();
	this.username = username;
	this.password = bcrypt.hashSync(password, salt);
	this.email = email;
	this.truename = name;
	this.items = []; // ids of items owned by user
	this.categories = [];
	this.is_verified = false;
	this.verified_date = null;
	this.session = {"id": null, "ip": null, "ua": null, "date": null}
}

module.exports = {
	user
}