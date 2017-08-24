/**
 * Controlador de la pantalla principal
 */
app.controller("CtrlPrincipal", function($scope, $rootScope, $ionicPopover,
		$ionicPopup, $cordovaDevice, MqttClient) {
	$scope.estado = {
		mqtt : false,
		arduinoCon : false,
		arduinoIni : false,
		servicio : false
	};

	$scope.conectando = false;

	// Definimos un menú popover:
	$ionicPopover.fromTemplateUrl('vistas/menu.html', {
		scope : $scope
	}).then(function(popover) {
		$scope.menu = popover;
	});

	// Abrir el menú
	$scope.mostrarMenu = function($event) {
		$scope.menu.show($event);
	};

	// Cerrar el menú
	$scope.cerrarMenu = function() {
		$scope.menu.hide();
	};

	// Destruir el menú
	$scope.$on('$destroy', function() {
		$scope.menu.remove();
	});

	// Obtenemos un ID único del dispositivo
	$scope.getIdDispositivo = function() {
		var id = "";
		if (window.device)
			id = $cordovaDevice.getUUID();
		else
			id = CryptoJS.MD5(window.navigator.userAgent).toString(
					CryptoJS.enc.Hex);

		return 'android_' + id;
	};

	// Conectamos con el servidor
	$scope.conectarMQTT = function(servidor, puerto, usr, pwd) {
		$scope.conectando = true;
		console.log("Conectando con el broker " + servidor + " con el usuario "
				+ usr);
		MqttClient.init(servidor, puerto, $scope.getIdDispositivo());
		MqttClient.connect({
			onSuccess : $scope.MQTTconectado,
			onFailure : function(err) {
				console.log("Error de conexión: " + err.errorMessage);
				$scope.estado.servicio = false;
				$scope.inicializarMarcadores();
				$ionicPopup.alert({
					title : 'Error de conexión MQTT',
					template : err.errorMessage
				});
			}
		});
	};

	// Hemos conectado con el servidor MQTT
	$scope.MQTTconectado = function() {
		$scope.conectando = false;
		console.log("Conectado con " + $rootScope.mqtt.servidor);
		$scope.estado.mqtt = true;
		$scope.$apply();

		var topico = "sion/pruebas";
		MqttClient.subscribe(topico);
		message = new Paho.MQTT.Message("Hola");
		message.destinationName = topico;
		MqttClient.send(message);

		$scope.conectarSerie();
	};

	// Nos conectamos al puerto serie del arduino (USB OTG)
	$scope.conectarSerie = function() {
		if (typeof (window.serial) != "undefined") {
			// Pedimos permiso para conectarnos al puerto serie
			console.log('Solicitando permiso para USB...');
			window.serial.requestPermission(function() {
				// Hemos obtenido permiso
				console.log('Permiso concedido');
				var opc = {
					baudRate : 9600,
					sleepOnPause : true
				// Mantenemos el puerto abierto cuando la app pasa a 2º plano
				};

				// Nos conectamos
				console.log('Abriendo puerto serie...');
				window.serial.open(opc, function() {
					console.log('Puerto abierto');
					window.serial.close(function() {
						console.log('Puerto cerrado');
					}, $scope.errorSerie);
				}, $scope.errorSerie);
			}, $scope.errorSerie);
		} else
			$scope.errorSerie("Dispositivo serie no disponible");

	};

	$scope.errorSerie = function(err) {
		console.log(err);
		$ionicPopup.alert({
			title : 'Error de conexión USB',
			template : err
		});
	};

	$scope.inicializarMarcadores = function() {
		$scope.estado.mqtt = false;
		$scope.estado.arduinoCon = false;
		$scope.estado.arduinoIni = false;
		$scope.conectando = false;
	};

	$scope.iniciarDetener = function() {
		$scope.estado.servicio = !$scope.estado.servicio;
		if ($scope.estado.servicio) {
			$scope.conectarSerie();
			/*
			 * $scope.conectarMQTT($rootScope.mqtt.servidor,
			 * $rootScope.mqtt.puerto, $rootScope.mqtt.usuario,
			 * $rootScope.mqtt.password);
			 */
		} else {
			$scope.inicializarMarcadores();
			MqttClient.disconnect();
		}
	};
});