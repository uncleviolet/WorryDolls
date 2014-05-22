var Worry = function(sprite, x, y, scale, endX, endY, duration) {
	this.sprite = sprite;
	this.scale = scale;
	this.startX = x;
	this.startY = y;
	this.x = x;
	this.y = y;
	this.width = this.scale*this.sprite.width;
	this.height = this.scale*this.sprite.height;
	this.scale = scale;
	this.endX = endX;
	this.endY = endY;
	this.duration = duration;
	this.timeSpentMoving = 0;
	this.isVisible = true;
};

Worry.prototype.update = function(progress) {
	this.timeSpentMoving += progress;
	if (this.timeSpentMoving > this.duration) {
		this.isVisible = false;
	}
	this.updatePosition();
};

Worry.prototype.draw = function() {
	if (this.isVisible) {
		this.ctx.drawImage(this.sprite, this.x - 0.5*this.width, this.y - 0.5*this.height, this.width, this.height);
	}
};

Worry.prototype.updatePosition = function(progress) {
	this.x = Ease.in(this.timeSpentMoving, this.startX, this.endX - this.startX, this.duration);
	this.y = Ease.in(this.timeSpentMoving, this.startY, this.endY - this.startY, this.duration);
};