function sm_documents_list(){

	var docs = document.getElementById("documents");
	docs.innerHTML = '';

	var list = document.createElement('ul');

	for (var uid in documents){

		var doc = document.createElement('li');
		var name = document.createElement('a');
		var txt = document.createTextNode(uid);
		name.appendChild(txt);
		name.setAttribute('onclick', 'sm_extents_jumpto("' + uid + '");');

		var del = document.createElement('a');
		del.setAttribute("class", "sm_close");

		var txt = document.createTextNode(" remove this document");
		del.appendChild(txt);
		del.setAttribute('onclick', 'sm_documents_remove("' + uid + '");');

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
		link.setAttribute('onclick', 'sm_extents_jumpto();');
		control.appendChild(link);
		list.appendChild(control);
	}

	var header = document.createElement('h2');
	header.appendChild(document.createTextNode('Documents'));

	docs.appendChild(header);
	docs.appendChild(list);
}

function sm_documents_remove(uid){

	if (! documents[uid]){
		return;
	}

	map.remove(documents[uid]);

	delete documents[uid];
	delete extents[uid];

	sm_extents_set();
	sm_documents_list();
}
