// this is a still-experimental version where all the code is
// supposed to be all self-contained and shiny and pluugable.
// it is not done yet...

if (! info){
	var info = {};
}

if (! info.aaronland){
	info.aaronland = {};
}

if (! info.aaronland.showme){
	info.aaronland.showme = {};
}

info.aaronland.showme.GeoJSON = function(){

	// TODO: make me a random and unique string
	this.uid = 'map';

	this.map = null;
	this.map_extent = null;
	this.documents = {};
	this.extents = {};
	this.properties = {};

	this.tiles = 'http://spaceclaw.stamen.com/toner/{Z}/{X}/{Y}.png';
}

info.aaronland.showme.GeoJSON.prototype.init = function(id, uri){

	// TODO: generate all DOM for the map bucket and sidebar/clipboard
	// with anonymous event handlers; ensure that anything with an ID
	// is prepended with this.uid; update CSS accordingly...

	var svg = org.polymaps.svg("svg");
	var parent = document.getElementById(this.uid).appendChild(svg);

	var bg_tiles = org.polymaps.image();
	bg_tiles.url(this.tiles);

	var controls = org.polymaps.interact();
	var hash = org.polymaps.hash();

	var compass = org.polymaps.compass();
	compass.zoom("small");
	compass.pan("none");

	this.map = org.polymaps.map();
	this.map.container(parent);
	this.map.zoomRange([1, 18]);

	this.map.add(bg_tiles);
	this.map.add(controls);
	this.map.add(compass);
	this.map.add(hash);

	if (uri){
		this.load_uri(uri);
	}

};

info.aaronland.showme.GeoJSON.prototype.load_uri = function(uri){

	this.toggle_form('close');

	if (this.extents[uri]){
		return;
	}

	var layer = org.polymaps.geoJson();
	layer.url(uri);

	var onload = this.onload_generator(uri);
	layer.on('load', onload());

	this.map.add(layer);
	this.documents[uri] = layer;
}

// this doesn't work for reasons I don't understand...

info.aaronland.showme.GeoJSON.prototype.load_features = function(features, uri){

	if (! uri){
		uri = hex_md5(JSON.stringify(features));
	}

	if (this.extents[uri]){
		return;
	}

	var layer = org.polymaps.geoJson();
	layer.features(features);

	// specifically, whenever this is triggered it seems
	// to launch itself in to a spiral death march calling
	// itself over and over and over again; this does not
	// happen fetch remote URLs...

	var onload = this.onload_generator(uri);
	layer.on('load', onload());

	this.map.add(layer);
}

info.aaronland.showme.GeoJSON.prototype.onload_generator = function(uri){

	var self = this;

	// TO DO: move this inline below

	var onload = function(geojson, uid, set_extent){

		if (! self.properties[uid]){
			self.properties[uid] = new Array();
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

			// TODO: linestrings

			else {
				console.log("unsupported type: " + data.geometry.type);
				continue;
			}

			self.properties[uid][i] = data.properties;

			var pid = uid + "#" + i;
			var hex = hex_md5(pid);

			var el = feature.element;

			el.setAttribute('id', hex);
			el.setAttribute('class', data.geometry.type.toLowerCase());

			el.addEventListener('mouseover', function(){
				self.show_properties(pid);
			}, false);

			el.addEventListener('click', function(){
				self.copy_to_clipboard(pid);
			}, false);
		}

		var extent = [
			{lat: swlat, lon: swlon},
			{lat: nelat, lon: nelon},
		];

		self.extents[ uid ] = extent;

		if (set_extent){

			if (! self.map_extent){
				self.map_extent = extent;
			}

			else {

				self.map_extent[0]['lat'] = Math.min(self.map_extent[0]['lat'], extent[0]['lat']);
				self.map_extent[0]['lon'] = Math.min(self.map_extent[0]['lon'], extent[0]['lon']);
				self.map_extent[1]['lat'] = Math.max(self.map_extent[1]['lat'], extent[1]['lat']);
				self.map_extent[1]['lon'] = Math.max(self.map_extent[1]['lon'], extent[1]['lon']);
			}

			self.map.extent(extent);
			self.map.zoom(Math.floor(self.map.zoom()));
		}
	};

	// this is the thing we return

	return function(){

		// only set the extent of the geojson features once...
		var set_extent = 1;

		// this is the thing that gets called

		return function(e){

			// and this is what happens
			onload(e, uri, set_extent);

			if (set_extent){
				self.list_documents();
			}

			set_extent = 0;
		};
	};

	// moon language...
}

info.aaronland.showme.GeoJSON.prototype.list_documents = function(){

	var self = this;

	var docs = document.getElementById("extents");
	docs.innerHTML = '';

	var list = document.createElement('ul');
	list.setAttribute('class', 'properties');

	for (var uid in this.extents){

		var doc = document.createElement('li');
		var name = document.createElement('a');
		var txt = document.createTextNode(uid);
		name.appendChild(txt);

		name.addEventListener('click', function(){
			self.jump_to(uid);
		}, false);

		var del = document.createElement('a');
		del.setAttribute("class", "close");

		var txt = document.createTextNode(" remove this document");
		del.appendChild(txt);

		del.addEventListener('click', function(){
			self.remove_document(uid);
		}, false);

		var bbox = this.extents[ uid ];
		bbox = [ bbox[0].lat, bbox[0].lon, bbox[1].lat, bbox[1].lon ];

		var extent = document.createElement('div');
		extent.setAttribute('class', 'bbox');
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

		link.addEventListener('click', function(){
			self.jump_to();
		}, false);

		control.appendChild(link);
		list.appendChild(control);
	}

	var header = document.createElement('h2');
	header.appendChild(document.createTextNode('Documents'));

	docs.appendChild(header);
	docs.appendChild(list);
}

