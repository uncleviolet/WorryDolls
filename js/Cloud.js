var CloudState = Object.freeze({opening: 0, pulsing: 1, expanding: 2, expanded: 3, unexpanding: 4, closing: 5});

var Cloud = function(sprite, x, y, scale, textList, isClickable, isExpandable) {
	this.sprite = sprite;
	this.x = x;
	this.y = y;
	this.scale = scale;
	this.textList = textList;
	this.isClickable = isClickable;
	this.isExpandable = isExpandable;

	this.state = -1;

	this.pulsePeriod = 1000;
	this.expandedScaleFac = 1.3;
	this.expandDuration = 400;
	this.expandedAlpha = 0.3;
	this.alpha = 1.0;

	this.width = 0.0;
	this.height = 0.0;
};

Cloud.prototype.update = function(progress) {
	switch (this.state) {
		case CloudState.opening:
			this.timeSpentOpening += progress;
			if (this.timeSpentOpening > this.openingDuration + this.openingDelay) {
				this.state = -1;
				this.showText();
				if (this.shouldPulse) {
					this.startPulsing(500);
				}
			}
			break;

		case CloudState.pulsing:
			this.timeSpentPulsing += progress;
			break;

		case CloudState.expanding:
			this.timeSpentExpanding += progress;
			if (this.timeSpentExpanding > this.expandDuration) {
				this.state = CloudState.expanded;
				main.initWorries();
			}
			break;

		case CloudState.unexpanding:
			this.timeSpentUnexpanding += progress;
			if (this.timeSpentUnexpanding > this.expandDuration) {
				this.state = CloudState.pulsing;
				this.timeSpentPulsing = 0;
				this.pulseDelay = 0;
				this.showText();
			}
			break;

		case CloudState.closing:
			this.timeSpentClosing += progress;
			if (this.timeSpentClosing > this.closingDuration + this.closingDelay) {
				this.isVisible = false;
				main.removeFromDisplay(this);
			}
			break;
	}

	this.updateSize();
};

Cloud.prototype.draw = function() {
	if (this.isVisible) {
		this.ctx.save();
		this.updateAlpha();
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.sprite, this.x - 0.5*this.width, this.y - 0.5*this.height, this.width, this.height);
		this.ctx.restore();
		if (this.isShowingText && this.textList != null) {
			this.ctx.fillStyle = "black";
			this.ctx.font = "20px AnnieUseYourTelescope";
			for (var i = 0; i < this.textList.length; i++) {
				var text = this.textList[i];
				var x = this.x - 0.5*this.ctx.measureText(text).width;
				var y = this.y + 30*(i - this.textList.length/2 + 0.7);
				this.ctx.fillText(text, x, y);
			}
			this.ctx.fillStyle = main.backgroundColour;
		}
	}
};

Cloud.prototype.updateSize = function(progress) {
	var scaleFac = this.scale;

	switch (this.state) {
		case CloudState.opening:
			if (this.timeSpentOpening < this.openingDelay) {
				scaleFac = 0.0;
			} else {
				scaleFac = Ease.inOut(this.timeSpentOpening - this.openingDelay, 0.0, this.scale, this.openingDuration);
			}
			break;		

		case CloudState.pulsing:
			if (this.timeSpentPulsing >= this.pulseDelay) {
				scaleFac = this.scale + 0.03*this.scale*Math.sin(
					2*Math.PI * (this.timeSpentPulsing - this.pulseDelay)/this.pulsePeriod);
			}
			break;

		case CloudState.expanding:
			scaleFac = Ease.inOut(this.timeSpentExpanding, this.scale, 
				this.expandedScaleFac*this.scale - this.scale, this.expandDuration);
			break;

		case CloudState.expanded:
			scaleFac = this.expandedScaleFac*this.scale;
			break;

		case CloudState.unexpanding:
			scaleFac = Ease.inOut(this.timeSpentUnexpanding, this.mouseUpScale, 
				this.scale - this.mouseUpScale, this.expandDuration);
			break;

		case CloudState.closing:
			if (this.timeSpentClosing < this.closingDelay) {
				scaleFac = this.scale;
			} else {
				scaleFac = Ease.inOut(this.timeSpentClosing - this.closingDelay, 
					this.scale, 0.0 - this.scale, this.closingDuration);
			}
			break;	
	}
	this.width = scaleFac*this.sprite.width;
	this.height = scaleFac*this.sprite.height;
};

Cloud.prototype.updateAlpha = function() {
	if (this.state === CloudState.expanding) {
		this.alpha = Ease.inOut(this.timeSpentExpanding, 1.0, this.expandedAlpha - 1.0, 
			this.expandDuration);
	} else if (this.state === CloudState.expanded) {
		this.alpha = this.expandedAlpha;
	} else if (this.state === CloudState.unexpanding) {
		this.alpha = Ease.inOut(this.timeSpentUnexpanding, this.mouseUpAlpha, 1.0 - this.mouseUpAlpha, 
			this.expandDuration);
	} else {
		this.alpha = 1;
	}
}

Cloud.prototype.open = function(openingDuration, openingDelay, shouldPulse) {
	this.isVisible = true;
	this.openingDuration = openingDuration;
	this.openingDelay = openingDelay;
	this.state = CloudState.opening;
	this.timeSpentOpening = 0;
	this.shouldPulse = shouldPulse;
};

Cloud.prototype.close = function(duration, delay) {
	this.state = CloudState.closing;
	this.timeSpentClosing = 0;
	this.closingDuration = duration;
	this.closingDelay = delay;
	this.hideText();
}

Cloud.prototype.showText = function() {
	this.isShowingText = true;
};

Cloud.prototype.hideText = function() {
	this.isShowingText = false;
};

Cloud.prototype.startPulsing = function(delay) {
	this.state = CloudState.pulsing;
	this.timeSpentPulsing = 0;
	this.pulseDelay = delay;
};

Cloud.prototype.isUnderCoords = function(x, y) {
	if (x < this.x + 0.5*this.width && x > this.x - 0.5*this.width &&
		y < this.y + 0.5*this.height && y > this.y - 0.5*this.height) {
		return true;
	}
	return false;
};

Cloud.prototype.mouseDown = function(x, y) {
	if (this.isExpandable) {
		this.timeSinceMouseDown = 0;
		this.mouseState = MouseState.down;
		this.state = CloudState.expanding;
		this.hideText();
		this.timeSpentExpanding = 0		
	}
}

Cloud.prototype.mouseUp = function(x, y) {
	if (this.isUnderCoords(x, y) && this.mouseState === MouseState.down) {
		this.mouseState = MouseState.up;
		this.state = CloudState.unexpanding;
		this.timeSpentUnexpanding = 0;
		this.mouseUpScale = this.width/this.sprite.width;
		this.mouseUpAlpha = this.alpha;
		if (this.timeSinceMouseDown < 200 && this.isClickable) {
			this.click();
			return;
		}
	}
};

Cloud.prototype.click = function() {

};

