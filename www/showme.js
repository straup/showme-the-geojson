var map = null;
var map_extent = null;

var extents = {};
var properties = {};

function showme_init(uri){

	var svg = org.polymaps.svg("svg");
	var parent = document.getElementById('map').appendChild(svg);

	map = org.polymaps.map();
	map.container(parent);

	map.zoomRange([1, 18]);

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
		showme_loadjson_uri(uri);
	}
}

function showme_loadjson_uri(uri){

	toggle_form('close');

	if (extents[uri]){
		return;
	}

	var js_tiles = org.polymaps.geoJson();
	js_tiles.url(uri);

	var onload = showme_onload(uri);
	js_tiles.on('load', onload());

	map.add(js_tiles);
}

// this doesn't work for reasons I don't understand...

function showme_loadjson_features(features, uri){

	if (! uri){
		uri = hex_md5(JSON.stringify(features));
	}

	if (extents[uri]){
		return;
	}

	var js_tiles = org.polymaps.geoJson();
	js_tiles.features(features);

	// specifically, whenever this is triggered it seems
	// to launch itself in to a spiral death march calling
	// itself over and over and over again; this does not
	// happen fetch remote URLs...

	var onload = showme_onload(uri);
	js_tiles.on('load', onload());

	map.add(js_tiles);
}

function showme_onload(uri){

	return function(){

		// only set the extent of the geojson features once...
		var set_extent = 1;

		return function(e){

			showme_onloadjson(e, uri, set_extent);

			if (set_extent){
				showme_list_extents();
			}

			set_extent = 0;
		}
	}

}

function showme_onloadjson(geojson, uid, set_extent){

	// check for extents[uid] here...

	if (! properties[uid]){
		properties[uid] = new Array();
	}

	var count = geojson.features.length;

	var swlat = null;
	var swlon = null;
	var nelat = null;
	var nelon = null;

	for (var i = 0; i < count; i++){

		var feature = geojson.features[i];
		var data = feature.data;

		if (data.bbox){
			swlat = (swlat) ? Math.min(swlat, data.bbox[1]) : data.bbox[1];
			swlon = (swlon) ? Math.min(swlon, data.bbox[0]) : data.bbox[0];
			nelat = (nelat) ? Math.max(nelat, data.bbox[3]) : data.bbox[3];
			nelon = (nelon) ? Math.max(nelon, data.bbox[2]) : data.bbox[2];
		}

		else if (data.geometry.type == 'Polygon'){
            console.log(data);
			var coords = data.geometry.coordinates[0];
			var count_coords = coords.length;

			for (var j=0; j < count_coords; j++){
				swlat = (swlat) ? Math.min(swlat, coords[j][1]) : coords[j][1];
				swlon = (swlon) ? Math.min(swlon, coords[j][0]) : coords[j][0];
				nelat = (nelat) ? Math.max(nelat, coords[j][1]) : coords[j][1];
				nelon = (nelon) ? Math.max(nelon, coords[j][0]) : coords[j][0];
			}
		}

		else if (data.geometry.type == 'MultiPolygon'){

			var polys = data.geometry.coordinates[0];
			var count_polys = polys.length;

			for (var j=0; j < count_polys; j++){

				var count_coords = polys[j].length;

				for (var k=0; k < count_coords; k++){
					var coord = polys[j][k];
					swlat = (swlat) ? Math.min(swlat, coord[1]) : coord[1];
					swlon = (swlon) ? Math.min(swlon, coord[0]) : coord[0];
					nelat = (nelat) ? Math.max(nelat, coord[1]) : coord[1];
					nelon = (nelon) ? Math.max(nelon, coord[0]) : coord[0];
				}
			}
		}

		else if (data.geometry.type == 'Point'){
			var coord = data.geometry.coordinates;
			swlat = (swlat) ? Math.min(swlat, coord[1]) : coord[1];
			swlon = (swlon) ? Math.min(swlon, coord[0]) : coord[0];
			nelat = (nelat) ? Math.max(nelat, coord[1]) : coord[1];
			nelon = (nelon) ? Math.max(nelon, coord[0]) : coord[0];
		}

		else {
			console.log("unsupported type");
			continue;
		}

		properties[uid][i] = data.properties;

		var pid = uid + "#" + i;
		var hex = hex_md5(pid);

		var el = feature.element;
		el.setAttribute('onmouseover', 'showme_show_properties("' + pid + '");');

		el.setAttribute('class', data.geometry.type.toLowerCase());
		el.setAttribute('id', hex);
	}

	var extent = [
		{lat: swlat, lon: swlon},
		{lat: nelat, lon: nelon},
	];

	extents[ uid ] = extent;

	if (set_extent){

		if (! map_extent){
			map_extent = extent;
		}

		else {

			map_extent[0]['lat'] = Math.min(map_extent[0]['lat'], extent[0]['lat']);
			map_extent[0]['lon'] = Math.min(map_extent[0]['lon'], extent[0]['lon']);
			map_extent[1]['lat'] = Math.max(map_extent[1]['lat'], extent[1]['lat']);
			map_extent[1]['lon'] = Math.max(map_extent[1]['lon'], extent[1]['lon']);
		}

		map.extent(extent);
		map.zoom(Math.floor(map.zoom()));
	}
}

