var item = require('./items_db');

// Code by Haocen.xu@gmail.com

//var test_item = item.create("007", "Love in the Air", "999", "Spray... Don't think too much.", "Furnitures", "img/man/polo-shirt-1.png", "img/view-slider/medium/polo-shirt-1.png", "img/view-slider/large/polo-shirt-1.png");

item.check();

setTimeout(function(){console.log(item.check, item.getAll)}, 2000);
//item.getAll();

	var furnitures = [];
	furnitures.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "Table", "40", "hot", "A good old furniture, once used by snow white's step mother.", "Furnitures"));
  furnitures.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "Chair", "25", "soldout", "A good old furniture, once used by snow white's step mother.", "Furnitures"));
  furnitures.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "Bed", "299", "", "A good old furniture, once used by snow white's step mother.", "Furnitures"));
  furnitures.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "Clothes Stand", "69", "sale", "A good old furniture, once used by snow white's step mother.", "Furnitures"));
  furnitures.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "Mirror", "49", "", "A good old furniture, once used by snow white's step mother.", "Furnitures"));
  furnitures.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "Mattress", "199", "hot", "A good old furniture, once used by snow white's step mother.", "Furnitures"));
  furnitures.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "Hangers", "19", "", "A good old furniture, once used by snow white's step mother.", "Furnitures"));
  furnitures.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "Nightstand", "89", "", "A good old furniture, once used by snow white's step mother.", "Furnitures"));
  var electronics = [];
  electronics.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "iPhone 4", "19", "soldout", "A good old electronic, once used by snow white's step mother.", "Electronics"));
  electronics.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "iPhone 5", "99", "sale", "A good old electronic, once used by snow white's step mother.", "Electronics"));
  electronics.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "iPhone 5s", "149", "", "A good old electronic, once used by snow white's step mother.", "Electronics"));
  electronics.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "iPhone 6", "449", "hot", "A good old electronic, once used by snow white's step mother.", "Electronics"));
  electronics.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "iPhone 6s", "609", "hot", "A good old electronic, once used by snow white's step mother.", "Electronics"));
  electronics.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "iPhone SE", "499", "soldout", "A good old electronic, once used by snow white's step mother.", "Electronics"));
  electronics.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "iPad Pro", "999", "hot", "A good old electronic, once used by snow white's step mother.", "Electronics"));
  electronics.push(new createItem("/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png", "NEW Macbook", "1299", "hot", "A good old electronic, once used by snow white's step mother.", "Electronics")); 
	
  collection.insert(furnitures);
  collection.insert(electronics);
  
  setTimeout(function(){
	itemOps.create("007", "Love in the Air", "999", "Spray... Don't think too much.", "Furnitures", "/img/man/polo-shirt-1.png", "/img/view-slider/medium/polo-shirt-1.png", "/img/view-slider/large/polo-shirt-1.png").then(function(entry){
		console.log(entry.id);
		itemOps.find(entry.id).then(function(entry){
			console.log(entry);
		});
	});
	}, 5000);
	
	
setTimeout(function(){
	/*userOps.create("administrator", "averyverysecretkey", "hxu14@stevens.edu", "Haocen").then(function(){
		console.log("Created.");
	}).catch(function(err){
		console.log(err);
	});*/
	/*userOps.login("administrator", "averyverysecretkey", "192.168.44.1", "Chrome").then(function(user){
		console.log(user);
	}).catch(function(err){
		console.log(err);
	});*/
	/*userOps.logout("11c053bb-f3b9-4ae1-b825-9c593c88f540").then(function(info){
		console.log(info);
	}).catch(function(err){
		console.log(err);
	});*/
	/*userOps.getUserBySession("d04315b9-1010-4859-a349-98fb953e89e9", "192.168.44.1", "Chrome").then(function(info){
		console.log(info);
	}).catch(function(err){
		console.log(err);
	});*/
	/*userOps.getVerifyToken("d04315b9-1010-4859-a349-98fb953e89e9", "192.168.44.1", "Chrome").then(function(info){
		console.log(info);
	}).catch(function(err){
		console.log(err);
	});*/
	/*userOps.verify("d04315b9-1010-4859-a349-98fb953e89e9", "192.168.44.1", "Chrome", "$2a$10$WHVPmJrreEFU9iaGDy1Xw.VdhyzQn4FjaqUsUE3GPLrWCPObpV1zS").then(function(info){
		console.log(info);
	}).catch(function(err){
		console.log(err);
	});*/
	/*userOps.canPost("d04315b9-1010-4859-a349-98fb953e89e9", "192.168.44.1", "Chrome").then(function(info){
		console.log(info);
	}).catch(function(err){
		console.log(err);
	});*/
	
}, 1000);