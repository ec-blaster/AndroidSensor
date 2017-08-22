/**
 * Controlador de la configuración de sensores
 */
app.controller("CtrlSensores", function($scope, $rootScope, $ionicModal) {
	$scope.vDetalleSensor = null;
	$scope.tipos = tiposSensores;
	$scope.nuevo = false;

	/*
	 * $scope.cargarSensores = function() { $rootScope.sensores = [ { nombre :
	 * "Temperatura interior", tipo : 'dht11_temp', gpio : 1, icono :
	 * 'ion-thermometer', periodicidad : 5 }, { nombre : "Temperatura exterior",
	 * tipo : 'dht22_temp', gpio : 2, icono : 'ion-thermometer', periodicidad :
	 * 5 }, { nombre : "Humedad interior", tipo : 'dht11_hum', gpio : 3, icono :
	 * 'ion-waterdrop', periodicidad : 10 }, { nombre : "Humedad exterior", tipo :
	 * 'dht22_hum', gpio : 4, icono : 'ion-waterdrop', periodicidad : 10 } ]; };
	 */

	$scope.nuevoSensor = function() {
		$scope.sensor = {};
		$scope.nuevo = true;
		$scope.abrirSensor();
	};

	$scope.modificarSensor = function(id) {
		$scope.sensor = $rootScope.sensores[id];
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
			$rootScope.sensores[$rootScope.sensores.length] = $scope.sensor;
		}
		$scope.vDetalleSensor.hide();
	};

	$scope.selTipoSensor = function() {
		var frm = document.forms['frmSensor'];
		var idx = frm.tipoSensor.selectedIndex;
		$scope.sensor.icono = $scope.tipos[idx].icono;
	};

	$scope.$on('$destroy', function() {
		$scope.vDetalleSensor.remove();
	});

	$scope.guardar = function() {
		if (typeof (window.NativeStorage) == "undefined") {
			console.log("Guardamos sensores en almacenamiento local");
			localStorage.setItem("sensores", angular
					.toJson($rootScope.sensores));
			window.history.back();
		} else {
			console.log("Guardamos sensores en almacenamiento del sistema");
			window.NativeStorage.setItem('sensores', $rootScope.sensores,
					function() {
						window.history.back();
					}, function() {
						alert('Error al guardar');
					});
		}
	}

	$scope.volver = function() {
		window.history.back();
	};

	// $scope.cargarSensores();
});