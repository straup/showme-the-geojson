var map = null;
var map_extent = null;

var documents = {};
var extents = {};
var properties = {};

function sm_init(){

	if (typeof FileReader == "undefined"){
		var input = document.getElementById("load_file");
		//input.style.display = "none";

		input.setAttribute("type", "text");
		input.setAttribute("value", "disabled (by your browser)");
		input.setAttribute("disabled", "disabled");
		input.setAttribute("style", "font-style:italic;background-color:transparent;border:none;");
	}

	// defer this until we actually have an extent/document to work with?

	var svg = org.polymaps.svg("svg");
	var parent = document.getElementById('map').appendChild(svg);

	map = org.polymaps.map();
	map.container(parent);

	map.zoomRange([1, 17]);

	var bg_tiles = org.polymaps.image();
	bg_tiles.url('http://spaceclaw.stamen.com/toner/{Z}/{X}/{Y}.png');
	map.add(bg_tiles);

	var controls = org.polymaps.interact();
	map.add(controls);

	var compass = org.polymaps.compass();
	compass.zoom("small");
	compass.pan("none");
	map.add(compass);

	sm_extents_jumpto();
}
