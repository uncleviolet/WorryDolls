var MouseState = Object.freeze({up: 0, down: 1});

var ScreenState = Object.freeze({bagScreen: 0, dollsLineUp: 1, dollCloseUp: 2});

var easeInOutCubicValue = function(t, b, c, d) {
	var ts = (t /= d)*t;
	var tc = ts*t;
	return b + c*(-2*tc + 3*ts);
};

var easeInCubicValue = function(t, b, c, d) {
	var tc = (t /= d)*t*t;
	return b + c*(tc);	
}

var easeOutCubicValue = function(t, b, c, d) {
	var ts = (t /= d)*t;
	var tc = ts*t;
	return b+c*(tc + -3*ts + 3*t);
}

var Ease = Object.freeze({in: easeInCubicValue, out: easeOutCubicValue, inOut: easeInOutCubicValue});

var Main = function() {
	this.mainCanvas = document.getElementById("mainCanvas");

	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;

	windowWidth = 480;
	windowHeight = 800;

	this.windowHeight = windowHeight;
	this.windowWidth = windowWidth;

//	var pixelRatio = window.devicePixelRatio || 1; /// get pixel ratio of device

	this.mainCanvas.width = windowWidth;
	this.mainCanvas.height = windowHeight;

//	this.mainCanvas.style.width = windowWidth + 'px';   /// CSS size of canvas
//	this.mainCanvas.style.height = windowHeight + 'px';

	this.backgroundColour = "rgb(135,206,250)";
	this.ctx = this.mainCanvas.getContext('2d');
	this.ctx.fillStyle = this.backgroundColour;
	var main = this;

	this.displayList = [];
	this.dolls = [];
	this.clouds = [];

	this.mouseIsDown = false;
	this.enableMouseEvents = true;
	this.mouseX = 0;
	this.mouseY = 0;

	this.bagX = windowWidth/2 + 20;
	this.bagY = windowHeight - 250;
	this.bagScale = 0.4;

	this.dollCloseUpX = windowWidth/2 - 30;
	this.dollCloseUpY = windowHeight/2 + 120;

	this.worryCentreX = 300;
	this.worryCentreY = 150;

	this.nDolls = 6;

	this.dollsRowY = 200;
	this.dollsRowXLeft = 100;
	this.dollsRowXRight = windowWidth - 100;
	this.dollsRowScale = 0.15;

	var imageSourceList = ['img/doll1.png',
							'img/doll2.png',
							'img/doll3.png',
							'img/doll4.png',
							'img/doll5.png',
							'img/doll6.png',
							'img/bag1.png',
							'img/bag2.png',
							'img/bag3.png',
							'img/cloud.png',
							'img/arrow.png',
							'img/worry.png',
							'img/notes1.png',
							'img/notes2.png',
							'img/notes3.png',
							'img/notes4.png',
							'img/z.png'];

	var imageLoadedCallback = function(imageSprites) {
		main.imageSprites = [];

		for (var i = 0; i < imageSourceList.length; i++) {
			for (var j = imageSprites.length - 1; j >= 0; j--) {
				if (imageSprites[j].sourceIndex === i) {
					main.imageSprites.push(imageSprites.splice(j,1)[0]);
					break;
				}
			}
		}

		main.initDolls();
		main.initBag();
		main.initScreen();
		main.initMouseEvents();

		var oldTimestamp = null;	
		setInterval(function() {
			var timestamp = new Date().getTime();
			if (oldTimestamp === null) oldTimestamp = timestamp;
			var progress = timestamp - oldTimestamp;
			oldTimestamp = timestamp;
			main.update(progress);	
		}, 30);

		function step(timestamp) {
			main.draw();
			window.requestAnimationFrame(step);	
		};
		window.requestAnimationFrame(step);

	};

	var imageLoader = new ImageLoader(imageSourceList, imageLoadedCallback);
};

Main.prototype.update = function(progress) {
	for (var i = 0; i < this.displayList.length; i++) {
		this.displayList[i].update(progress);
	}
	if (this.worryController != null) {
		this.worryController.update(progress);
	}
};

Main.prototype.draw = function() {
	this.ctx.fillRect(0.0, 0.0, this.mainCanvas.width, this.mainCanvas.height);
	for (var i = 0; i < this.displayList.length; i++) {
		this.displayList[i].draw();
	}
};

