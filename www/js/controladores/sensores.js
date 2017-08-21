/**
 * Controlador de la configuración de sensores
 */
app.controller("CtrlSensores", function($scope, $ionicModal) {
	$scope.sensores = [];
	$scope.vDetalleSensor = null;
	$scope.tipos = tiposSensores;

	$scope.cargarSensores = function() {
		$scope.sensores = [ {
			id : 'temp1',
			nombre : "Temperatura interior",
			icono : 'ion-thermometer'
		}, {
			id : 'temp2',
			nombre : "Temperatura exterior",
			icono : 'ion-thermometer'
		}, {
			id : 'hum1',
			nombre : "Humedad interior",
			icono : 'ion-waterdrop'
		}, {
			id : 'hum2',
			nombre : "Humedad exterior",
			icono : 'ion-waterdrop'
		} ];
	};

	$scope.nuevoSensor = function() {
		$scope.abrirSensor();
	};

	$scope.modificarSensor = function(id) {
		$scope.abrirSensor(id);
	};

	// Ventana modal de detalles del sensor
	$ionicModal.fromTemplateUrl('vistas/detalleSensor.html', {
		scope : $scope,
		animation : 'slide-in-up'
	}).then(function(modal) {
		$scope.vDetalleSensor = modal;
	});

	$scope.abrirSensor = function() {
		$scope.vDetalleSensor.show();
	};

	$scope.cerrarSensor = function() {
		$scope.vDetalleSensor.hide();
	};

	$scope.$on('$destroy', function() {
		$scope.vDetalleSensor.remove();
	});

	$scope.cargarSensores();
});