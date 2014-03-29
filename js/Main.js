var Main = function() {
	this.mainCanvas = document.getElementById("mainCanvas");
	this.mainCanvas.height = 640;//window.innerHeight;
	this.mainCanvas.width = 400;//window.innerWidth;
	this.ctx = this.mainCanvas.getContext('2d');
	this.ctx.fillStyle = "rgb(255,255,255)";
	var main = this;

	this.mouseIsDown = false;
	this.enableMouseEvents = true;
	this.mouseX = 0;
	this.mouseY = 0;

	var doll1Sprite = new Image();
	var doll1X = 200.0;
	var doll1Y = 200.0;
	doll1Sprite.src = 'img/doll1.png';
	doll1Sprite.addEventListener("load", function() {
		var doll1 = new Doll(doll1Sprite, doll1X, doll1Y, 0.3);
		doll1.main = main;
		doll1.ctx = main.ctx;
		doll1.mainCanvas = main.mainCanvas;

		main.displayList = [doll1];

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

		
	}, false);
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

Main.prototype.initMouseEvents = function() {
	main = this;
	function mouseDown(e) {
		e.preventDefault();
		if (main.enableMouseEvents) {
			main.mouseIsDown = true;
			mouseXY(e);
			if (main.displayList[0].isUnderTouchCoords(main.mouseX, main.mouseY)) {
				main.displayList[0].initDrag(main.mouseX, main.mouseY);
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
			if (main.dragItem != null) {
				main.dragItem.endDrag();
				main.dragItem = null;
			}
		}
	};
	//document.body.style.webkitUserSelect='none';
		
	this.mainCanvas.addEventListener("mousedown", mouseDown, false);
	this.mainCanvas.addEventListener("mousemove", mouseXY, false);
	document.body.addEventListener("mouseup", mouseUp, false);

	document.addEventListener("touchmove", function(e) { e.preventDefault(); }, false);
	this.mainCanvas.addEventListener("touchstart", mouseDown, false);
	this.mainCanvas.addEventListener("touchmove", mouseXY, false);	
	this.mainCanvas.addEventListener("touchend", function(e) {	
		mouseUp();
	}, false);
	document.body.addEventListener("touchcancel", mouseUp, false);
};
