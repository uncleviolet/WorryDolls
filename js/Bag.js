var BagStates = Object.freeze({open:0, closed:1, opening:2, closing:3});

var Bag = function(sprites, x, y, scale) {
	if(typeof this.mouseState != 'undefined') {
		
	}

	this.sprites = sprites;
	this.x = x;
	this.y = y;
	this.scale = scale;
	this.width = scale*this.sprites[0].width;
	this.height = scale*this.sprites[0].height
	this.state = BagStates.closed;
	this.sprite = this.getSprite();

	this.openingTimes = [200,200];
	this.closingTimes = [200,200];
	this.openingDuration = 400;
	this.closingDuration = 400;
	this.isPulsing = false;
	this.pulseDuration = 150;

	this.nDolls = 6;
};

Bag.prototype.update = function(progress) {
	// Check mouse state
	if (this.mouseState === MouseState.down) {
		this.timeSinceMouseDown += progress;
	}

	if (this.state === BagStates.opening) {
		this.timeSinceStartOpening += progress;
		if (this.timeSinceStartOpening > this.openingDuration) {
			this.state = BagStates.open;
		}
	} else if (this.state === BagStates.closing) {
		this.timeSinceStartClosing += progress;
		if (this.timeSinceStartClosing > this.closingDuration) {
			this.state = BagStates.closed;
			main.setScreenState(ScreenState.bagScreen);
		}
	}

	if (this.isPulsing) {
		this.timeSinceStartPulsing += progress;
		if (this.timeSinceStartPulsing > this.pulseDuration) {
			this.isPulsing = false;
			if (this.shouldClose) {
				this.close();
			}
		}
	}

	if (this.isTranslating) {
		this.timeSpentTranslating += progress;
		if (this.timeSpentTranslating > this.translateDuration + this.translateDelay) {
			this.isTranslating = false;
		}
	}
	this.sprite = this.getSprite(progress);
	this.getSize(progress);
	this.getPosition(progress);
};

Bag.prototype.draw = function() {
	this.ctx.drawImage(this.sprite, this.x - 0.5*this.width, this.y - 0.5*this.height, this.width, this.height);
};

Bag.prototype.getSize = function(progress) {
	var scaleFac = 1.0;
	if (this.isPulsing) {
		scaleFac = 1.0 + 0.05*this.timeSinceStartPulsing/this.pulseDuration;
	}
	this.width = scaleFac*this.sprite.width*this.scale;
	this.height = scaleFac*this.sprite.height*this.scale;	
};

Bag.prototype.getPosition = function(progress) {
	if (this.isTranslating) {
		if (this.timeSpentTranslating < this.translateDelay) {
			return;
		}
		this.x = this.translateEasingFunction(this.timeSpentTranslating - this.translateDelay, this.translateStartX, 
			this.translateEndX - this.translateStartX, this.translateDuration);
		this.y = this.translateEasingFunction(this.timeSpentTranslating - this.translateDelay, this.translateStartY, 
			this.translateEndY - this.translateStartY, this.translateDuration);
	}
};

Bag.prototype.getSprite = function(progress) {
	switch (this.state) {
		case BagStates.open:
			return this.sprites[2];

		case BagStates.closed:
			return this.sprites[0];

		case BagStates.opening:
			return this.openingSprite(progress);

		case BagStates.closing:
			return this.closingSprite(progress);
	}
};

Bag.prototype.openingSprite = function(progress) {
	if (this.timeSinceStartOpening > this.openingTimes[0]) {
		return this.sprites[1];
	} else {
		return this.sprites[0];
	}
};

Bag.prototype.closingSprite = function(progress) {
	if (this.timeSinceStartClosing > this.closingTimes[0]) {
		return this.sprites[1];
	} else {
		return this.sprites[2];
	}
};

Bag.prototype.open = function() {
	this.state = BagStates.opening;
	this.timeSinceStartOpening = 0;
};

Bag.prototype.close = function() {
	this.state = BagStates.closing;
	this.timeSinceStartClosing = 0;
	this.shouldClose = false;
};

Bag.prototype.pulse = function() {
	this.isPulsing = true;
	this.timeSinceStartPulsing = 0;
};

Bag.prototype.addDoll = function() {
	this.pulse();
	this.nDolls++;
	if (this.nDolls >= main.nDolls) {
		this.shouldClose = true;
	}
};

Bag.prototype.translate = function(endX, endY, duration, delay, ease) {
	this.isTranslating = true;
	this.translateEndX = endX;
	this.translateEndY = endY;
	this.translateStartX = this.x;
	this.translateStartY = this.y;
	this.translateDuration = duration;
	this.translateDelay = delay;
	this.translateEasingFunction = ease;
	this.timeSpentTranslating = 0;
};

Bag.prototype.isUnderCoords = function(x, y) {
	if (x < this.x + 0.5*this.width && x > this.x - 0.5*this.width &&
		y < this.y + 0.5*this.height && y > this.y - 0.5*this.height) {
		return true;
	}
	return false;
};

Bag.prototype.mouseDown = function(x, y) {
	this.timeSinceMouseDown = 0;
	this.mouseState = MouseState.down;
	main.mouseDownItem = this;
};

Bag.prototype.mouseUp = function(x, y) {
	if (this.isUnderCoords(x, y) && this.mouseState === MouseState.down) {
		this.mouseState = MouseState.up;
		if (this.timeSinceMouseDown > 200) {
			return;
		}
		this.click();
	}
};

Bag.prototype.click = function() {
	if (this.main.screenState == ScreenState.bagScreen) {
		this.main.transitionToScreen(ScreenState.dollsLineUp);
	}



//	if (this.state === BagStates.closed) {
//		this.open();
//	} else if (this.state === BagStates.open) {
//		this.close();
//	}	
};