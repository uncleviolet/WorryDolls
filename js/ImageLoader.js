var ImageLoader = function(sources, callback) {
	var nLoaded = 0;
	var imageSprites = [];

	function setIndex(sprite, i) {
		return function() { sprite.sourceIndex = i; };
	};

	function getIndex(index) {
		return index;
	};

	function imageLoaded(e) {
			nLoaded++;
			imageSprites.push(e.target);
			if (nLoaded >= sources.length) {
				callback(imageSprites);
			}
	};

	for (var i = 0; i < sources.length; i++) {
		var imageSprite = new Image();
		imageSprite.sourceIndex = i;
		imageSprite.src = sources[i];
		imageSprite.addEventListener("load", imageLoaded, false);
	}
};