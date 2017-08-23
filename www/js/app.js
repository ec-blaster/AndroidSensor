/**
 * app.js Definición general del funcionamiento de la aplicación
 */

var app = angular.module('androidSensor', [ 'ionic', 'angularPaho' ]);

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
		.config(function($stateProvider, $urlRouterProvider,
				$ionicConfigProvider) {
			$urlRouterProvider.otherwise('/principal');

			// Nos recorremos el array de pantallas para configurar las rutas
			for (var i = 0; i < pantallas.length; i++) {
				id = pantallas[i].id;
				abstracta = true;
				template = 'vistas/' + id + '.html';
				controlador = 'Ctrl' + id.substr(0, 1).toUpperCase()
						+ id.substr(1);

				s = "$stateProvider.state('" + pantallas[i].id + "',{\n"
						+ "  url: '"
						+ (pantallas[i].url ? pantallas[i].url : "/" + id)
						+ "',\n" + "  views: {" + "\n" + "    '"
						+ pantallas[i].vista + "' : {" + "\n"
						+ "      templateUrl: '" + template + "'";

				if (pantallas[i].controlador)
					s += ",\n      controller: '"
							+ controlador.replace(".", "_") + "'";
				s += "\n    }\n  }\n});";
				eval(s);
			}

			$ionicConfigProvider.backButton.previousTitleText(true);

		});

app
		.run(function($ionicPlatform, $rootScope) {
			$rootScope.mqtt = {};
			$rootScope.sensores = [];
			$rootScope.cargarMQTT = function() {
				if (typeof (window.NativeStorage) == "undefined") {
					console
							.log("Cargamos configuración de MQTT desde almacenamiento local");
					$rootScope.mqtt = angular.fromJson(localStorage
							.getItem("mqtt"));
					if ($rootScope.mqtt == null)
						$rootScope.mqtt = {};
				} else {
					console
							.log("Cargamos configuración de MQTT desde almacenamiento del sistema");
					$rootScope.mqtt = window.NativeStorage.getItem('mqtt',
							function(datos) {
								$rootScope.mqtt = datos;
								if ($rootScope.mqtt == null)
									$rootScope.mqtt = {};
								$rootScope.$apply();
							}, function() {
								alert('Error al cargar configuración de MQTT');
							});
				}
			};

			$rootScope.cargarSensores = function() {
				if (typeof (window.NativeStorage) == "undefined") {
					console
							.log("Cargamos configuración de sensores desde almacenamiento local");
					$rootScope.sensores = angular.fromJson(localStorage
							.getItem("sensores"));
					if ($rootScope.sensores == null)
						$rootScope.sensores = [];
				} else {
					console
							.log("Cargamos configuración de sensores desde almacenamiento del sistema");
					$rootScope.sensores = window.NativeStorage.getItem(
							'sensores', function(datos) {
								$rootScope.sensores = datos;
								if ($rootScope.sensores == null)
									$rootScope.sensores = [];
								$rootScope.$apply();
							}, function(err) {
								$rootScope.sensores = [];
							});
				}
			};

			$rootScope.cargarConfig = function() {
				$rootScope.cargarMQTT();
				$rootScope.cargarSensores();
			};

			$ionicPlatform.ready(function() {

				/*
				 * window.NativeStorage.setItem('mqtt', "Kakita", function() {
				 * alert('Configuración guardada'); }, function() { alert('Error
				 * al guardar'); });
				 */
				$rootScope.cargarConfig();
			});
		});
