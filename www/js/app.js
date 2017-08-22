/**
 * app.js Definición general del funcionamiento de la aplicación
 */

var app = angular.module('androidSensor', [ 'ionic' ]);

/**
 * Definimos las pantallas de la aplicación. Para cada pantalla, indicaremos al
 * menos un id y una vista. Esta vista está definida en app.html como contenedor
 * principal. Además, indicaremos si la pantalla tiene o no un controlador. Cada
 * controlador deberá estar definido o bien en controladores.js o bien en
 * cualquier otro JS incluído desde la pantalla principal. El controlador se
 * denominará "Ctrl<Pantalla>", siendo <Pantalla> el identificador de la
 * pantalla. Cada identificador irá precedido por el prefijo "app." indicando
 * que cuelgan de la principal.
 */
var pantallas = [ /*
					 * { id : 'app' // Contenedor principal de la aplicación },
					 */{
	id : 'principal', // Pantalla principal
	vista : 'cuerpo',
	controlador : true
}, {
	id : 'config_mqtt', // Pantalla de configuración de MQTT
	vista : 'cuerpo',
	controlador : true
}, {
	id : 'sensores', // Pantalla de configuración de sensores
	vista : 'cuerpo',
	controlador : true
} ];

/**
 * Configuramos las rutas dinámicamente.
 */
app
		.config(function($stateProvider, $urlRouterProvider, $injector,
				$ionicConfigProvider) {
			$urlRouterProvider.otherwise('/principal');

			// console.log("Definiendo pantallas...");
			// Nos recorremos el array de pantallas para configurar las rutas
			for (var i = 0; i < pantallas.length; i++) {
				p = pantallas[i].id.indexOf('.');

				if (p != -1) {
					// Pantallas normales.
					subid = pantallas[i].id.substr(p + 1);
					abstracta = false;
					template = 'vistas/' + subid + '.html';
					controlador = 'Ctrl' + subid.substr(0, 1).toUpperCase()
							+ subid.substr(1);
				} else {
					// Pantalla abstracta. Normalmente vamos a tener sólo una en
					// cada
					// aplicación.
					// La utilizaremos como contenedor principal, en el que
					// tendremos un
					// menú lateral y un contenido principal.
					subid = pantallas[i].id;
					abstracta = true;
					template = 'vistas/' + subid + '.html';
					controlador = 'Ctrl' + subid.substr(0, 1).toUpperCase()
							+ subid.substr(1);
				}

				// console.log(template);

				/*
				 * if (abstracta) $stateProvider.state(pantallas[i].id, { url :
				 * '/' + subid, abstract : true, templateUrl : template,
				 * controller : controlador }); else {
				 */
				s = "$stateProvider.state('" + pantallas[i].id + "',{\n"
						+ "  url: '"
						+ (pantallas[i].url ? pantallas[i].url : "/" + subid)
						+ "',\n" + "  views: {" + "\n" + "    '"
						+ pantallas[i].vista + "' : {" + "\n"
						+ "      templateUrl: '" + template + "'";

				if (pantallas[i].controlador)
					s += ",\n      controller: '"
							+ controlador.replace(".", "_") + "'";
				s += "\n    }\n  }\n});";
				// console.log(s);
				eval(s);
				/* } */
			}

			$ionicConfigProvider.backButton.previousTitleText(true);

		});

app.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {

		navigator.NativeStorage.setItem('mqtt', "Kakita", function() {
			alert('Configuración guardada');
		}, function() {
			alert('Error al guardar');
		});
	});
});
