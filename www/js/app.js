/**
 * app.js Definición general del funcionamiento de la aplicación
 */

var app = angular.module('androidSensor', [ 'ionic', 'ngCordova', 'angularPaho' ]);

/**
 * Definimos las pantallas de la aplicación. Para cada pantalla, indicaremos al menos un id y una vista. Esta vista está definida en
 * app.html como contenedor principal. Además, indicaremos si la pantalla tiene o no un controlador. Cada controlador deberá estar
 * definido o bien en controladores.js o bien en cualquier otro JS incluído desde la pantalla principal. El controlador se
 * denominará "Ctrl<Pantalla>", siendo <Pantalla> el identificador de la pantalla. Cada identificador irá precedido por el prefijo
 * "app." indicando que cuelgan de la principal.
 */
var pantallas = [ {
  id : 'principal', // Pantalla principal
  vista : 'cuerpo',
  controlador : true
}, {
  id : 'config_mqtt', // Pantalla de configuración de MQTT
  vista : 'cuerpo',
  controlador : true
}, {
  id : 'sensores', // Pantalla de configuración de sensores
  vista : 'cuerpo',
  controlador : true
} ];

/**
 * Configuramos las rutas dinámicamente.
 */
app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $urlRouterProvider.otherwise('/principal');

  // Nos recorremos el array de pantallas para configurar las rutas
  for (var i = 0; i < pantallas.length; i++) {
    id = pantallas[i].id;
    abstracta = true;
    template = 'vistas/' + id + '.html';
    controlador = 'Ctrl' + id.substr(0, 1).toUpperCase() + id.substr(1);

    s = "$stateProvider.state('" + pantallas[i].id + "',{\n" + "  url: '" + (pantallas[i].url ? pantallas[i].url : "/" + id)
        + "',\n" + "  views: {" + "\n" + "    '" + pantallas[i].vista + "' : {" + "\n" + "      templateUrl: '" + template + "'";

    if (pantallas[i].controlador)
      s += ",\n      controller: '" + controlador.replace(".", "_") + "'";
    s += "\n    }\n  }\n});";
    eval(s);
  }

  $ionicConfigProvider.backButton.previousTitleText(true);

});

app.run(function($ionicPlatform, $rootScope, $ionicHistory) {
  $rootScope.mqtt = {};
  $rootScope.sensores = [];
  $rootScope.cargarMQTT = function() {
    if (typeof (window.NativeStorage) == "undefined") {
      console.log("Cargamos configuración de MQTT desde almacenamiento local");
      $rootScope.mqtt = angular.fromJson(localStorage.getItem("mqtt"));
      if ($rootScope.mqtt == null)
        $rootScope.mqtt = {
          servidor : '',
          puerto : ''
        };
    } else {
      console.log("Cargamos configuración de MQTT desde almacenamiento del sistema");
      $rootScope.mqtt = window.NativeStorage.getItem('mqtt', function(datos) {
        $rootScope.mqtt = datos;
        if ($rootScope.mqtt == null)
          $rootScope.mqtt = {
            servidor : '',
            puerto : ''
          };
        $rootScope.$apply();
      }, function(err) {
        $rootScope.mqtt = {
          servidor : '',
          puerto : ''
        };
      });
    }
  };

  $rootScope.cargarSensores = function() {
    if (typeof (window.NativeStorage) == "undefined") {
      console.log("Cargamos configuración de sensores desde almacenamiento local");
      $rootScope.sensores = angular.fromJson(localStorage.getItem("sensores"));
      if ($rootScope.sensores == null)
        $rootScope.sensores = [];
    } else {
      console.log("Cargamos configuración de sensores desde almacenamiento del sistema");
      $rootScope.sensores = window.NativeStorage.getItem('sensores', function(datos) {
        $rootScope.sensores = datos;
        if ($rootScope.sensores == null)
          $rootScope.sensores = [];
        $rootScope.$apply();
      }, function(err) {
        $rootScope.sensores = [];
      });
    }
  };

  $rootScope.cargarConfig = function() {
    $rootScope.cargarMQTT();
    $rootScope.cargarSensores();
  };

  $ionicPlatform.ready(function() {
    // Cargamos la configuración nada más arrancar
    $rootScope.cargarConfig();

    // Activamos el modo "background" para que la aplicación siga activa en segundo plano
    if (typeof (cordova.plugins.backgroundMode) != "undefined") {
      // Establecemos las propiedades de una notificación que permanecerá activa cuando estemos conectados con el Arduino
      console.log("Configurando el modo background");
      cordova.plugins.backgroundMode.setDefaults({
        title : "Android Sensor",
        text : "La aplicación se sigue ejecutando",
        icon : 'icon', // El mismo icono de la aplicación
        color : 'FFFFFF', // Color de fondo
        resume : true, // Indica que al pulsar la notificación, volvemos a la aplicación
        hidden : false, // Mostrará la notificación en la pantalla de bloqueo
        bigText : false
      })
      // cordova.plugins.backgroundMode.overrideBackButton(true);

      $ionicPlatform.registerBackButtonAction(function(e) {
        e.preventDefault();

        // ¿Hay alguna página a la que volver?
        if ($ionicHistory.backView()) {
          // Volvemos atrás
          console.log($ionicHistory.backView().stateName);
          $ionicHistory.backView().go();
        } else {
          // Es la última página: si está activo el modo background, nos vamos al segundo plano. En caso contrario, salimos
          if (typeof (cordova.plugins.backgroundMode) != "undefined") {
            console.log("Nos vamos a segundo plano");
            cordova.plugins.backgroundMode.moveToBackground();
          } else
            ionic.Platform.exitApp();
        }

        return false;
      }, 101);
      cordova.plugins.backgroundMode.enable();
    }
  });
});
