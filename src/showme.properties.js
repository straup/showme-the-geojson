function sm_properties_endomify(data){

	var list = document.createElement('ul');

	if (data){
		for (var key in data){
			var value = data[key];
			var item = document.createElement('li');
			var txt = document.createTextNode(key + ' : ' + value);

			item.appendChild(txt);
			list.appendChild(item);
		}
	}

	return list;
}

function sm_properties_mouseover(pid){
	return sm_properties_show(pid);
}

function sm_properties_mouseout(pid){

	var parts = pid.split("#");
	var uid = parts[0];
	var idx = parts[1];

	if (! properties[uid]){
		return;
	}

	var data = properties[uid][idx];

	if (data){
		return;
	}

	sm_properties_hide();
}

function sm_properties_show(pid){

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

	var list = sm_properties_endomify(data);

	if (! list.children.length){

		var note = document.createElement('li');
		note.setAttribute("class", "sm_caveat");
		var txt = document.createTextNode('this feature has no extra properties');

		note.appendChild(txt);
		list.appendChild(note);
	}

	else {

		var control = document.createElement('li');
		var link = document.createElement('a');
		link.setAttribute("class", "sm_close");
		var txt = document.createTextNode("hide these properties");

		link.appendChild(txt);
		link.setAttribute('onclick', 'sm_properties_hide();');
		control.appendChild(link);
		list.insertBefore(control, list.firstChild);
	}

	props.appendChild(list);
	props.style.display = 'block';
}

function sm_properties_hide(){
	var props = document.getElementById("properties");
	props.innerHTML = '';
	props.style.display = 'none';
}