Main.prototype.initDolls = function() {
	var dollSprites = this.imageSprites.slice(0,this.nDolls);

	for (var i = 0; i < dollSprites.length; i++) {
		var dollSpacing = (this.dollsRowXRight - this.dollsRowXLeft)/(dollSprites.length - 1);
		var dollLineUpX = this.dollsRowXLeft + i*dollSpacing;
		var dollLineUpY = this.dollsRowY;
		var doll = new Doll(dollSprites[i], main.bagX, main.bagY, this.dollsRowScale, dollLineUpX, dollLineUpY);
		doll.main = this;
		doll.ctx = this.ctx;
		doll.mainCanvas = this.mainCanvas;
		this.displayList.push(doll);
		this.dolls.push(doll);
	}
};

Main.prototype.initBag = function() {
	var x = this.bagX;
	var y = this.bagY;
	var bag = new Bag(this.imageSprites.slice(6,9), x, y, this.bagScale);
	main.bag = bag;
	bag.main = this;
	bag.ctx = this.ctx;
	bag.mainCanvas = this.mainCanvas;
	this.displayList.push(bag);
};

Main.prototype.initWorries = function() {
	var worryController = new WorryController(this.imageSprites.slice(11,16));
	worryController.main = this.main;
	worryController.ctx = this.ctx;
	this.worryController = worryController;
}

Main.prototype.initScreen = function() {
	this.screenState = ScreenState.bagScreen;
};

Main.prototype.transitionToScreen = function(screenState) {
	this.enableMouseEvents = false;
	switch (screenState) {
		case ScreenState.dollsLineUp:
			if (this.screenState == ScreenState.bagScreen) {
				this.bagScreenToDollLineUpTransition();
			} else if (this.screenState == ScreenState.dollCloseUp) {
				this.dollCloseUpToLineUpTransition();
			}
			break;
		case ScreenState.dollCloseUp:
			if (this.screenState === ScreenState.dollsLineUp) {
				this.dollsLineUpToCloseUpTransition();
			}
			break;
	} 
};

Main.prototype.setScreenState = function(screenState) {
	this.screenState = screenState;
	this.enableMouseEvents = true;
};

Main.prototype.bagScreenToDollLineUpTransition = function() {
	var nComplete = 0;
	var nDolls = this.dolls.length;
	var main = this;
	var delayStart = 500;
	var totalDelayRange = 1500;

	this.bag.open();

	for (var i = 0; i < nDolls; i++) {
		var doll = this.dolls[i];
		function callback() {
			nComplete++;
			if (nComplete == nDolls) {
				main.bag.nDolls = 0;
				main.setScreenState(ScreenState.dollsLineUp);
			}
		};
		doll.isVisible = true;
		var delay = delayStart + Math.random()*totalDelayRange;
		doll.jumpOutOfBag(delay, callback);
	}
};

Main.prototype.dollsLineUpToCloseUpTransition = function() {
	var bagDelay = 0;
	var bagDuration = 800;
	this.bag.translate(this.bag.x, this.windowHeight+this.bag.height/2+50, bagDuration, bagDelay, Ease.in);

	for (var i = 0; i < this.nDolls; i++) {
		var doll = this.dolls[i];
		if (doll === this.selectedDoll) {
			continue;
		}
		var delay = i*150;
		var duration = 1000;
		if (doll.isVisible) {
			doll.translate(doll.x, this.windowHeight + doll.height/2 + 100, duration, delay, Ease.in);
		}
	}
	this.selectedDoll.zoomInToCloseUp();


	var cloudSprite = this.imageSprites[9];

	var cloud = new Cloud(cloudSprite, 300, 300, 0.04, null, false, false);
	cloud.main = this;
	cloud.ctx = this.ctx;
	cloud.mainCanvas = this.mainCanvas;
	this.displayList.push(cloud);
	cloud.open(200, 1200, false);
	this.clouds.push(cloud);

	cloud = new Cloud(cloudSprite, 350, 250, 0.08, null, false, false);
	cloud.main = this;
	cloud.ctx = this.ctx;
	cloud.mainCanvas = this.mainCanvas;
	this.displayList.push(cloud);
	cloud.open(200, 1400, false);
	this.clouds.push(cloud);

	cloud = new Cloud(cloudSprite, this.worryCentreX, this.worryCentreY, 0.3, 
		["tell me your",  "worries"], false, true);
	cloud.main = this;
	cloud.ctx = this.ctx;
	cloud.mainCanvas = this.mainCanvas;
	this.displayList.push(cloud);
	cloud.open(300, 1600, true);
	this.clouds.push(cloud);
};

