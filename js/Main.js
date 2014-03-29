var Main = function() {
	this.mainCanvas = document.getElementById("mainCanvas");
	this.ctx = this.mainCanvas.getContext('2d');
	this.ctx.fillStyle = "rgb(255,255,255)";
	var main = this;
	var doll1Sprite = new Image();
	var doll1X = 200.0;
	var doll1Y = 200.0;
	doll1Sprite.src = 'img/doll1.png';
	doll1Sprite.addEventListener("load", function() {
		main.doll1 = new Doll(doll1Sprite, doll1X, doll1Y, 0.5);
		main.doll1.main = main;
		main.doll1.ctx = main.ctx;
		main.doll1.mainCanvas = main.mainCanvas;


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
	this.doll1.update(progress);
};

Main.prototype.draw = function() {
	this.ctx.fillRect(0.0, 0.0, this.mainCanvas.width, this.mainCanvas.height);
	this.doll1.draw();
};