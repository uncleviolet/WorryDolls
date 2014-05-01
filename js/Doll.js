var Doll = function(sprite, x, y, scale, lineUpX, lineUpY) {
	this.sprite = sprite;
	this.x = x;
	this.y = y;
	this.scale = scale;
	this.lineUpX = lineUpX;
	this.lineUpY = lineUpY;

	this.width = this.scale*this.sprite.width;
	this.height = this.scale*this.sprite.height;
	this.dragExpandTime = 60;
	this.jumpIntoBagDuration = 800;
	this.jumpingOutOfBagDuration = 800;
	this.jumpingIntoBag = false;
	this.jumpingOutOfBag = false;
	this.hasBeenMovedBack = false;
	this.isVisible = false;
};

Doll.prototype.update = function(progress) {
	if (this.isVisible) {
		this.getPosition(progress);
		this.getSize(progress);
	}
};

Doll.prototype.draw = function() {
	if (this.isVisible) {
		this.ctx.drawImage(this.sprite, this.x - 0.5*this.width, this.y - 0.5*this.height, this.width, this.height);
	}
};

Doll.prototype.isUnderCoords = function(x, y) {
	if (x < this.x + 0.5*this.width && x > this.x - 0.5*this.width &&
		y < this.y + 0.5*this.height && y > this.y - 0.5*this.height) {
		return true;
	}
	return false;
};

Doll.prototype.mouseDown = function(x, y) {
	if (this.jumpingIntoBag) {
		return;
	}
	this.mouseState = MouseState.down;
	this.dragOffsetX = x - this.x;
	this.dragOffsetY = y - this.y;
	this.isExpanding = true;
	this.timeSpentExpanding = 0
}

Doll.prototype.mouseUp = function() {
	this.mouseState = MouseState.up;
	if (main.bag.isUnderCoords(this.x, this.y)) {
		this.jumpIntoBag();
	} else {
		this.width = this.scale*this.sprite.width;
		this.height = this.scale*this.sprite.height;		
	}	
};

Doll.prototype.getPosition = function(progress) {
	if (this.mouseState === MouseState.down) {
		this.x = main.mouseX - this.dragOffsetX;
		this.y = main.mouseY - this.dragOffsetY;
	} else if (this.jumpingIntoBag) {
		this.timeSpentJumpingIntoBag += progress;
		if (this.timeSpentJumpingIntoBag > this.jumpIntoBagDuration) {
			this.isVisible = false;
			this.main.bag.addDoll();
			return;
		}
		var bagX = main.bag.x;
		var bagY = main.bag.y;
		var jumpApexX = (this.jumpBagStartX + bagX)/2;
		var jumpApexY = bagY - main.bag.height/2 - this.height/2 - 10;
		this.x = bagX - (bagX - this.jumpBagStartX)*(this.jumpIntoBagDuration 
			- this.timeSpentJumpingIntoBag)/this.jumpIntoBagDuration

		var timeFac = (this.jumpIntoBagDuration/2 - this.timeSpentJumpingIntoBag)/(this.jumpIntoBagDuration/2);
		if (this.timeSpentJumpingIntoBag < this.jumpIntoBagDuration/2) {
			this.y = jumpApexY - (jumpApexY - this.jumpBagStartY)*Math.pow(timeFac, 2);
		} else {
			if (!this.hasBeenMovedBack) {
				main.moveBackOne(this);
				this.hasBeenMovedBack = true;
			}
			this.y = jumpApexY - (jumpApexY - bagY)*Math.pow(timeFac, 2);
		}
	} else if (this.jumpingOutOfBag) {
		this.timeSpentJumpingOutOfBag += progress;
		if (this.timeSpentJumpingOutOfBag > this.jumpingOutOfBagDuration + this.jumpingOutOfBagDelay) {
			this.jumpingOutOfBag = false;
			this.callback();
			return;
		}
		if (this.timeSpentJumpingOutOfBag < this.jumpingOutOfBagDelay) {
			return;
		}
		var timeFac = (this.jumpingOutOfBagDuration - this.timeSpentJumpingOutOfBag 
			+ this.jumpingOutOfBagDelay)/(this.jumpingOutOfBagDuration);	

		this.x = main.bag.x + (this.lineUpX - main.bag.x)*(this.timeSpentJumpingOutOfBag - this.jumpingOutOfBagDelay
			)/this.jumpingOutOfBagDuration;
		this.y = this.lineUpY - (this.lineUpY - main.bag.y)*Math.pow(timeFac,2);

	}
};

Doll.prototype.getSize = function(progress) {
	var scaleFactor = 1.0;
	if (this.mouseState === MouseState.down) {
		this.timeSpentExpanding += progress;
		scaleFactor = 1.2;
		if (this.timeSpentExpanding < this.dragExpandTime) {
			scaleFactor = 1.0 + 0.2*(this.timeSpentExpanding/this.dragExpandTime);
		}

	} else if (this.jumpingIntoBag) {
		scaleFactor = 1.2 -  0.3*(this.timeSpentJumpingIntoBag/this.jumpIntoBagDuration);
	} 

	this.width = scaleFactor*this.scale*this.sprite.width;
	this.height = scaleFactor*this.scale*this.sprite.height;
};

Doll.prototype.jumpOutOfBag = function(delay, callback) {
	this.jumpingOutOfBag = true;
	this.jumpingOutOfBagDelay = delay;
	this.callback = callback;
	this.timeSpentJumpingOutOfBag = 0;
};

Doll.prototype.jumpIntoBag = function() {
	this.timeSpentJumpingIntoBag = 0;
	this.jumpingIntoBag = true;
	this.jumpBagStartX = this.x;
	this.jumpBagStartY = this.y;
	this.hasBeenMovedBack = false;
}