Main.prototype.dollCloseUpToLineUpTransition = function() {
	for (var i = 0; i < this.nDolls; i++) {
		var doll = this.dolls[i];
		if (doll === this.selectedDoll) {
			continue;
		}
		var delay = i*150;
		var duration = 1000;
		if (doll.isVisible) {
			doll.x = doll.lineUpX;
			doll.translate(doll.lineUpX, doll.lineUpY, duration, delay, Ease.out);
		}
	}
	var bagDelay = 800;
	var bagDuration = 800;
	this.bringToFront(this.bag);
	this.bag.translate(this.bagX, this.bagY, bagDuration, bagDelay, Ease.out);
	this.selectedDoll.zoomOutToLineUp();
	for (var i = 0; i < this.clouds.length; i++) {
		this.clouds[i].close(500, i*100);
	}
	this.clouds = [];
};

Main.prototype.initMouseEvents = function() {
	main = this;
	function mouseDown(e) {
		e.preventDefault();
		if (main.enableMouseEvents) {
			main.mouseIsDown = true;
			mouseXY(e);
			for (var i = main.displayList.length - 1; i >= 0; i--) {
				if (main.displayList[i].isUnderCoords(main.mouseX, main.mouseY)) {
					var mouseDownItem = main.displayList[i];
					mouseDownItem.mouseDown(main.mouseX, main.mouseY);
					main.mouseDownItem = mouseDownItem;
					main.displayList.splice(i,1);
					main.displayList.push(mouseDownItem);
					break;
				}
			}
		}
	};
	function mouseXY(e) {
		if (main.enableMouseEvents && main.mouseIsDown) {
			main.mouseX = e.pageX - main.mainCanvas.getBoundingClientRect().left;
			main.mouseY = e.pageY - main.mainCanvas.getBoundingClientRect().top;
		}
	};
	function mouseUp(e) {
		if (main.enableMouseEvents) {
			main.mouseIsDown = false;
			if (main.mouseDownItem != null) {
				main.mouseDownItem.mouseUp(main.mouseX, main.mouseY);
				main.mouseDownItem = null;
			}
		}
	};
	//document.body.style.webkitUserSelect='none';
		
	this.mainCanvas.addEventListener("mousedown", mouseDown, false);
	this.mainCanvas.addEventListener("mousemove", mouseXY, false);
	document.body.addEventListener("mouseup", mouseUp, false);

	//document.addEventListener("touchstart", function(e) { e.preventDefault(); }, false);
	//document.addEventListener("touchmove", function(e) { e.preventDefault(); }, false);
	//document.addEventListener("touchend", function(e) { e.preventDefault(); }, false);

	this.mainCanvas.addEventListener("touchstart", mouseDown, false);
	this.mainCanvas.addEventListener("touchmove", mouseXY, false);	
	this.mainCanvas.addEventListener("touchend", function(e) {	
		mouseUp();
	}, false);
	document.body.addEventListener("touchcancel", mouseUp, false);
};

Main.prototype.bringToFront = function(item) {
	for (var i = 0; i < this.displayList.length; i++) {
		if (this.displayList[i] === item) {
			this.displayList.splice(i,1);
			this.displayList.push(item);
			break;
		}
	}
}

Main.prototype.sendToBack = function(item) {
	for (var i = 0; i < this.displayList.length; i++) {
		if (this.displayList[i] === item) {
			this.displayList.splice(i,1);
			this.displayList.unshift(item);
			break;
		}
	}
};

Main.prototype.moveBackOne = function(item) {
	for (var i = 0; i < this.displayList.length; i++) {
		if (this.displayList[i] === item) {
			this.displayList.splice(i,1);
			this.displayList.splice(i-1, 0, item);
			break;
		}
	}	
};

Main.prototype.removeFromDisplay = function(item) {
	for (var i = 0; i < this.displayList.length; i++) {
		if (this.displayList[i] === item) {
			this.displayList.splice(i,1);
			break;
		}
	}
};