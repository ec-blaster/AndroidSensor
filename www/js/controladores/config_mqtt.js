/**
 * Controlador de la configuración de sensores
 */
app.controller("CtrlConfig_mqtt", function($scope, $rootScope) {
	$scope.cargarConfig = function() {

	};

	$scope.guardar = function() {

		if (typeof (window.NativeStorage) == "undefined") {
			console.log("Guardamos en almacenamiento local");
			localStorage.setItem("mqtt", angular.toJson($rootScope.mqtt));
			window.history.back();
		} else {
			console.log("Guardamos en almacenamiento del sistema");
			window.NativeStorage.setItem('mqtt', $rootScope.mqtt, function() {
				window.history.back();
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