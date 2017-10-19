var uuid = require('node-uuid');
var bcrypt = require('bcrypt-nodejs');
var key = require('./config').mailgun_key;
var mg = new (require('mailgun')).Mailgun(key);
var site = require('./config').site_domain;

// Code by Haocen.xu@gmail.com

/*mg.sendText('noreply@hushtek.tk',
	['haocen.xu@gmail.com'],
	'Behold the wonderous power of email!',
	'Email validation test.',
	function(err) {
		err && console.log(err)
	});*/

function sendVerifyMail(user) {
	if(!user){
		return Promise.reject("Invalid user.");
	} else {
		var token = bcrypt.hashSync(user.username + user.email + user.session.id + user.session.ip + user.session.ua);
		console.log(token + " " + encodeURIComponent(token));
		mg.sendText("noreply@" + site, [user.email], "Greetings from " + site, "Please click on the link to verify your email address: " + "\nhttps://" + site + "/verify/" + encodeURIComponent(token), function(err) {
			err && console.log(err);
		});
		return Promise.resolve("Verification sent.");
	}
}

function sendNewItemMail(users, item) {
	console.log(users, item);
	if(!users || !item || !Array.isArray(users)) {
		return Promise.reject("Invalid users or item.");
	} else {
			users.forEach(function(user) {
			mg.sendText("noreply@" + site, [user.email], "New item listed on " + site, "We've found following new item listed in your interested category: " + "\nhttps://" + site + "/product-detail/" + item.id, function(err) {
				err && console.log(err);
			});
			//console.log(user.email, item.title);
		});
		return Promise.resolve("New item notification sent.");
	}
}

function sendExpireItemMail(user, item) { // Backup
	if(!user || !item) {
		return Promise.reject("Invalid users or item.");
	} else {
		mg.sendText("noreply@" + site, [user.email], "Expired item visited on " + site, "We've found following expired item visited: " + "\nhttps://" + site + "/product-detail/" + item.id + "\nPlease post it again if item is not sold yet. Otherwise Please ignore this email.", function(err) {
			err && console.log(err);
		});
		return Promise.resolve("Expired item notification sent.");
	}
}

module.exports = {
	sendVerifyMail,
	sendNewItemMail,
	sendExpireItemMail
}