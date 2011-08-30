// this is a still-experimental version where all the code is
// supposed to be all self-contained and shiny and pluugable.
// it is not done yet...

// package functions

function showme_init(container){

	if (! container){
		container = 'showme';
	}

	var sm = new info.aaronland.showme.GeoJSON(container);
	sm.init();
}

// package methods

if (! info){
	var info = {};
}

if (! info.aaronland){
	info.aaronland = {};
}

if (! info.aaronland.showme){
	info.aaronland.showme = {};
}

info.aaronland.showme.GeoJSON = function(container){

	this.container = container;

	// TODO: make me a random and unique string
	this.appid = 'map';

	this.map = null;
	this.map_extent = null;
	this.documents = {};
	this.extents = {};
	this.properties = {};

	this.tiles = 'http://spaceclaw.stamen.com/toner/{Z}/{X}/{Y}.png';
	this.zoomrange = [1, 18];
}

info.aaronland.showme.GeoJSON.prototype.uid = function(id){
	return this.appid + '_' + id;
};

info.aaronland.showme.GeoJSON.prototype.classname = function(classname){
	return 'sm_' + classname;
};

info.aaronland.showme.GeoJSON.prototype.init = function(uri){

	this.setup_html();
	this.setup_map();

	if (uri){
		this.load_uri(uri);
	}
};

info.aaronland.showme.GeoJSON.prototype.setup_html = function(){

	var container = document.getElementById(this.container);

	var map = this.generate_map();
	var sidebar = this.generate_sidebar();
	var clipboard = this.generate_clipboard();

	container.appendChild(map);
	container.appendChild(sidebar);
	container.appendChild(clipboard);
};

info.aaronland.showme.GeoJSON.prototype.generate_map = function(){

	var map = document.createElement("div");
	map.setAttribute("id", this.uid("map"));
	map.setAttribute("class", this.classname("map"));

	return map;
};

info.aaronland.showme.GeoJSON.prototype.generate_sidebar = function(){

	var self = this;

	var sidebar = document.createElement("div");
	sidebar.setAttribute("id", self.uid("sidebar"));
	sidebar.setAttribute("class", self.classname("sidebar"));

	var header = document.createElement("h3");
	header.setAttribute("id", self.uid("load_header"));
	header.setAttribute("class", self.classname("load_header"));

	header.appendChild(document.createTextNode("load a new document"));

	header.addEventListener("click", function(){
		self.toggle_form();
	});

	var form_wrapper = document.createElement("div");
	form_wrapper.setAttribute("id", self.uid("load_form"));
	form_wrapper.setAttribute("class", self.classname("load_form"));

	var form = document.createElement("form");

	form.addEventListener("submit", function(){
		self.form_handler();
	});

	var file_uid = self.uid("file");
	var url_uid = self.uid("url");

	var file_label = document.createElement("label");
	file_label.setAttribute("for", file_uid);
	file_label.appendChild(document.createTextNode("load one or more documents from your computer"));

	var file_input = document.createElement("input");
	file_input.setAttribute("id", file_uid);
	file_input.setAttribute("type", "file");
	file_input.setAttribute("size", "40");
	// multiple?

	var url_label = document.createElement("label");
	url_label.setAttribute("for", url_uid);
	url_label.appendChild(document.createTextNode("load a document from the web"));

	var url_input = document.createElement("input");
	url_input.setAttribute("id", url_uid);
	url_input.setAttribute("type", "text");
	url_input.setAttribute("size", "50");

	var buttons = document.createElement("div");

	var submit_button = document.createElement("input");
	submit_button.setAttribute("type", "submit");
	submit_button.setAttribute("value", "SHOW ME NOW!");

	var cancel_button = document.createElement("input");
	cancel_button.setAttribute("type", "submit");
	cancel_button.setAttribute("value", "OR NOT...");

	cancel_button.addEventListener('click', function(){
		self.toggle_form('close');
	});

	buttons.appendChild(submit_button);
	buttons.appendChild(cancel_button);

	form.appendChild(file_label);
	form.appendChild(file_input);
	form.appendChild(url_label);
	form.appendChild(url_input);
	form.appendChild(buttons);

	form_wrapper.appendChild(form);

	var documents = document.createElement("div");
	documents.setAttribute("id", self.uid("documents"));
	documents.setAttribute("class", self.classname("documents"));

	var properties = document.createElement("div");
	properties.setAttribute("id", self.uid("properties"));
	properties.setAttribute("class", self.classname("properties"));

	sidebar.appendChild(header);
	sidebar.appendChild(form_wrapper);
	sidebar.appendChild(documents);
	sidebar.appendChild(properties);

	return sidebar;
};

