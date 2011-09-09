function sm_load_uri(uri){

	if (extents[uri]){
		return;
	}

	var layer = org.polymaps.geoJson();
	layer.url(uri);

	var onload = sm_onload(uri);
	layer.on('load', onload);

	map.add(layer);
	documents[uri] = layer;

	sm_extents_set_onload(uri);
	sm_form_toggle('close');
}

function sm_load_features(features, uri){

	if (! uri){
		uri = hex_md5(JSON.stringify(features));
	}

	if (extents[uri]){
		return;
	}

	var layer = org.polymaps.geoJson();
	layer.features(features);

	var onload = sm_onload(uri);
	layer.on('load', onload);

	map.add(layer);
	documents[uri] = layer;

	sm_extents_set_onload();
	sm_form_toggle('close');
}


function sm_load_files(files){

	var count_files = files.length;

	for (var i=0; i < count_files; i++){
		sm_load_file(files[i]);
	}

}

function sm_load_file(file){

	var file_reader;

	try {
		file_reader = new FileReader();
	}

	catch(e){
		sm_load_uri(file.name);
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

		sm_load_features(geojson.features, file.name);
	};

	file_reader.readAsBinaryString(file);
	return;
}