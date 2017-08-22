/**
 * Controlador de la configuración de sensores
 */
app.controller("CtrlConfig_mqtt", function($scope) {

	$scope.mqtt = {};

	$scope.cargarConfig = function() {

	};

	$scope.guardar = function() {

		if (typeof (window.NativeStorage) == "undefined") {
			console.log("Guardamos en almacenamiento local");
			localStorage.setItem("mqtt", angular.toJson($scope.mqtt));
		} else {
			console.log("Guardamos en almacenamiento del sistema");
			window.NativeStorage.setItem('mqtt', $scope.mqtt, function() {
				alert('Configuración guardada');
			}, function() {
				alert('Error al guardar');
			});
		}
	}

	$scope.volver = function() {
		window.history.back();
	};

	$scope.cargarConfig();
});