info.aaronland.showme.GeoJSON.prototype.generate_clipboard = function(){

	var self = this;

	var clipboard = document.createElement("div");
	clipboard.setAttribute("id", this.uid("clipboard"));
	clipboard.setAttribute("class", this.classname("clipboard"));

	var clipbody = document.createElement('div');
	clipbody.setAttribute("id", this.uid("clipbody"));
	clipbody.setAttribute("class", this.classname("clipbody"));

	var clipblurb = document.createElement('div');
	clipblurb.setAttribute("id", this.uid("clipblurb"));
	clipblurb.setAttribute("class", this.classname("clipblurb"));

	var blurb = "This is the clipboard. It displays the properties for the last feature you clicked on in this here modal dialog in case you want to copy to your computer's actual clipboard.";

	var blurb_text = document.createElement("p");
	blurb_text.appendChild(document.createTextNode(blurb));

	var blurb_control = document.createElement("a");
	blurb_control.setAttribute("class", this.classname("close"));
	blurb_control.appendChild(document.createTextNode("close the clipboard"));

	blurb_control.addEventListener('click', function(){
		self.close_clipboard();
	});

	clipblurb.appendChild(blurb_text);
	clipblurb.appendChild(blurb_control);

	clipboard.appendChild(clipblurb);
	clipboard.appendChild(clipbody);

	return clipboard;
};

info.aaronland.showme.GeoJSON.prototype.setup_map = function(uri){

	var svg = org.polymaps.svg("svg");
	var parent = document.getElementById(this.uid('map')).appendChild(svg);

	var bg_tiles = org.polymaps.image();
	bg_tiles.url(this.tiles);

	var controls = org.polymaps.interact();
	var hash = org.polymaps.hash();

	var compass = org.polymaps.compass();
	compass.zoom("small");
	compass.pan("none");

	this.map = org.polymaps.map();
	this.map.container(parent);
	this.map.zoomRange(this.zoomrange);

	this.map.add(bg_tiles);
	this.map.add(controls);
	this.map.add(compass);
	this.map.add(hash);
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

	return function(){

		// only set the extent of the geojson features once...
		var set_extent = 1;

		return function(e){
			self.onload_do_this(e, uri, set_extent);
			set_extent = 0;
		};
	};

	// moon language...
}

// this is the code that *actually* gets called by the
// polymaps on('load') function

// TODO: mouseovers not working correctly

info.aaronland.showme.GeoJSON.prototype.onload_do_this = function(geojson, uid, set_extent){

	var self = this;

	if (! this.properties[uid]){
		this.properties[uid] = new Array();
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

		this.properties[uid][i] = data.properties;

		var pid = uid + "#" + i;
		var hex = hex_md5(pid);

		var el = feature.element;
		var type = data.geometry.type.toLowerCase();

		el.setAttribute('id', hex);
		el.setAttribute('class', type);

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

	this.extents[ uid ] = extent;

	if (set_extent){

		if (! this.map_extent){
			this.map_extent = extent;
		}

		else {

			this.map_extent[0]['lat'] = Math.min(this.map_extent[0]['lat'], extent[0]['lat']);
			this.map_extent[0]['lon'] = Math.min(this.map_extent[0]['lon'], extent[0]['lon']);
			this.map_extent[1]['lat'] = Math.max(this.map_extent[1]['lat'], extent[1]['lat']);
			this.map_extent[1]['lon'] = Math.max(this.map_extent[1]['lon'], extent[1]['lon']);
		}

		this.map.extent(extent);
		this.map.zoom(Math.floor(this.map.zoom()));

		this.list_documents();
	}

};

info.aaronland.showme.GeoJSON.prototype.list_documents = function(){

	var self = this;

	var docs = document.getElementById(this.uid("documents"));
	docs.innerHTML = '';

	var list = document.createElement('ul');

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
		extent.setAttribute('class', this.classname('bbox'));
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

	var props = document.getElementById(this.uid("properties"));
	props.innerHTML = '';

	var header = document.createElement('h2');
	header.appendChild(document.createTextNode(uid + ', item #' + (Number(idx) + 1)));
	props.appendChild(header);

	var list = this.domify_properties(data);

	var control = document.createElement('li');
	var link = document.createElement('a');
	link.setAttribute("class", this.classname("close"));

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

	var props = document.getElementById(this.uid("properties"));
	props.innerHTML = '';
	props.style.display = 'none';
}

info.aaronland.showme.GeoJSON.prototype.form_handler = function(){

	var url = document.getElementById(this.uid("url"));
	var file = document.getElementById(this.uid("file"));

	if (url.value){

		if (url.value.indexOf("http://") == 0){
			this.load_uri(url.value);
			url.value = '';
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

	var h = document.getElementById(this.uid("load_header"));
	h.style.display = (close) ? 'block' : 'none';

	var f = document.getElementById(this.uid("load_form"));
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

	var clipboard = document.getElementById(this.uid("clipboard"));
	var clipbody = document.getElementById(this.uid("clipbody"));

	clipbody.innerHTML = '';

	var header = document.createElement('h3');
	header.appendChild(document.createTextNode(uid + ', item #' + (Number(idx) + 1)));

	clipbody.appendChild(header);
	clipbody.appendChild(list);
	clipboard.style.display = 'block';
}

info.aaronland.showme.GeoJSON.prototype.close_clipboard = function(){

	var clipboard = document.getElementById(this.uid("clipboard"));
	var clipbody = document.getElementById(this.uid("clipbody"));

	clipbody.innerHTML = '';
	clipboard.style.display = 'none';

	this.hide_properties();
}