var uuid = require('node-uuid');

// Code by Haocen.xu@gmail.com

function item(imgUrl, viewSliderImgMediumUrl, viewSliderImgLargeUrl, title, price, badge, description, category, creator_id) {
	this.id = uuid.v4().toString();
	this.title = title;
	this.price = price;
	this.badge = badge;
	this.imgUrl = imgUrl;
	this.viewSliderImgMediumUrl = viewSliderImgMediumUrl;
	this.viewSliderImgLargeUrl = viewSliderImgLargeUrl;
	this.description = description;
	this.category = category;
	this.creator_id = creator_id;
	this.date = new Date();
	this.views = 0;
}

module.exports = {
	item
}