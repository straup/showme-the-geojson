function sm_form_handler(){

	var uri = document.getElementById("load_uri");
	var file = document.getElementById("load_file");

	if (uri.value){

		if (uri.value.indexOf("http://") == 0){
			sm_load_uri(uri.value);
			uri.value = '';
		}

		else {
			alert("Invalid URL!");
		}
	}

	if (file.files.length){
		sm_load_files(file.files);
		file.value = '';
	}
}

function sm_form_toggle(close){

	var h = document.getElementById("load_header");
	h.style.display = (close) ? 'block' : 'none';

	var f = document.getElementById("load_form");
	f.style.display = (close) ? 'none' : 'block';
}