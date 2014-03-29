var Doll = function(sprite, x, y, scale) {
	this.sprite = sprite;
	this.x = x;
	this.y = y;
	this.scale = scale;
	this.width = this.scale*this.sprite.width;
	this.height = this.scale*this.sprite.height;
	this.dragExpandTime = 80;
};

Doll.prototype.update = function(progress) {
	if (this.isBeingDragged) {
		this.getDragPosition();
		this.getDragSize(progress);
	}
};

Doll.prototype.draw = function() {
	this.ctx.drawImage(this.sprite, this.x - 0.5*this.width, this.y - 0.5*this.height, this.width, this.height);
};

Doll.prototype.isUnderTouchCoords = function(x, y) {
	if (x < this.x + 0.5*this.width && x > this.x - 0.5*this.width &&
		y < this.y + 0.5*this.height && y > this.y - 0.5*this.height) {
		return true;
	}
	return false;
};

Doll.prototype.initDrag = function(x, y) {
	this.isBeingDragged = true;
	main.dragItem = this;
	this.dragOffsetX = x - this.x;
	this.dragOffsetY = y - this.y;
	this.isExpanding = true;
	this.timeSpentExpanding = 0
}

Doll.prototype.endDrag = function() {
	this.isBeingDragged = false;
	this.width = this.scale*this.sprite.width;
	this.height = this.scale*this.sprite.height;
};

Doll.prototype.getDragPosition = function() {
	if (main.mouseIsDown) {
		this.x = main.mouseX - this.dragOffsetX;
		this.y = main.mouseY - this.dragOffsetY;
	}
};

Doll.prototype.getDragSize = function(progress) {
	if (main.mouseIsDown) {
		this.timeSpentExpanding += progress;
		var scaleFactor = 1.2;
		if (this.timeSpentExpanding < this.dragExpandTime) {
			scaleFactor = 1.0 + 0.2*(this.timeSpentExpanding/this.dragExpandTime);
		}
		this.width = scaleFactor*this.scale*this.sprite.width;
		this.height = scaleFactor*this.scale*this.sprite.height;
	} else {

	}
};