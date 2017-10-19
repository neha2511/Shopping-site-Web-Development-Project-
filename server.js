var express = require('express');
var xss = require('xss');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mailer = require('./mailer');
//var makeItem = require('./item').item;
var itemOps = require('./items_db');
//var makeUser = require('.user').user;
var userOps = require('./users_db');

// must check all imported function available before call
// must xss all input

var app = express();

// Code by Haocen.xu@gmail.com

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/static'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// middleware
app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
	extended: true
})); // for parsing application/x-www-form-urlencoded
app.use(function(req, res, next) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (req.originalUrl.search("/css") === -1 || req.originalUrl.search("/img") === -1 || req.originalUrl.search("/fonts") === -1 || req.originalUrl.search("/js") === -1) {
		console.log(req.method.toUpperCase() + " from " + ip + " to " + req.originalUrl + " at " + (new Date()).toISOString());
		console.log("Header: " + req.headers["user-agent"] + '\n');
	}
	next();
}); // logger

app.use(function(request, response, next) {
	if (!request.cookies.session_id) {
		next();
	} else {
		userOps.getUserBySession(request.cookies.session_id, "remote_host", request.headers["user-agent"])
			.then(function(user) {
				request.user = user;
			}).then(function(){
				next();
			}).catch(function(err) {
				userOps.logout(request.cookies.session_id);
				response.clearCookie("session_id");
				next();
			});
	}
});

app.get(['/', '/index'], function(request, response) {
	itemOps.findByCategory("Furnitures").then(function(furnitures) {
		itemOps.findByCategory("Electronics").then(function(electronics) {
			itemOps.findByMostViewed().then(function(populars) {
				itemOps.findByLatestCreated().then(function(latests) {
					response.render('pages/index', {
						"furnitures": furnitures,
						"electronics": electronics,
						"populars": populars,
						"latests": latests
					});
				});
			});
		});
	});
});

app.get('/product-detail/:id', function(request, response) {
	itemOps.find(request.params.id).then(function(item) {
		itemOps.findByCategory(item.category).then(function(related) {
			response.render('pages/product-detail', {
				"item": item,
				"related": related
			});
		});
	});
});

app.get('/account', function(request, response) {
	if(!request.user){
		response.render('pages/account');
	} else {
		response.redirect('/home');
	}
});

app.get('/home', function(request, response) {
	if(request.user){
		itemOps.findByCreatorId(request.user.id).then(function(items){
			response.render('pages/home', {
				"user": request.user,
				"userItems": items
			});
		});
	} else {
		response.redirect('/account');
	}
});

app.get('/post', function(request, response) {
	if(request.user){
		userOps.canPost(request.cookies.session_id, "remote_host", request.headers["user-agent"]).then(function(){
			response.render('pages/post');
		}).catch(function(err){
			response.render('pages/post', { "warning": err });
		});
	} else {
		response.redirect('/account');
	}
});

app.get('/search', function(request, response) {
	// GET /search?q=tobi+ferret
	var keywords = (xss(request.query.q)).split(' ', 3);
	if(keywords[0]){
		itemOps.search(keywords[0]).then(function(items){
			console.log(items);
			if(keywords[1]){
				itemOps.search(keywords[1]).then(function(items_1){
					if(keywords[2]){
						itemOps.search(keywords[2]).then(function(items_2){
							response.render('pages/search', {
								"searchItems": items.concat(items_1, items_2)
							});
						});
					} else {
						response.render('pages/search', {
							"searchItems": items.concat(items_1)
						});
					}
				});
			} else {
				response.render('pages/search', {
					"searchItems": items
				});
			}
		});
	} else {
		response.render('pages/search', {
			"searchItems": []
		});
	}
});

app.get('/contact', function(request, response) {
	response.render('pages/contact');
});

app.get('/verify/:token', function(request, response) {
	userOps.verify(request.cookies.session_id, "remote_host", request.headers["user-agent"], decodeURIComponent(request.params.token)).then(function(info){
		response.redirect('/home');
	}).catch(function(err){
		response.render('pages/account', {
			"warning": err
		});
	});
});

app.post('/api/user', function(request, response) {
	userOps.create(xss(request.body.username), xss(request.body.password), xss(request.body.email), xss(request.body.name)).then(function(user) {
		response.json({ status: "success", message: "Account created." });
	}).catch(function(err){
		response.status(500).json({ status: "error", message: err });
	});
});

app.post('/api/login', function(request, response) {
	userOps.login(xss(request.body.username), xss(request.body.password), "remote_host", request.headers["user-agent"]).then(function(session) {
		var expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 10);
		response.cookie("session_id", session.id, {
			expires: expiresAt
		});
		response.json({ status: "success", message: "Welcome back!" });
	}).catch(function(err){
		response.status(500).json({ status: "error", message: err });
	});
});

app.get('/logout', function(request, response) {
	userOps.logout(request.cookies.session_id);
	response.clearCookie("session_id");
	response.redirect('/');
});

app.get('/api/verify', function(request, response) {
	mailer.sendVerifyMail(request.user).then(function(info){
		response.json({ status: "success", message: info });
	}).catch(function(err){
		response.status(500).json({ status: "error", message: err });
	});
});

app.post('/api/item', function(request, response) {
	userOps.canPost(request.cookies.session_id, "remote_host", request.headers["user-agent"]).then(function(){
		itemOps.create(request.user.id, xss(request.body.title), xss(request.body.price), xss(request.body.description), xss(request.body.category), xss(request.body.imgUrl), xss(request.body.viewSliderImgMediumUrl), xss(request.body.viewSliderImgLargeUrl)).then(function(item){
			userOps.insertItem(request.cookies.session_id, "remote_host", request.headers["user-agent"], item.id).then(function(){
				userOps.getUsersByCategory(item.category).then(function(users){
					mailer.sendNewItemMail(users, item).then(function(){
						response.json({ status: "success", message: "Item posted." });
					});
				});
			}).catch(function(err){
				console.log(err);
				response.json({ status: "success", message: "Item posted." });
			});
		}).catch(function(err){
			response.status(500).json({ status: "error", message: err });
		});
	}).catch(function(err){
		response.status(500).json({ status: "error", message: err });
	});
});

app.post('/api/categories', function(request, response) {
	var categories = [];
	request.body.categories.forEach(function(category){
		categories.push(xss(category));
	});
	userOps.changeCategories(request.cookies.session_id, "remote_host", request.headers["user-agent"], categories).then(function(){
		response.json({ status: "success", message: "Watchlist categories changed." });
	}).catch(function(err){
		response.status(500).json({ status: "error", message: err });
	});
});

app.delete('/api/item', function(request, response) {
	userOps.deleteItem(request.cookies.session_id, "remote_host", request.headers["user-agent"], request.body.item_id).then(function(){
		itemOps.delete(request.body.item_id).then(function(){
			response.json({ status: "success", message: "Item deleted." });
		});
	}).catch(function(err){
		response.status(500).json({ status: "error", message: err });
	});
});

app.get('*', function(request, response) {
	response.render('pages/404');
});

if (process.env.OPENSHIFT_NODEJS_IP && process.env.OPENSHIFT_NODEJS_PORT) {
	app.listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP, function() {
		console.log('Node app is running on port', process.env.OPENSHIFT_NODEJS_PORT);
	});
} else {
	app.listen(app.get('port'), function() {
		console.log('Node app is running on port', app.get('port'));
	});
}