var WorryController = function(sprites) {
	this.worries = [];
	this.worrySprites = sprites;
	this.worryDuration = 2000;
	this.worryInterval = 500;
	this.timeSinceLastWorry = 0;
};

WorryController.prototype.update = function(progress) {
	this.timeSinceLastWorry += progress;
	if (this.timeSinceLastWorry > this.worryInterval) {
		this.timeSinceLastWorry -= this.worryInterval;
		this.newWorry();
	}
//	for (var i = 0; i < this.worries.length; i++) {
//		this.worries[i].update(progress);
//	}
};

WorryController.prototype.newWorry = function() {
	var nSprites = this.worrySprites.length;
	var index = Math.floor(Math.random()*nSprites);
	var sprite = this.worrySprites[index];
	var x = main.windowWidth/2;
	var y = main.windowHeight + 50;
	var worry = new Worry(sprite, x, y, 0.5, main.worryCentreX, main.worryCentreY, this.worryDuration);
	worry.controller = this;
	worry.ctx = main.ctx;
	main.displayList.push(worry);
	this.worries.push(worry);
}
