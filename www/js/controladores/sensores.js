/**
 * Controlador de la configuración de sensores
 */
app.controller("CtrlSensores", function($scope, $rootScope, $ionicModal, $ionicPopup) {
  $scope.vDetalleSensor = null;
  $scope.tipos = tiposSensores;
  $scope.nuevo = false;
  $scope.usaGpio = true;

  // Abre la ventana de detalles del sensor para un sensor nuevo
  $scope.nuevoSensor = function() {
    $scope.sensor = {};
    $scope.nuevo = true;
    $scope.abrirSensor();
  };

  // Abre la ventana de detalles del sensor para modificar un sensor que ya existe
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

  // Abre la ventana de detalles
  $scope.abrirSensor = function() {
    $scope.vDetalleSensor.show();
  };

  // Cierra la ventana de detalles, guardando los datos del sensor
  $scope.cerrarSensor = function() {
    $scope.selTipoSensor();
    if ($scope.nuevo && $scope.sensor.nombre && $scope.sensor.tipo) {
      $scope.sensor.activo = true;
      $rootScope.sensores[$rootScope.sensores.length] = $scope.sensor;
    }
    $scope.vDetalleSensor.hide();
  };

  // Este método se invoca al cambiar el tipo de sensor en el desplegable
  $scope.selTipoSensor = function() {
    var frm = document.forms['frmSensor'];
    var idx = frm.tipoSensor.selectedIndex;
    $scope.sensor.icono = $scope.tipos[idx].icono;
    $scope.sensor.tipo = frm.tipoSensor.value;
    $scope.usaGpio = $scope.tipos[idx].gpio;
    if (!$scope.usaGpio)
      $scope.sensor.gpio = -1;
  };

  $scope.$on('$destroy', function() {
    $scope.vDetalleSensor.remove();
  });

  /**
   * Guardamos los cambios, verificando previamente la integridad de los datos
   */
  $scope.guardar = function() {
    var ok = true;
    for (var i = 0; i < $rootScope.sensores.length; i++) {
      var sensor = $rootScope.sensores[i];
      var esteOk = false;
      if (sensor.nombre) {
        if (sensor.tipo) {
          if (sensor.gpio != null) {
            if (sensor.topico) {
              if (sensor.periodicidad) {
                esteOk = true;
              } else
                $scope.errorGuardado(i, 'período de lectura');
            } else
              $scope.errorGuardado(i, 'tópico MQTT');
          } else
            $scope.errorGuardado(i, 'puerto GPIO');
        } else
          $scope.errorGuardado(i, 'nombre');
      } else
        $scope.errorGuardado(i, 'tipo');
      ok = ok && esteOk;
    }

    if (ok) {
      if (typeof (window.NativeStorage) == "undefined") {
        console.log("Guardamos sensores en almacenamiento local");
        localStorage.setItem("sensores", angular.toJson($rootScope.sensores));
        window.history.back();
      } else {
        console.log("Guardamos sensores en almacenamiento del sistema");
        window.NativeStorage.setItem('sensores', $rootScope.sensores, function() {
          window.history.back();
        }, function() {
          alert('Error al guardar');
        });
      }
    }
  }

  $scope.errorGuardado = function(sensor, campo) {
    var obj = $rootScope.sensores[sensor];
    var nomSensor = (1 + sensor);
    if (obj.nombre)
      nomSensor = obj.nombre;
    $ionicPopup.alert({
      title : 'Error de definición',
      template : 'El sensor ' + nomSensor + ' no tiene definido el ' + campo,
      cssClass : 'error'
    });
  };

  $scope.volver = function() {
    window.history.back();
  };
});