/**
 * Controlador de la pantalla principal
 */
app.controller("CtrlPrincipal", function($scope, $ionicPopover) {
	$scope.estado = {
		mqtt : true,
		arduinoCon : true,
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
	};
});