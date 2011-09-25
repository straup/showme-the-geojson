function sm_extents_set_onload(uri){

	if (! uri){
		return;
	}

	if (! extents[uri]){

		if (extent_timeout){
			clearTimeout(extent_timeout);
		}

		extent_timeout = setTimeout(function(){
			sm_extents_set_onload(uri);
		}, 200);

		return;
	}

	sm_extents_set();
	sm_documents_list();
}
function sm_extents_set(){

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
		{ 'lat': nelat, 'lon': nelon }
	];

	sm_extents_jumpto();
}

function sm_extents_jumpto(uid){

	sm_properties_hide();

	if ((! uid) || (! extents[uid])){

		if ((! map_extent) || (map_extent[0]['lat'] == null)){

			map.extent([
				{ 'lat': -85, 'lon': -180 },
				{ 'lat': 85, 'lon': 180 }
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
