function sm_properties_endomify(data){

	var list = document.createElement('ul');
	list.setAttribute('class', 'sm_properties');

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
		note.setAttribute("class", "sm_caveat");
		var txt = document.createTextNode('this feature has no extra properties');

		note.appendChild(txt);
		list.appendChild(note);
	}

	return list;
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

    console.log(pid);
    console.log(uid);
    console.log(properties);
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

	var control = document.createElement('li');
	var link = document.createElement('a');
	link.setAttribute("class", "sm_close");
	var txt = document.createTextNode("hide these properties");

	link.appendChild(txt);
	link.setAttribute('onclick', 'sm_properties_hide();');
	control.appendChild(link);
	list.insertBefore(control, list.firstChild);

	// TO DO: if there are no children then auto-close on mouseout

	props.appendChild(list);
	props.style.display = 'block';
}

function sm_properties_hide(){
	var props = document.getElementById("properties");
	props.innerHTML = '';
	props.style.display = 'none';
}