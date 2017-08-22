/**
 * Controlador de la pantalla principal
 */
app.controller("CtrlPrincipal", function($scope, $rootScope, $ionicPopover,
		MQTT) {
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

	$scope.iniciarDetener = function() {
		$scope.estado.servicio = !$scope.estado.servicio;
		if ($scope.estado.servicio) {
			MQTT.conectar($rootScope.mqtt.servidor, $rootScope.mqtt.puerto,
					$rootScope.mqtt.usuario, $rootScope.mqtt.password).then(
					function() {
						alert("Conectado");
					}, function() {
						alert("No conectado");
					})
		} else {
			$scope.estado.mqtt = false;
			$scope.estado.arduinoCon = false;
			$scope.estado.arduinoIni = false;
		}
	};
});