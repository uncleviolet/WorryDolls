var Doll = function(sprite, x, y, scale, lineUpX, lineUpY) {
	this.sprite = sprite;
	this.x = x;
	this.y = y;
	this.scale = scale;
	this.lineUpX = lineUpX;
	this.lineUpY = lineUpY;

	this.zoomedInScaleFactor = 4.0;

	this.width = this.scale*this.sprite.width;
	this.height = this.scale*this.sprite.height;
	this.dragExpandTime = 60;
	this.jumpIntoBagDuration = 800;
	this.jumpingOutOfBagDuration = 800;
	this.isJumpingIntoBag = false;
	this.isJumpingOutOfBag = false;
	this.isZoomingInToCloseUp = false;
	this.zoomInToCloseUpDuration = 1000;
	this.zoomOutToLineUpDuration = 1000;
	this.hasBeenMovedBack = false;
	this.isVisible = false;
};

Doll.prototype.update = function(progress) {
	if (!this.isVisible) {
		return;
	}
	if (this.mouseState === MouseState.down) {
		this.timeSinceMouseDown += progress;
	}
	if (this.isJumpingIntoBag) {
		this.timeSpentJumpingIntoBag += progress;
		if (this.timeSpentJumpingIntoBag > this.jumpIntoBagDuration) {
			this.isVisible = false;
			this.isJumpingIntoBag = false;
			this.main.bag.addDoll();
		}
	} else if (this.isJumpingOutOfBag) {
		this.timeSpentJumpingOutOfBag += progress;
		if (this.timeSpentJumpingOutOfBag > this.jumpingOutOfBagDuration + this.jumpingOutOfBagDelay) {
			this.isJumpingOutOfBag = false;
			this.callback();
		}
	} else if (this.isTranslating) {
		this.timeSpentTranslating += progress;
		if (this.timeSpentTranslating > this.translateDuration + this.translateDelay) {
			this.isTranslating = false;
		}
	} else if (this.isZoomingInToCloseUp) {
		this.timeSpentZooming += progress;
		if (this.timeSpentZooming > this.zoomInToCloseUpDuration) {
			this.isZoomingInToCloseUp = false;
			main.setScreenState(ScreenState.dollCloseUp);
		}
	} else if (this.isZoomingOutToLineUp) {
		this.timeSpentZooming += progress;
		if (this.timeSpentZooming > this.zoomOutToLineUpDuration) {
			this.isZoomingOutToLineUp = false;
			main.setScreenState(ScreenState.dollsLineUp);
		}
	}		

	this.getPosition(progress);
	this.getSize(progress);
};

Doll.prototype.draw = function() {
	if (this.isVisible) {
		this.ctx.drawImage(this.sprite, this.x - 0.5*this.width, this.y - 0.5*this.height, this.width, this.height);
	}
};

Doll.prototype.getPosition = function(progress) {
	if (this.mouseState === MouseState.down && main.screenState === ScreenState.dollsLineUp) {
		this.x = main.mouseX - this.dragOffsetX;
		this.y = main.mouseY - this.dragOffsetY;
		if (this.x < this.width/2) {
			this.x = this.width/2;
		}
		if (this.x > main.windowWidth - this.width/2) {
			this.x = main.windowWidth - this.width/2;
		}
		if (this.y < this.height/2) {
			this.y = this.height/2;
		}
		if (this.y > main.windowHeight - this.height/2) {
			this.y = main.windowHeight - this.height/2
		}
	} else if (this.isJumpingIntoBag) {
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
	} else if (this.isJumpingOutOfBag) {
		if (this.timeSpentJumpingOutOfBag < this.jumpingOutOfBagDelay) {
			return;
		}
		var timeFac = (this.jumpingOutOfBagDuration - this.timeSpentJumpingOutOfBag 
			+ this.jumpingOutOfBagDelay)/(this.jumpingOutOfBagDuration);	

		this.x = main.bag.x + (this.lineUpX - main.bag.x)*(this.timeSpentJumpingOutOfBag - this.jumpingOutOfBagDelay
			)/this.jumpingOutOfBagDuration;
		this.y = this.lineUpY - (this.lineUpY - main.bag.y)*Math.pow(timeFac,2);
	} else if (this.isTranslating) {
		if (this.timeSpentTranslating < this.translateDelay) {
			return;
		}
		this.x = this.translateEasingFunction(this.timeSpentTranslating - this.translateDelay, this.translateStartX, 
			this.translateEndX - this.translateStartX, this.translateDuration);
		this.y = this.translateEasingFunction(this.timeSpentTranslating - this.translateDelay, this.translateStartY, 
			this.translateEndY - this.translateStartY, this.translateDuration);
	} else if (this.isZoomingInToCloseUp) {
		this.x = easeInOutCubicValue(this.timeSpentZooming, this.clickStartX, 
			main.dollCloseUpX - this.clickStartX, this.zoomInToCloseUpDuration);
		this.y = easeInOutCubicValue(this.timeSpentZooming, this.clickStartY, 
			main.dollCloseUpY - this.clickStartY, this.zoomInToCloseUpDuration);
	} else if (this.isZoomingOutToLineUp) {
		this.x = easeInOutCubicValue(this.timeSpentZooming, main.dollCloseUpX, 
			 this.lineUpX - main.dollCloseUpX, this.zoomOutToLineUpDuration);
		this.y = easeInOutCubicValue(this.timeSpentZooming, main.dollCloseUpY, 
			 this.lineUpY - main.dollCloseUpY, this.zoomOutToLineUpDuration);
	}
};