info.aaronland.showme.GeoJSON.prototype.remove_document = function(uid){

	if (! this.documents[uid]){
		return;
	}

	this.map.remove(this.documents[uid]);

	delete this.documents[uid];
	delete this.extents[uid];

	var swlat = null;
	var swlon = null;
	var nelat = null;
	var nelon = null;

	for (uid in this.extents){
		bbox = this.extents[uid];

		swlat = (swlat) ? Math.min(swlat, bbox[0]['lat']) : bbox[0]['lat'];
		swlon = (swlon) ? Math.min(swlon, bbox[0]['lon']) : bbox[0]['lon'];
		nelat = (nelat) ? Math.max(nelat, bbox[1]['lat']) : bbox[1]['lat'];
		nelon = (nelon) ? Math.max(nelon, bbox[1]['lon']) : bbox[1]['lon'];
	}

	this.map_extent = [
		{ 'lat': swlat, 'lon': swlon },
		{ 'lat': nelat, 'lon': nelon },
	];

	this.jump_to();
	this.list_documents();
}

info.aaronland.showme.GeoJSON.prototype.jump_to = function(uid){

	this.hide_properties();

	if ((! uid) || (! this.extents[uid])){
		this.map.extent(this.map_extent);
		this.map.zoom(Math.floor(this.map.zoom()));
		return;
	}

	this.map.extent(this.extents[uid]);
	this.map.zoom(Math.floor(this.map.zoom()));
}

info.aaronland.showme.GeoJSON.prototype.show_properties = function(pid){

	var self = this;

	// pid == document uri + '#' + feature idx

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

	if (! this.properties[uid]){
		return;
	}

	var data = this.properties[uid][idx];

	var props = document.getElementById("properties");
	props.innerHTML = '';

	var header = document.createElement('h2');
	header.appendChild(document.createTextNode(uid + ', item #' + (Number(idx) + 1)));
	props.appendChild(header);

	var list = this.domify_properties(data);

	var control = document.createElement('li');
	var link = document.createElement('a');
	link.setAttribute("class", "close");

	var txt = document.createTextNode("hide these properties");
	link.appendChild(txt);

	link.addEventListener('click', function(){
		self.hide_properties(pid);
	}, false);

	control.appendChild(link);
	list.appendChild(control);

	props.appendChild(list);
	props.style.display = 'block';
}

info.aaronland.showme.GeoJSON.prototype.domify_properties = function(data){

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

info.aaronland.showme.GeoJSON.prototype.hide_properties = function(){
	var props = document.getElementById("properties");
	props.innerHTML = '';
	props.style.display = 'none';
}

info.aaronland.showme.GeoJSON.prototype.form_handler = function(){

	var uri = document.getElementById("fetchuri");
	var file = document.getElementById("fetchfile");

	if (uri.value){

		if (uri.value.indexOf("http://") == 0){
			this.load_uri(uri.value);
			uri.value = '';
			return;
		}

		alert("Invalid URL!");
	}

	if (file.files.length){
		this.load_files(file.files);
		file.value = '';
		return;
	}
}

info.aaronland.showme.GeoJSON.prototype.load_files = function(files){

	var count_files = files.length;

	for (var i=0; i < count_files; i++){
		this.load_file(files[i]);
	}

}

info.aaronland.showme.GeoJSON.prototype.load_file = function(file){

	// see notes in showme_loadjson_features;
	// this works in FF an Safari...

	try {
		this.load_uri(file.name);
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

	this.load_features(geojson.features, file.name);
}

info.aaronland.showme.GeoJSON.prototype.toggle_form = function(close){

	var h = document.getElementById("load_header");
	h.style.display = (close) ? 'block' : 'none';

	var f = document.getElementById("load_form");
	f.style.display = (close) ? 'none' : 'block';
}

info.aaronland.showme.GeoJSON.prototype.copy_to_clipboard = function(pid){

	var parts = pid.split("#");
	var uid = parts[0];
	var idx = parts[1];

	if (! this.properties[uid]){
		return;
	}

	var data = this.properties[uid][idx];
	var list = this.domify_properties(data);

	var clipboard = document.getElementById("clipboard");

	var clipbody = document.getElementById("clipbody");
	clipbody.innerHTML = '';

	var header = document.createElement('h3');
	header.appendChild(document.createTextNode(uid + ', item #' + (Number(idx) + 1)));

	clipbody.appendChild(header);
	clipbody.appendChild(list);
	clipboard.style.display = 'block';
}

info.aaronland.showme.GeoJSON.prototype.close_clipboard = function(){
	var clipboard = document.getElementById("clipboard");
	var clipbody = document.getElementById("clipbody");
	clipbody.innerHTML = '';
	clipboard.style.display = 'none';

	this.hide_properties();
}