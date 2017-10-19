var MongoClient = require('mongodb').MongoClient;
var bcrypt = require("bcrypt-nodejs");
var uuid = require('node-uuid');
var create = require('./user').user;
var valid_length = require('./config').user_valid_length;
var email_domain = require('./config').email_domain;

// Code by Haocen.xu@gmail.com

MongoClient.connect(require('./config').mongodb_url).then(function(db) {
	var collection = db.collection("users");
	
	module.exports.create = function (username, password, email, name) {
		if(!username || !password || !email || !name) {
			return Promise.reject("Missing input.");
		}
		if(!email.endsWith(email_domain)) {
			return Promise.reject("Please use " + email_domain + " email address.");
		} else {
			const user = new create(username, password, email, name);
			return collection.findOne({$or: [{"username": user.username}, {"email": user.email}]}, {"password": 0}).then(function(checkExist){
				if(!checkExist) {
					return collection.insert(user).then(function(){
						return collection.findOne({"id": user.id}, {"password": 0}).then(function(user){return Promise.resolve(user)});
					});
				} else {
					return Promise.reject("Username or email already exist.");
				}
			});
		}
	}
	
	module.exports.login = function (username, password, ip, ua) {
		if(!username || !password) {
			return Promise.reject("Missing input.");
		}
		if(!ip){
			ip = "localhost";
		}
		return collection.findOne({"username": username}).then(function(user){
			if(!user) {
				return Promise.reject("Wrong username or password.");
			} else {
				if(bcrypt.compareSync(password, user.password)) {
					return collection.update({"id": user.id}, {$set: {"session.id": uuid.v4().toString(), "session.ip": ip, "session.ua": ua, "session.date": new Date()}}, {"upsert": false}).then(function() {
						return collection.findOne({"id": user.id}).then(function(user){
							return Promise.resolve(user.session);
						});
					});
				} else {
					return Promise.reject("Wrong username or password.");
				}
			}
		});
	}
	
	module.exports.getUserBySession = function (session_id, ip, ua) {
		if(!session_id || !ua) {
			return Promise.reject("Missing input.");
		}
		if(!ip) {
			ip = "localhost";
		}
		return collection.findOne({"session.id": session_id, "session.ip": ip, "session.ua": ua}, {"password": 0}).then(function(user){
			if(!user) {
				return Promise.reject("Invalid session.");
			} else {
				return Promise.resolve(user);
			}
		});
	}
	
	module.exports.getUsersByCategory = function (category) {
		return Promise.resolve(collection.find({"categories": category}, {"password": 0}).toArray());
	}
	
	module.exports.logout = function (session_id) {
		if(!session_id) {
			return Promise.reject("Missing input.");
		}
		return collection.update({"session.id": session_id}, {$set: {"session.id": null, "session.ip": null, "session.ua": null, "session.date": null}}, {"upsert": false}).then(function(){
			return Promise.resolve("Success.");
		});
	}
	
	module.exports.delete = function (id) { // Backup
		if(!id) {
			return Promise.reject("Missing input.");
		}
		return collection.deleteOne({"id": id}).then(function(){
			return Promise.resolve("Success.");
		});
	}
	
	module.exports.getVerifyToken = function (session_id, ip, ua){ // Will not be used because this is mailer logic
		if(!ip) {
			ip = "localhost";
		}
		return collection.findOne({"session.id": session_id, "session.ip": ip, "session.ua": ua}, {"password": 0}).then(function(user) {
			if(!user){
				return Promise.reject("Invalid session.");
			} else {
				// TODO perform validate in main logic, token only valid for current session
				return Promise.resolve(bcrypt.hashSync(user.username + user.email + user.session.id + user.session.ip + user.session.ua, (new Date()).toString()));
			}
		});
	}
	
	module.exports.verify = function (session_id, ip, ua, token) {
		if(!ip) {
			ip = "localhost";
		}
		return collection.findOne({"session.id": session_id, "session.ip": ip, "session.ua": ua}, {"password": 0}).then(function(user) {
			if(!user){
				return Promise.reject("Invalid session.");
			} else {
				try{
					if(bcrypt.compareSync(user.username + user.email + user.session.id + user.session.ip + user.session.ua, token)) {
						return collection.update({"session.id": session_id, "session.ip": ip, "session.ua": ua}, {$set: {"is_verified": true, "verified_date": new Date()}}, {"upsert": false}).then(function(){
							return Promise.resolve("Success.");
						});
					} else {
						return Promise.reject("Token invalid, do not logout before you recieve validation email.");
					}
				}catch(err){
					return Promise.reject("Token invalid, do not logout before you receive validation email.");
				}
			}
		});
	}
	
	module.exports.canPost = function (session_id, ip, ua) {
		if(!ip) {
			ip = "localhost";
		}
		return collection.findOne({"session.id": session_id, "session.ip": ip, "session.ua": ua}, {"password": 0}).then(function(user){
			if(user){
				var today = new Date();
				if(user && user.is_verified && ((today - user.verified_date) / 86400000) < valid_length) {
					return Promise.resolve("Can post new item.");
				} else {
					return Promise.reject("Please (re)validate your email address.");
					// TODO send mail in main logic
				}
			} else {
				return Promise.reject("Invalid session.");
			}
		});
	}
	
	// following functions will be tested in main logic
	
	module.exports.insertItem = function (session_id, ip, ua, item_id) {
		if(!ip) {
			ip = "localhost";
		}
		return collection.findOne({"session.id": session_id, "session.ip": ip, "session.ua": ua}, {"password": 0}).then(function(user){
			if(user){
				var items = user.items;
				items.push(item_id);
				return collection.update({"session.id": session_id}, {$set: {"items": items}}, {"upsert": false}).then(function(){
					return Promise.resolve(items);
				});
			} else {
				return Promise.reject("Invalid session.");
			}
		});
	}
	
	module.exports.findItems = function (session_id, ip, ua) {
		if(!ip) {
			ip = "localhost";
		}
		return collection.findOne({"session.id": session_id, "session.ip": ip, "session.ua": ua}, {"password": 0}).then(function(user){
			return Promise.resolve(user.items);
		});
	}
	
	module.exports.deleteItem = function (session_id, ip, ua, item_id) {
		if(!ip) {
			ip = "localhost";
		}
		return collection.findOne({"session.id": session_id, "session.ip": ip, "session.ua": ua}, {"password": 0}).then(function(user){
			var items = user.items;
			var index = items.indexOf(item_id);
			if(index > -1) {
				items.splice(index, 1);
				return collection.update({"session.id": session_id}, {$set: {"items": items}}, {"upsert": false}).then(function(){
					return Promise.resolve(items);
					// TODO remove item from db
				});
			} else {
				return Promise.reject("Item not found.");
			}
		});
	}
	
	module.exports.changeCategories = function (session_id, ip, ua, categories) {
		if(!ip) {
			ip = "localhost";
		}
		return collection.findOne({"session.id": session_id, "session.ip": ip, "session.ua": ua}, {"password": 0}).then(function(user){
			if(!user) {
				return Promise.reject("Invalid session.");
			} else {
				return collection.update({"session.id": session_id}, {$set: {"categories": categories}}, {"upsert": false}).then(function(){
					return Promise.resolve(categories);
				});
			}
		});
	}
	
	module.exports.addCategory = function (session_id, ip, ua, category) {
		if(!ip) {
			ip = "localhost";
		}
		return collection.findOne({"session.id": session_id, "session.ip": ip, "session.ua": ua}, {"password": 0}).then(function(user){
			if(!user) {
				return Promise.reject("Invalid session.");
			} else {
				var categories = user.categories;
				categories.push(category);
				return collection.update({"session.id": session_id}, {$set: {"categories": categories}}, {"upsert": false}).then(function(){
					return Promise.resolve(categories);
				});
			}
		});
	}
	
	module.exports.removeCategory = function (session_id, ip, ua, category) {
		if(!ip) {
			ip = "localhost";
		}
		return collection.findOne({"session.id": session_id, "session.ip": ip, "session.ua": ua}, {"password": 0}).then(function(user){
			if(!user) {
				return Promise.reject("Invalid session.");
			} else {
				var categories = user.categories;
				var index = categories.indexOf(category);
				if(index > -1) {
					categories.splice(index, 1);
					return collection.update({"session.id": session_id}, {$set: {"categories": categories}}, {"upsert": false}).then(function(){
						return Promise.resolve(categories);
					});
				} else {
					return Promise.reject("Category not found.");
				}
			}
		});
	}
});