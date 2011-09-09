function sm_clipboard_copyto(pid){

	var parts = pid.split("#");
	var uid = parts[0];
	var idx = parts[1];

	if (! properties[uid]){
		return;
	}

	var data = properties[uid][idx];

	if (! data){
		alert("This feature has no properties!");
		return;
	}

	var list = sm_properties_endomify(data);

	var clipboard = document.getElementById("clipboard");

	var clipbody = document.getElementById("clipbody");
	clipbody.innerHTML = '';

	var header = document.createElement('h3');
	header.appendChild(document.createTextNode(uid + ', item #' + (Number(idx) + 1)));

	clipbody.appendChild(header);
	clipbody.appendChild(list);
	clipboard.style.display = 'block';
}

function sm_clipboard_close(){
	var clipboard = document.getElementById("clipboard");
	var clipbody = document.getElementById("clipbody");
	clipbody.innerHTML = '';
	clipboard.style.display = 'none';
	sm_properties_hide();
}