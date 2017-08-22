/**
 * Controlador de la configuración de sensores
 */
app.controller("CtrlConfig_mqtt", function($scope) {

	$scope.mqtt = {};

	$scope.cargarConfig = function() {

	};

	$scope.guardar = function() {
		console.log("Guardamos en almacenamiento local");

		navigator.NativeStorage.setItem('mqtt', $scope.mqtt, function() {
			alert('Configuración guardada');
		}, function() {
			alert('Error al guardar');
		});
	}

	$scope.volver = function() {
		window.history.back();
	};

	$scope.cargarConfig();
});