var map = null;
var map_extent = null;
var extent_timeout = null;

var documents = {};
var extents = {};
var properties = {};

var has_filereader = 1;

function sm_init(){

	// safari doesn't support FileReader at all but Chrome does
	// except for the part where it won't read local files...wtf

	has_filereader = (typeof(FileReader) !== "undefined") ? 1 : 0;

	if (navigator.userAgent.toLowerCase().indexOf('chrome') !== -1){
		has_filereader = 0;
	}

	if (! has_filereader){
		var input = document.getElementById("load_file");
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
