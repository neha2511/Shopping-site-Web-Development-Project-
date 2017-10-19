var MongoClient = require('mongodb').MongoClient;
var uuid = require('node-uuid');
var createItem = require('./item').item;
var valid_length = require('./config').item_valid_length;

// Code by Haocen.xu@gmail.com

MongoClient.connect(require('./config').mongodb_url).then(function(db) {
	var collection = db.collection("items");
	
	module.exports.create = function(creator_id, title, price, description, category, imgUrl, viewSliderImgMediumUrl, viewSliderImgLargeUrl) {
		//console.log("Create.");
		if(!imgUrl){
			imgUrl = "/img/man/polo-shirt-1.png";
		}
		if(!viewSliderImgMediumUrl){
			viewSliderImgMediumUrl = "/img/view-slider/medium/polo-shirt-1.png";
		}
		if(!viewSliderImgLargeUrl){
			viewSliderImgLargeUrl = "/img/view-slider/large/polo-shirt-1.png";
		}
		//console.log(creator_id, title, price, description, category);
		if(!creator_id || !title || !price || !description || !category) {
			return Promise.reject("Missing input.");
		} else {
			const item = new createItem(imgUrl, viewSliderImgMediumUrl, viewSliderImgLargeUrl, title, price, null, description, category, creator_id);
			return collection.insert(item).then(function(){return Promise.resolve(item);}, function(err){return Promise.reject(err);});
		}
		// TODO Mail matched category users in main logic
	};
	
	module.exports.find = function(id) {
		//console.log("Find: " + id);
		if(!id) {
			return Promise.reject("Missing input.");
		}
		// Must check if expired
		return collection.findOne({"id": id}).then(function(item){
			var today = new Date();
			//console.log(item);
			if(item && ((today - item.date) / 86400000) < valid_length) {
				collection.update({"id": id}, {$inc: {"views": 1}});
				return Promise.resolve(item);
			} else {
				// TODO Mail owner about expired item being viewed in main logic
				return Promise.reject("Item expired.");
			}
		});
	};
	
	module.exports.search = function (keyword) {
		return Promise.resolve(collection.find({"title": new RegExp(keyword, 'i')}).toArray());
	}
	
	module.exports.findByCategory = function (category) {
		//console.log("Find by category.");
		return Promise.resolve(collection.find({"category": category}).toArray());
	};
	
	module.exports.findByMostViewed = function () {
		//console.log("Find by most viewed.");
		return Promise.resolve(collection.find().sort({"views": -1}).toArray());
	};
	
	module.exports.findByLatestCreated = function () {
		//console.log("Find by last created.");
		return Promise.resolve(collection.find().sort({"date": -1}).toArray());
	};
	
	module.exports.findByCreatorId = function (creator_id) {
		return Promise.resolve(collection.find({"creator_id": creator_id}).sort({"date": -1}).toArray());
	}
	
	module.exports.delete = function (id) {
		//console.log("Delete.");
		if(!id) {
			return Promise.reject("Missing input.");
		}
		collection.deleteOne({"id": id});
		return Promise.resolve("Success.");
	};
});