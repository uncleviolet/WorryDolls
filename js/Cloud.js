var Cloud = function(sprite, x, y, scale, text) {
	this.sprite = sprite;
	this.x = x;
	this.y = y;
	this.scale = scale;

	this.width = 0.0;
	this.height = 0.0;
};

Cloud.prototype.update = function(progress) {
	this.timeSpentOpening += progress;
	if (this.timeSpentOpening > this.openingDuration + this.openingDelay) {
		this.isOpening = false;
	}
	this.updateSize();
};

Cloud.prototype.draw = function() {
	if (this.isVisible) {
		this.ctx.drawImage(this.sprite, this.x - 0.5*this.width, this.y - 0.5*this.height, this.width, this.height);
	}
};

Cloud.prototype.updateSize = function(progress) {
	var scaleFac = this.scale;
	if (this.isOpening) {
		if (this.timeSpentOpening < this.openingDelay) {
			scaleFac = 0.0;
		} else {
			scaleFac = Ease.inOut(this.timeSpentOpening - this.openingDelay, 0.0, this.scale, this.openingDuration);
		}
		
	}
	this.width = scaleFac*this.sprite.width;
	this.height = scaleFac*this.sprite.height;
};

Cloud.prototype.open = function(openingDuration, openingDelay) {
	this.isVisible = true;
	this.openingDuration = openingDuration;
	this.openingDelay = openingDelay;
	this.isOpening = true;
	this.timeSpentOpening = 0;
};

Cloud.prototype.isUnderCoords = function(x, y) {
	if (x < this.x + 0.5*this.width && x > this.x - 0.5*this.width &&
		y < this.y + 0.5*this.height && y > this.y - 0.5*this.height) {
		return true;
	}
	return false;
};


