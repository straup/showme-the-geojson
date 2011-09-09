var map = null;
var map_extent = null;

var documents = {};
var extents = {};
var properties = {};

function sm_init(uri){

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

	var hash = org.polymaps.hash();
	map.add(hash);

	var compass = org.polymaps.compass();
	compass.zoom("small");
	compass.pan("none");
	map.add(compass);

	if (uri){
		sm_load_uri(uri);
	}
}