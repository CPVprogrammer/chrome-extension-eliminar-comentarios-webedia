function eliminarVaciosTxtArea(idNombre){
	let txtArea = document.querySelector(idNombre);
	let arrayTxtArea = txtArea.value.split('\n');
	let arrayTemporal = [];

	arrayTxtArea.forEach(elemento => {
		if (elemento || elemento.trim()){
			arrayTemporal.push(elemento.trim());
		}
	});

	return (arrayTemporal);
}


async function saveOptions(e){
	e.preventDefault();

	let datos={};
	datos.otrasWebs = document.querySelector("#otrasWebs").checked;
	datos.patrocinados = document.querySelector("#patrocinados").checked;
	datos.webName = eliminarVaciosTxtArea("#webName");
	datos.userName = eliminarVaciosTxtArea("#userName");
	datos.mostrarBloqueoTema = document.querySelector("#mostrarBloqueoTema").checked;
	datos.temas = eliminarVaciosTxtArea("#temas");
	
	await saveOptionsStorage(datos);

	window.close();
}


async function loadOptions(){
	function setDatosOptions(datos) {
		document.querySelector("#otrasWebs").checked = datos.otrasWebs;
		document.querySelector("#patrocinados").checked = datos.patrocinados;
		document.querySelector("#webName").value = datos.webName?.join('\n') || "";
		document.querySelector("#userName").value = datos.userName?.join('\n') || "";
		document.querySelector("#mostrarBloqueoTema").checked = datos.mostrarBloqueoTema;
		document.querySelector("#temas").value = datos.temas?.join('\n') || "";
	}

	const datos = await loadOptionsStorage();

	setDatosOptions(datos);
}

document.addEventListener("DOMContentLoaded", loadOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
