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


function botonBloqueoUsuario(datos, currentLocation, nombresWebs, nombresUsuarios, bloquearUsuario, posicion){
	img_symbol_usuario = document.createElement("img");
	img_symbol_usuario.src = chrome.runtime.getURL("images/user-cancel-128.png");
	img_symbol_usuario.title = "Eliminar comentarios de este usuario";
	img_symbol_usuario.alt = "Bloquear usuario";
	img_symbol_usuario.style.cssText = "margin-left: 5px; width: 2.1em; cursor: pointer;";

	posicion[0].appendChild(img_symbol_usuario);

	img_symbol_usuario.addEventListener("click", (event) => {
		const currentTarget = event.currentTarget;
		const [nombreApodo, nombreReal] = bloquearUsuario.split("|");

		if (confirm(`¿bloquear al usuario: ${nombreApodo} (${nombreReal}) en: ${currentLocation}?`) == true){

			//comprobar si está la web
			if (!nombresWebs.includes(currentLocation)){
				nombresWebs.push(currentLocation);
				datos.webName = nombresWebs;
			}

			//comprobar si está el usuario
			if (!nombresUsuarios.includes(bloquearUsuario)){
				nombresUsuarios.push(bloquearUsuario);
				datos.userName = nombresUsuarios;
			}

			saveOptionsStorage(datos);
			window.location.reload();
		} 
	});
}


function botonBloqueoTema(datos, todosTemas, currentLocation){

	document.querySelectorAll("article > div > header > a").forEach(insertar_img => {
		img_prohibido = document.createElement("img");
		img_prohibido.src = chrome.runtime.getURL("images/prohibido.png");
		img_prohibido.title ="Eliminar este tema de la página principal";
		img_prohibido.alt = "Eliminar tema";
		img_prohibido.style.cssText = "float: left; margin-right: 5px; width: 1.3em; cursor: pointer;";
		insertar_img.insertAdjacentElement("beforebegin", img_prohibido);
		
		img_prohibido.addEventListener("click", (event) => {
			const currentTarget = event.currentTarget;
			const tema = currentTarget.nextElementSibling.innerHTML.trim().toLowerCase();
			
			if (confirm(`¿bloquear el tema: ${tema} en: ${currentLocation}?`) == true){
				todosTemas.push(currentLocation +"|"+ tema);
				datos.temas = todosTemas;

				saveOptionsStorage(datos);
				window.location.reload();
			} 
		});
	});
}


function eliminarTemas(todosTemas, currentLocation){
	//comprobar si es un tema a tratar
	let datosTemas = [];

	todosTemas.forEach((secciones) => {
		separados = secciones.split("|");
		datosTemas.push({web: separados[0], seccion: separados[1]});
	});
	
	const tratarTemas = datosTemas.filter((datos) => datos.web === currentLocation);

	if (tratarTemas.length > 0){
		let a_tema = document.querySelectorAll("article.abstract-article > div > header > a");

		tratarTemas.forEach((tema) => {
			try{
				a_tema.forEach((a_tema) => {
					if (tema.seccion.trim().toLowerCase() === a_tema.innerHTML.trim().toLowerCase()){
						closest = a_tema.closest("article");
						closest.remove();
					}
				});
			}
			catch{}
		});
	}
}


async function modificarWeb(){
	//obtener los datos del storage
	datos = await loadOptionsStorage();

	if (Object.keys(datos).length === 0){
		return;
	}

	const otrasWebs = datos.otrasWebs;
	const patrocinados = datos.patrocinados;
	const mostrarBloqueoTema = datos.mostrarBloqueoTema;

	let nombresWebs = [];
	let nombresUsuarios = [];
	let todosTemas = [];

	if (datos.webName){
		nombresWebs = datos.webName;
		nombresWebs = nombresWebs.map(modificarURL);
	}
	
	if (datos.userName){
		nombresUsuarios = datos.userName;
		nombresUsuarios = nombresUsuarios.map(user => user.toLowerCase());
	}

	if (datos.temas){
		todosTemas = datos.temas;
	}

	//comprobar si es una web a tratar
	const currentLocation = modificarURL(window.location.href);

	let pagina_principal = true;
	let lista_enlace_comentarios;
	let lista_respuestas_comentarios;

	//comprobar si es la página principal o un artículo
	try{
		let ul_comentarios = document.getElementById("comments-list");
		lista_enlace_comentarios = ul_comentarios.querySelectorAll('p.comment-author-name > a[href^="#usuario/"]');
		lista_respuestas_comentarios = ul_comentarios.querySelectorAll('li > div.comment-reply-relation > a');
		pagina_principal = false;
	}
	catch{}


	//poner imágenes en principal o artículos
	if (pagina_principal){

		//mostrar el botón de bloquear un tema
		if (mostrarBloqueoTema){
			botonBloqueoTema(datos, todosTemas, currentLocation);
		}
		
		//eliminar temas
		eliminarTemas(todosTemas, currentLocation);
	}

	//artículos
	else{
		//poner el botón de bloquear usuario
		lista_enlace_comentarios.forEach(lista_enlace_comentarios_href => {
			const nombreReal = lista_enlace_comentarios_href.getAttribute("href").replace("#usuario/", "")
			const nombreApodo = lista_enlace_comentarios_href.innerHTML.trim().toLowerCase();
			const bloquearUsuario = `${nombreApodo}|${nombreReal}`;
			const posicion = lista_enlace_comentarios_href.closest("ul > li").querySelectorAll("div.comment-actions > ul > li.comment-actions-abuse");
			
			botonBloqueoUsuario(datos, currentLocation, nombresWebs, nombresUsuarios, bloquearUsuario, posicion);
		});
	}
	

	//tratar webs
	if (nombresWebs.includes(currentLocation)){
		if (pagina_principal){

			//buscar los artículos de otras webs
			if (otrasWebs){
				try{
					let articulos_externos = document.querySelectorAll("article.m-crosspost");
					articulos_externos.forEach(articulos_externos => {
						articulos_externos.remove();
					});
				}
				catch{}
			}

			//buscar los artículos patrocinados
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

		//artículos
		else{
			lista_enlace_comentarios.forEach(lista_enlace_comentarios_href => {
				const nombreReal = lista_enlace_comentarios_href.getAttribute("href").replace("#usuario/", "")
				const nombreApodo = lista_enlace_comentarios_href.innerHTML.trim().toLowerCase();
				const nombreUsuario = `${nombreApodo}|${nombreReal}`;

				if (nombresUsuarios.some(usuario => {
					const [apodo, real] = usuario.split("|");
					return real === nombreReal || apodo === nombreApodo;
				})) {
					lista_enlace_comentarios_href.closest("ul > li")?.remove();
				}
			});
			
			lista_respuestas_comentarios.forEach(lista_enlace_comentarios_href => {
				const nombreReal = lista_enlace_comentarios_href.getAttribute("href").replace("#usuario/", "")
				const nombreApodo = lista_enlace_comentarios_href.innerHTML.trim().toLowerCase();
				const nombreUsuario = `${nombreApodo}|${nombreReal}`;

				if (nombresUsuarios.some(usuario => {
					const [apodo, real] = usuario.split("|");
					return real === nombreReal || apodo === nombreApodo;
				})) {
					lista_enlace_comentarios_href.closest("ul > li")?.remove();
				}
			});
		}
	}
}

modificarWeb();