function showme_list_extents(){

	var ul = document.createElement('ul');
	ul.setAttribute('class', 'properties');

	var counter = 0;

	for (var uid in extents){

		var li = document.createElement('li');
		var a = document.createElement('a');
		var txt = document.createTextNode(uid);

		a.appendChild(txt);
		a.setAttribute('onclick', 'showme_jumpto("' + uid + '");');

		var bbox = extents[ uid ];
		bbox = [ bbox[0].lat, bbox[0].lon, bbox[1].lat, bbox[1].lon ];

		var div = document.createElement('div');
		div.setAttribute('class', 'bbox');
		div.appendChild(document.createTextNode(bbox.join(', ')));

		li.appendChild(a);
		li.appendChild(div);

		ul.appendChild(li);

		counter ++;
	}

	if (counter > 1){

		var li = document.createElement('li');
		var a = document.createElement('a');
		var txt = document.createTextNode("show all");

		a.appendChild(txt);
		a.setAttribute('onclick', 'showme_jumpto();');

		li.appendChild(a);
		ul.appendChild(li);
	}

	var header = document.createElement('h2');
	header.appendChild(document.createTextNode('Documents'));

	var ext = document.getElementById("extents");
	ext.innerHTML = '';

	ext.appendChild(header);
	ext.appendChild(ul);
}

function showme_jumpto(uid){

	showme_hide_properties();

	if ((! uid) || (! extents[uid])){
		map.extent(map_extent);
		map.zoom(Math.floor(map.zoom()));
		return;
	}

	map.extent(extents[uid]);
	map.zoom(Math.floor(map.zoom()));
}

function showme_show_properties(pid){

	var active = document.getElementsByClassName('geom-active');
	var count_active = active.length;

	for (var i=0; i < count_active; i++){
		var el = active[i];
		var classes = el.getAttribute('class');
		classes = classes.replace("geom-active", "");
		classes = classes.trim();
		el.setAttribute('class', classes);
	}

	var hex = hex_md5(pid);
	var geom = document.getElementById(hex);

	var classes = geom.getAttribute('class');
	classes += ' geom-active';

	geom.setAttribute('class', classes);

	var parts = pid.split("#");
	var uid = parts[0];
	var idx = parts[1];

	var data = properties[uid][idx];

	var ul = document.createElement('ul');
	ul.setAttribute('class', 'properties');

	for (var key in data){
		var value = data[key];
		var li = document.createElement('li');
		var txt = document.createTextNode(key + ' : ' + value);
		li.appendChild(txt);
		ul.appendChild(li);
	}

	var header = document.createElement('h2');
	header.appendChild(document.createTextNode(uid + ', item #' + (Number(idx) + 1)));

	var props = document.getElementById("properties");
	props.innerHTML = '';

	props.appendChild(header);
	props.appendChild(ul);
}

function showme_hide_properties(){
	var props = document.getElementById("properties");
	props.innerHTML = '';
}

function showme_formhandler(){

	var uri = document.getElementById("fetchuri");
	var file = document.getElementById("fetchfile");

	if (uri.value){

		if (uri.value.indexOf("http://") == 0){
			showme_loadjson_uri(uri.value);

			uri.value = '';
			return;
		}

		alert("Invalid URL!");
	}

	if (file.files.length){
		showme_loadfiles(file.files);

		file.value = '';
		return;
	}
}

function showme_loadfiles(files){

		var file = files[0];

	// see notes in showme_loadjson_features;
	// this works in FF an Safari...

	try {
		showme_loadjson_uri(file.name);
	}

	catch (e){
		alert(e);
	}

	// see notes in showme_loadjson_features
	return;

	if (file.type != 'application/json'){
		return;
	}

	var geojson = file.getAsBinary();

	try {
		geojson = JSON.parse(geojson);
	}

	catch(e) {
		console.log(e);
		return;
	}

	showme_loadjson_features(geojson.features, file.name);
}

function toggle_form(close){

	var h = document.getElementById("load_header");
	h.style.display = (close) ? 'block' : 'none';

	var f = document.getElementById("load_form");
	f.style.display = (close) ? 'none' : 'block';
}