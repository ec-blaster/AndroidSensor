/**
 * Controlador de la pantalla principal
 */
app.controller("CtrlPrincipal", function($scope, $rootScope, $ionicPopover,
		$cordovaDevice, MqttClient) {
	$scope.estado = {
		mqtt : false,
		arduinoCon : false,
		arduinoIni : false,
		servicio : false
	};

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
		console.log("Conectando con el broker " + servidor + " con el usuario "
				+ usr);
		MqttClient.init(servidor, puerto, $scope.getIdDispositivo());
		MqttClient.connect({
			onSuccess : $scope.MQTTconectado,
			onFailure : function(err) {
				console.log("Error de conexión: " + err.errorMessage);
				$scope.estado.servicio = false;
				alert("Error de conexión: " + err.errorMessage);
			}
		});
	};

	// Hemos conectado con el servidor MQTT
	$scope.MQTTconectado = function() {
		console.log("Conectado con " + $rootScope.mqtt.servidor);
		var topico = "sion/pruebas";
		MqttClient.subscribe(topico);
		message = new Paho.MQTT.Message("Hola");
		message.destinationName = topico;
		MqttClient.send(message);
	};

	$scope.iniciarDetener = function() {
		$scope.estado.servicio = !$scope.estado.servicio;
		if ($scope.estado.servicio) {
			$scope.conectarMQTT($rootScope.mqtt.servidor,
					$rootScope.mqtt.puerto, $rootScope.mqtt.usuario,
					$rootScope.mqtt.password);
		} else {
			$scope.estado.mqtt = false;
			$scope.estado.arduinoCon = false;
			$scope.estado.arduinoIni = false;
		}
	};
});