function sm_onload(uri){

	return function(e){
		sm_onload_json(e, uri);
	}
}

function sm_onload_json(geojson, uid){

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

			/*
			var count_geoms = geom.geometries.length;

			for (var j=0; j < count_geoms; j++){
				calculate_extent_for_geom(geom.geometries[j]);
			}
			*/
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
			el.setAttribute('onmouseover', 'sm_properties_mouseover("' + pid + '");');
			el.setAttribute('onmouseout', 'sm_properties_mouseout("' + pid + '");');
			el.setAttribute('onclick', 'sm_clipboard_copyto("' + pid + '");');

			el.setAttribute('class', data.geometry.type.toLowerCase());
			el.setAttribute('id', hex);
		}

	}

	var extent = [
		{lat: swlat, lon: swlon},
		{lat: nelat, lon: nelon}
	];

	extents[ uid ] = extent;
}