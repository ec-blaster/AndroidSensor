/**
 * Controlador del menú
 */
app.controller("CtrlApp", function($scope, $rootScope, $ionicSideMenuDelegate,
		$state) {

	$scope.menu = [];
	$scope.cargarMenu = function() {

		/**
		 * Los distintos atributos que pueden tener las opciones de menú son las
		 * siguientes:
		 * <ul>
		 * <li>texto: Texto de la opción</li>
		 * <li>icono: Icono de la opción (o en blanco)</li>
		 * <li>tipo: Puede ser "principal" si es una opción normal, "categoria"
		 * o "departamento"</li>
		 * <li>categoria: Si el tipo es "categoria", aquí va el código de la
		 * categoría asociada a la opción para realizar el filtro</li>
		 * <li>departamento: Si el tipo es "departamento", aquí va el código
		 * del departamento asociado a la opción para realizar el filtro</li>
		 * <li>inicial: Indica si la opción se muestra inicialmente</li>
		 * <li>seleccionable: Indica si el usuario puede marcar o desmarcar la
		 * opción</li>
		 * <li>desplegable: Indica si la opción tiene hijas</li>
		 * <li>desplegado: Indica si está o no desplegada la opción</li>
		 * <li>padre: Orden del padre de esta opción, ó -1 si no tiene</li>
		 * </ul>
		 */
		$scope.menu = [ {
			texto : 'Inicio',
			icono : 'ion-home',
			tipo : 'principal',
			inicial : true
		}, {
			texto : 'Búsqueda avanzada',
			icono : 'ion-search',
			tipo : 'principal',
			inicial : true
		}, {
			texto : 'Categorías',
			icono : 'ion-pricetag',
			tipo : 'principal',
			inicial : true
		} ];
		$scope.orden = 3;
		/**
		 * Lanzamos una petición al API para obtener la lista de categorías de
		 * los anuncios
		 */
		// ApiTablon.categorias().then($scope.cargarCategorias);
	}
	$scope.cargarMenu();
});