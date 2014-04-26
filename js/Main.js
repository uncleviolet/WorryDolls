var MouseState = Object.freeze({up: 0, down: 1});

var Main = function() {
	this.mainCanvas = document.getElementById("mainCanvas");

	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;

	windowWidth = 480;
	windowHeight = 800;

//	var pixelRatio = window.devicePixelRatio || 1; /// get pixel ratio of device

	this.mainCanvas.width = windowWidth;
	this.mainCanvas.height = windowHeight;

//	this.mainCanvas.style.width = windowWidth + 'px';   /// CSS size of canvas
//	this.mainCanvas.style.height = windowHeight + 'px';

	this.ctx = this.mainCanvas.getContext('2d');
	this.ctx.fillStyle = "rgb(135,206,250)";
	var main = this;

	this.displayList = [];

	this.mouseIsDown = false;
	this.enableMouseEvents = true;
	this.mouseX = 0;
	this.mouseY = 0;

	this.bagX = windowWidth/2 + 20;
	this.bagY = windowHeight - 250;
	this.bagScale = 0.4;

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
							'img/bag3.png'];

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
};

Main.prototype.draw = function() {
	this.ctx.fillRect(0.0, 0.0, this.mainCanvas.width, this.mainCanvas.height);
	for (var i = 0; i < this.displayList.length; i++) {
		this.displayList[i].draw();
	}
};

Main.prototype.initDolls = function() {
	var dollSprites = this.imageSprites.slice(0,6);

	for (var i = 0; i < dollSprites.length; i++) {
		var dollSpacing = (this.dollsRowXRight - this.dollsRowXLeft)/(dollSprites.length - 1);
		var dollX = this.dollsRowXLeft + i*dollSpacing;
		var dollY = this.dollsRowY;
		var doll = new Doll(dollSprites[i], dollX, dollY, this.dollsRowScale);
		doll.main = this;
		doll.ctx = this.ctx;
		doll.mainCanvas = this.mainCanvas;
		this.displayList.push(doll);
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
		if (main.enableMouseEvents) {
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
}