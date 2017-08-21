/**
 * Controlador de la configuración de sensores
 */
app.controller("CtrlSensores", function($scope, $ionicModal) {
	$scope.sensores = [];
	$scope.vDetalleSensor = null;
	$scope.tipos = tiposSensores;
	$scope.nuevo = false;

	$scope.cargarSensores = function() {
		$scope.sensores = [ {
			nombre : "Temperatura interior",
			tipo : 'dht11_temp',
			icono : 'ion-thermometer'
		}, {
			nombre : "Temperatura exterior",
			tipo : 'dht22_temp',
			icono : 'ion-thermometer'
		}, {
			nombre : "Humedad interior",
			tipo : 'dht11_hum',
			icono : 'ion-waterdrop'
		}, {
			nombre : "Humedad exterior",
			tipo : 'dht22_hum',
			icono : 'ion-waterdrop'
		} ];
	};

	$scope.nuevoSensor = function() {
		$scope.sensor = {};
		$scope.nuevo = true;
		$scope.abrirSensor();
	};

	$scope.modificarSensor = function(id) {
		$scope.sensor = $scope.sensores[id];
		$scope.nuevo = false;
		$scope.abrirSensor();
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
		if ($scope.nuevo) {
			$scope.sensores[$scope.sensores.length] = $scope.sensor;
		}
		$scope.vDetalleSensor.hide();
	};

	$scope.selTipoSensor = function() {
		var frm = document.forms['frmSensor'];
		var idx = frm.tipoSensor.selectedIndex;
		$scope.sensor.icono = $scope.tipos[idx].icono;
		// alert();
	};

	$scope.$on('$destroy', function() {
		$scope.vDetalleSensor.remove();
	});

	$scope.cargarSensores();
});