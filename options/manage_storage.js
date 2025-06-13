async function saveOptionsStorage(datos){

	await chrome.storage.sync.set({
		otrasWebs: datos.otrasWebs,
		patrocinados: datos.patrocinados,
		webName: datos.webName,
		userName: datos.userName,
		mostrarBloqueoTema: datos.mostrarBloqueoTema,
		temas: datos.temas
	}).catch((err) => {
		console.error(err);
		console.log('Fallo al guardar los datos en storage sync.');
		throw err;
	});
}


async function loadOptionsStorage(){
	const datos = await chrome.storage.sync.get().catch((err) => {
		console.error(err);
		console.log('Fallo al obtener los datos de storage sync.');
		throw err;
	});
	
	return (datos);
}
