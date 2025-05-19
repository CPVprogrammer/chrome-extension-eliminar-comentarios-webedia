function modificarURL(web){
	try{
		web = new URL(web);
		web = web.host;
	}
	catch{}

	web = web.replace(/^www./, '')
		.toLowerCase();

	const index = web.indexOf("/");
	if (index !== -1){
		web = web.substring(0, index);
	}

	return web;
}


async function modificarWeb(){

	//obtener los datos del storage
	const datos = await chrome.storage.sync.get().catch((err) => {
		console.error(err);
		console.log('Fallo al obtener los datos de storage sync.');
		throw err;
	});

	if (Object.keys(datos).length === 0){
		return;
	}

	const otrasWebs = datos.otrasWebs;
	const patrocinados = datos.patrocinados;

	let nombresWebs = datos.webName.split("\n");
	let nombresUsuarios = datos.userName.split("\n");

	nombresWebs = nombresWebs.map(modificarURL);
	nombresUsuarios = nombresUsuarios.map(user => user.toLowerCase());

	//comprobar si es una web a tratar
	const currentLocation = window.location.href;

	if (nombresWebs.includes(modificarURL(currentLocation))){
		let pagina_principal = true;
		let lista_enlace_comentarios;
		let lista_borrar_comentarios = [];

		//comprobar si es la página principal o un artículo
		try{
			let ul_comentarios = document.getElementById("comments-list");
			lista_enlace_comentarios = ul_comentarios.querySelectorAll('a');
			pagina_principal = false;
		}
		catch{}

		if (pagina_principal){
			//buscar los articulos de otras webs
			if (otrasWebs){
				try{
					let articulos_externos = document.querySelectorAll("article.m-crosspost");
					articulos_externos.forEach(articulos_externos => {
						articulos_externos.remove();
					});
				}
				catch{}
			}

			//buscar los articulos patrocinados
			if (patrocinados){
				try{
					let articulos_patrocinados = document.querySelectorAll("article.m-article");
					articulos_patrocinados.forEach(articulos_patrocinados => {
						articulos_patrocinados.remove();
					});
				}
				catch{}
			}
		}

		// articulos
		else{
			lista_enlace_comentarios.forEach(lista_enlace_comentarios => {
				if (nombresUsuarios.includes(lista_enlace_comentarios.innerHTML.trim().toLowerCase())){
					lista_borrar_comentarios.push(lista_enlace_comentarios.closest("ul > li"));
				}
			});

			lista_borrar_comentarios.forEach(borrar => {
				borrar.remove();
			});
		}
	}
}

modificarWeb();
