function eliminarVaciosTxtArea(idNombre){
	let txtArea = document.querySelector(idNombre);
	let arrayTxtArea = txtArea.value.split('\n');
	let arrayTemporal = [];

	arrayTxtArea.forEach(elemento => {
		if (elemento || elemento.trim()){
			arrayTemporal.push(elemento.trim());
		}
	});

	txtArea.value = arrayTemporal.join('\n');
}


async function saveOptions(e){
	e.preventDefault();

	eliminarVaciosTxtArea("#webName");
	eliminarVaciosTxtArea("#userName");

	await chrome.storage.sync.set({
		otrasWebs: document.querySelector("#otrasWebs").checked,
		patrocinados: document.querySelector("#patrocinados").checked,
		webName: document.querySelector("#webName").value,
		userName: document.querySelector("#userName").value
	});

	window.close();
}


async function loadOptions(){
	function setDatosOptions(datos) {
		document.querySelector("#otrasWebs").checked = datos.otrasWebs;
		document.querySelector("#patrocinados").checked = datos.patrocinados;
		document.querySelector("#webName").value = datos.webName || "";
		document.querySelector("#userName").value = datos.userName || "";
	}

	let datos = await chrome.storage.sync.get().catch((err) => {
		console.error(err);
		console.log('Fallo al obtener los datos de storage sync.');
		throw err;
	});	

	setDatosOptions(datos);
}


document.addEventListener("DOMContentLoaded", loadOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