Doll.prototype.getSize = function(progress) {
	var scaleFactor = 1.0;
	var mainScaleFactor = scaleFactor;
	if (main.screenState === ScreenState.dollCloseUp && this === main.selectedDoll) {
		scaleFactor = this.zoomedInScaleFactor;
	}
	if (this.mouseState === MouseState.down  && main.screenState === ScreenState.dollsLineUp) {
		this.timeSpentExpanding += progress;
		scaleFactor = 1.2;
		if (this.timeSpentExpanding < this.dragExpandTime) {
			scaleFactor = 1.0 + 0.2*(this.timeSpentExpanding/this.dragExpandTime);
		}

	} else if (this.isJumpingIntoBag) {
		scaleFactor = 1.2 -  0.3*(this.timeSpentJumpingIntoBag/this.jumpIntoBagDuration);
	} else if (this.isZoomingInToCloseUp) {
		scaleFactor = easeInOutCubicValue(this.timeSpentZooming, mainScaleFactor, 
			this.zoomedInScaleFactor - mainScaleFactor, this.zoomInToCloseUpDuration);
	} else if (this.isZoomingOutToLineUp) {
		scaleFactor = easeInOutCubicValue(this.timeSpentZooming, this.zoomedInScaleFactor, 
			 mainScaleFactor - this.zoomedInScaleFactor, this.zoomOutToLineUpDuration);
	}

	this.width = scaleFactor*this.scale*this.sprite.width;
	this.height = scaleFactor*this.scale*this.sprite.height;
};

Doll.prototype.jumpOutOfBag = function(delay, callback) {
	this.isJumpingOutOfBag = true;
	this.jumpingOutOfBagDelay = delay;
	this.callback = callback;
	this.timeSpentJumpingOutOfBag = 0;
};

Doll.prototype.jumpIntoBag = function() {
	this.timeSpentJumpingIntoBag = 0;
	this.isJumpingIntoBag = true;
	this.jumpBagStartX = this.x;
	this.jumpBagStartY = this.y;
	this.hasBeenMovedBack = false;
}

Doll.prototype.zoomInToCloseUp = function() {
	this.isZoomingInToCloseUp = true;
	this.timeSpentZooming = 0;
};

Doll.prototype.zoomOutToLineUp = function() {
	this.isZoomingOutToLineUp = true;
	this.timeSpentZooming = 0;
};

Doll.prototype.translate = function(endX, endY, duration, delay, ease) {
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

Doll.prototype.isUnderCoords = function(x, y) {
	if (x < this.x + 0.5*this.width && x > this.x - 0.5*this.width &&
		y < this.y + 0.5*this.height && y > this.y - 0.5*this.height) {
		return true;
	}
	return false;
};

Doll.prototype.mouseDown = function(x, y) {
	if (this.isJumpingIntoBag) {
		return;
	}
	if (main.screenState === ScreenState.dollsLineUp) {
		this.timeSinceMouseDown = 0;
		this.mouseState = MouseState.down;
		this.dragOffsetX = x - this.x;
		this.dragOffsetY = y - this.y;
		this.isExpanding = true;
		this.timeSpentExpanding = 0		
	} else if (main.screenState == ScreenState.dollCloseUp) {
		this.timeSinceMouseDown = 0;
		this.mouseState = MouseState.down;		
	}

}

Doll.prototype.mouseUp = function(x, y) {
	if (this.isUnderCoords(x, y) && this.mouseState === MouseState.down) {
		this.mouseState = MouseState.up;
		if (this.timeSinceMouseDown < 200) {
			this.click();
			return;
		}
		if (main.bag.isUnderCoords(this.x, this.y)) {
			this.jumpIntoBag();
		}
		// else {
		//	this.width = this.scale*this.sprite.width;
		//	this.height = this.scale*this.sprite.height;		
		//}	
	}
};

Doll.prototype.click = function() {
	if (this.main.screenState == ScreenState.dollsLineUp) {
		this.main.selectedDoll = this;
		this.clickStartX = this.x;
		this.clickStartY = this.y;
		this.main.transitionToScreen(ScreenState.dollCloseUp);
	} else if (this.main.screenState == ScreenState.dollCloseUp) {
		this.main.transitionToScreen(ScreenState.dollsLineUp);
	}
};