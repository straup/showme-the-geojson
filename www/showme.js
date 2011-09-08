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
		sm_loadjson_uri(uri);
	}
}

function sm_loadjson_uri(uri){

	sm_toggle_form('close');

	if (extents[uri]){
		return;
	}

	var layer = org.polymaps.geoJson();
	layer.url(uri);

	var onload = sm_onload(uri, 1);
	layer.on('load', onload);

	map.add(layer);
	documents[uri] = layer;
}

function sm_loadjson_features(features, uri){

	if (! uri){
		uri = hex_md5(JSON.stringify(features));
	}

	if (extents[uri]){
		return;
	}

	var layer = org.polymaps.geoJson();
	layer.features(features);

	// something is very very wrong here...

	// specifically, whenever this is called with set_extent (1)
	// to launch itself in to a spiral death march calling
	// itself over and over and over again; this does not
	// happen fetch remote URLs...

	var onload = sm_onload(uri, 0);
	layer.on('load', onload);

	map.add(layer);
	documents[uri] = layer;
}

// TO DO: fuck this noise and calculate extent and
// set extent in the formhandler not here

function sm_onload(uri, set_extent){

	return function(e){

		sm_onloadjson(e, uri, set_extent);
		set_extent = 0;
	}
}

function sm_onloadjson(geojson, uid, set_extent){

	if (! properties[uid]){
		properties[uid] = new Array();
	}

	var count = geojson.features.length;

	var swlat = null;
	var swlon = null;
	var nelat = null;
	var nelon = null;

	var calculate_extent_for_geom = function(geom){

		if (geom.type == 'GeometryCollection'){

			console.log('GeometryCollections are not fully implemented yet');
			return;

			var count_geoms = geom.geometries.length;

			for (var j=0; j < count_geoms; j++){
				calculate_extent_for_geom(geom.geometries[j]);
			}
		}

		else if (geom.type == 'Polygon'){
			var coords = geom.coordinates[0];
			var count_coords = coords.length;

			for (var j=0; j < count_coords; j++){
				swlat = (swlat) ? Math.min(swlat, coords[j][1]) : coords[j][1];
				swlon = (swlon) ? Math.min(swlon, coords[j][0]) : coords[j][0];
				nelat = (nelat) ? Math.max(nelat, coords[j][1]) : coords[j][1];
				nelon = (nelon) ? Math.max(nelon, coords[j][0]) : coords[j][0];
			}
		}

		else if (geom.type == 'MultiPolygon'){

			var polys = geom.coordinates[0];
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

		else if (geom.type == 'Point'){
			var coord = geom.coordinates;
			swlat = (swlat) ? Math.min(swlat, coord[1]) : coord[1];
			swlon = (swlon) ? Math.min(swlon, coord[0]) : coord[0];
			nelat = (nelat) ? Math.max(nelat, coord[1]) : coord[1];
			nelon = (nelon) ? Math.max(nelon, coord[0]) : coord[0];
		}

		else {
			console.log("unsupported type: " + data.geometry.type);
		}

	};

	for (var i = 0; i < count; i++){

		var feature = geojson.features[i];
		var data = feature.data;

		if (data.bbox){
			swlat = (swlat) ? Math.min(swlat, data.bbox[1]) : data.bbox[1];
			swlon = (swlon) ? Math.min(swlon, data.bbox[0]) : data.bbox[0];
			nelat = (nelat) ? Math.max(nelat, data.bbox[3]) : data.bbox[3];
			nelon = (nelon) ? Math.max(nelon, data.bbox[2]) : data.bbox[2];
		}

		else {
			calculate_extent_for_geom(data.geometry);
		}

		properties[uid][i] = data.properties;

		var pid = uid + "#" + i;
		var hex = hex_md5(pid);
		var el = feature.element;

		if (data.geometry.type == 'GeometryCollection'){
			// write me...
		}

		else {
			el.setAttribute('onmouseover', 'sm_show_properties("' + pid + '");');
			el.setAttribute('onclick', 'sm_copy_to_clipboard("' + pid + '");');

			el.setAttribute('class', data.geometry.type.toLowerCase());
			el.setAttribute('id', hex);
		}

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

function sm_list_documents(){

	var docs = document.getElementById("documents");
	docs.innerHTML = '';

	var list = document.createElement('ul');
	list.setAttribute('class', 'properties');

	for (var uid in extents){

		var doc = document.createElement('li');
		var name = document.createElement('a');
		var txt = document.createTextNode(uid);
		name.appendChild(txt);
		name.setAttribute('onclick', 'sm_jumpto("' + uid + '");');

		var del = document.createElement('a');
		del.setAttribute("class", "sm_close");

		var txt = document.createTextNode(" remove this document");
		del.appendChild(txt);
		del.setAttribute('onclick', 'remove_document("' + uid + '");');

		var bbox = extents[ uid ];
		bbox = [ bbox[0].lat, bbox[0].lon, bbox[1].lat, bbox[1].lon ];

		var extent = document.createElement('div');
		extent.setAttribute('class', 'sm_bbox');
		extent.appendChild(document.createTextNode(bbox.join(', ')));

		doc.appendChild(name);
		doc.appendChild(del);
		doc.appendChild(extent);
		list.appendChild(doc);
	}

	if (list.children.length == 0){
		return;
	}

	if (list.children.length > 1){

		var control = document.createElement('li');
		var link = document.createElement('a');
		var txt = document.createTextNode("show all");

		link.appendChild(txt);
		link.setAttribute('onclick', 'sm_jumpto();');
		control.appendChild(link);
		list.appendChild(control);
	}

	var header = document.createElement('h2');
	header.appendChild(document.createTextNode('Documents'));

	docs.appendChild(header);
	docs.appendChild(list);
}

function remove_document(uid){
	if (! documents[uid]){
		return;
	}

	map.remove(documents[uid]);

	delete documents[uid];
	delete extents[uid];

	var swlat = null;
	var swlon = null;
	var nelat = null;
	var nelon = null;

	for (uid in extents){
		bbox = extents[uid];

		swlat = (swlat) ? Math.min(swlat, bbox[0]['lat']) : bbox[0]['lat'];
		swlon = (swlon) ? Math.min(swlon, bbox[0]['lon']) : bbox[0]['lon'];
		nelat = (nelat) ? Math.max(nelat, bbox[1]['lat']) : bbox[1]['lat'];
		nelon = (nelon) ? Math.max(nelon, bbox[1]['lon']) : bbox[1]['lon'];
	}

	map_extent = [
		{ 'lat': swlat, 'lon': swlon },
		{ 'lat': nelat, 'lon': nelon },
	];

	sm_jumpto();
	sm_list_documents();
}

function sm_jumpto(uid){

	sm_hide_properties();

	if ((! uid) || (! extents[uid])){

		if (map_extent[0]['lat'] == null){
			map.extent([
				{ 'lat': -85, 'lon': -180 },
				{ 'lat': 85, 'lon': 180 },
			]);
			map.zoom(1);
			return;
		}

		map.extent(map_extent);
		map.zoom(Math.floor(map.zoom()));
		return;
	}

	map.extent(extents[uid]);
	map.zoom(Math.floor(map.zoom()));
}

function sm_show_properties(pid){

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

	if (! properties[uid]){
		return;
	}

	var data = properties[uid][idx];

	var props = document.getElementById("properties");
	props.innerHTML = '';

	var header = document.createElement('h2');
	header.appendChild(document.createTextNode(uid + ', item #' + (Number(idx) + 1)));
	props.appendChild(header);

	var list = sm_domify_properties(data);

	var control = document.createElement('li');
	var link = document.createElement('a');
	link.setAttribute("class", "sm_close");
	var txt = document.createTextNode("hide these properties");

	link.appendChild(txt);
	link.setAttribute('onclick', 'sm_hide_properties();');
	control.appendChild(link);
	list.insertBefore(control, list.firstChild);

	// TO DO: if there are no children then auto-close on mouseout

	props.appendChild(list);
	props.style.display = 'block';
}

function sm_domify_properties(data){

	var list = document.createElement('ul');
	list.setAttribute('class', 'properties');

	if (data){
		for (var key in data){

			var value = data[key];
			var prop = document.createElement('li');
			var txt = document.createTextNode(key + ' : ' + value);

			prop.appendChild(txt);
			list.appendChild(prop);
		}
	}

	if (! list.children.length){

		var note = document.createElement('li');
		note.setAttribute("class", "caveat");
		var txt = document.createTextNode('this feature has no extra properties');

		note.appendChild(txt);
		list.appendChild(note);
	}

	return list;
}

function sm_hide_properties(){
	var props = document.getElementById("properties");
	props.innerHTML = '';
	props.style.display = 'none';
}

function sm_formhandler(){

	var uri = document.getElementById("fetchuri");
	var file = document.getElementById("fetchfile");

	if (uri.value){

		if (uri.value.indexOf("http://") == 0){
			sm_loadjson_uri(uri.value);
			uri.value = '';
		}

		else {
			alert("Invalid URL!");
		}
	}

	if (file.files.length){
		sm_loadfiles(file.files);
		file.value = '';
	}

	sm_list_documents();
	sm_toggle_form('close');
}

function sm_loadfiles(files){

	var count_files = files.length;

	for (var i=0; i < count_files; i++){
		sm_loadfile(files[i]);
	}

}

function sm_loadfile(file){

	var file_reader;

	try {
		file_reader = new FileReader();
	}

	catch(e){
		sm_loadjson_uri(file.name);
		return;
	}

	file_reader.onloadend = function(e){

		try {
			geojson = JSON.parse(e.target.result);
		}

		catch(e) {
			alert('failed to parse your file (' + file.name + '), the error was: ' + e);
			return;
		}

		sm_loadjson_features(geojson.features, file.name);
	};

	file_reader.readAsBinaryString(file);
	return;
}

function sm_toggle_form(close){

	var h = document.getElementById("load_header");
	h.style.display = (close) ? 'block' : 'none';

	var f = document.getElementById("load_form");
	f.style.display = (close) ? 'none' : 'block';
}

function sm_copy_to_clipboard(pid){

	var parts = pid.split("#");
	var uid = parts[0];
	var idx = parts[1];

	if (! properties[uid]){
		return;
	}

	var data = properties[uid][idx];
	var list = sm_domify_properties(data);

	var clipboard = document.getElementById("clipboard");

	var clipbody = document.getElementById("clipbody");
	clipbody.innerHTML = '';

	var header = document.createElement('h3');
	header.appendChild(document.createTextNode(uid + ', item #' + (Number(idx) + 1)));

	clipbody.appendChild(header);
	clipbody.appendChild(list);
	clipboard.style.display = 'block';

}

function sm_close_clipboard(){
	var clipboard = document.getElementById("clipboard");
	var clipbody = document.getElementById("clipbody");
	clipbody.innerHTML = '';
	clipboard.style.display = 'none';
	sm_hide_properties();
}