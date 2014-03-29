var Doll = function(sprite, x, y, scale) {
	this.sprite = sprite;
	this.x = x;
	this.y = y;
	this.scale = scale;
	this.width = this.scale*this.sprite.width;
	this.height = this.scale*this.sprite.height;
	this.speedX = 0.05;
	this.speedY = 0.05;
};

Doll.prototype.update = function(progress) {
	if (this.x <= 0.5*this.width || this.x >= this.mainCanvas.width - 0.5*this.width) {
		this.speedX *= -1;
	}
	if (this.y <= 0.5*this.height || this.y >= this.mainCanvas.height - 0.5*this.height) {
		this.speedY *= -1;
	}	
	this.x += progress*this.speedX;
	this.y += progress*this.speedY;

};

Doll.prototype.draw = function() {
	this.ctx.drawImage(this.sprite, this.x-0.5*this.width, this.y-0.5*this.height, this.width, this.height);
};