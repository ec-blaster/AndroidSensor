/**
 * Controlador de la pantalla principal
 */
app.controller("CtrlPrincipal", function($scope, $rootScope, $ionicPopover, $ionicPopup, $cordovaDevice, MqttClient) {
  $scope.estado = {
    mqtt : false,
    arduinoCon : false,
    arduinoIni : false,
    servicio : false
  };

  $scope.strRecibida = '';

  $scope.conectando = false;
  $scope.conectandoMQTT = false;

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

  // Obtenemos un ID único del dispositivo
  $scope.getIdDispositivo = function() {
    var id = "";
    if (window.device)
      id = $cordovaDevice.getUUID();
    else
      id = CryptoJS.MD5(window.navigator.userAgent).toString(CryptoJS.enc.Hex);

    return 'android_' + id;
  };

  /**
   * MÉTODOS RELATIVOS A MQTT
   */
  /**
   * Conectamos con el broker MQTT
   */
  $scope.conectarMQTT = function(servidor, puerto, usr, pwd) {
    console.log("Conectando con el broker " + servidor + " con el usuario " + usr);
    MqttClient.init(servidor, puerto, $scope.getIdDispositivo());
    $scope.conectandoMQTT = true;
    MqttClient.connect({
      timeout : 5,
      onSuccess : $scope.MQTTconectado,
      onFailure : function(err) {
        console.log("Error de conexión: " + err.errorMessage);
        $scope.desconectarTodo();
        $ionicPopup.alert({
          title : 'Error de conexión MQTT',
          template : err.errorMessage
        });
      }
    });
  };

  /**
   * Conexión exitosa con el broker
   */
  $scope.MQTTconectado = function() {
    console.log("Conectado con " + $rootScope.mqtt.servidor);
    $scope.conectandoMQTT = false;
    $scope.estado.mqtt = true;
    $scope.$apply();

    /*
     * var topico = "sion/pruebas"; MqttClient.subscribe(topico); message = new Paho.MQTT.Message("Hola"); message.destinationName =
     * topico; MqttClient.send(message);
     */

    $scope.conectarSerie();
  };
  /**
   * FIN MQTT
   */

  /**
   * MÉTODOS RELATIVOS AL PUERTO SERIE (USB)
   */
  /**
   * Nos conectamos al puerto serie del arduino (USB OTG)
   */
  $scope.conectarSerie = function() {
    if (typeof (window.serial) != "undefined") {
      // Pedimos permiso para conectarnos al puerto serie
      console.log('Solicitando permiso para USB...');
      window.serial.requestPermission(function() {
        // Hemos obtenido permiso
        console.log('Permiso concedido');
        var opc = {
          baudRate : 9600,
          sleepOnPause : true
        // Mantenemos el puerto abierto cuando la app pasa a 2º plano
        };

        // Nos conectamos
        console.log('Abriendo puerto serie...');
        window.serial.open(opc, function() {
          console.log('Puerto abierto');
          $scope.estado.arduinoCon = true;
          $scope.$apply();

          // Registramos un callback para la recepción de datos desde el Arduino:
          window.serial.registerReadCallback(function(data) {
            var view = new Uint8Array(data);
            if (view.length >= 1) {
              for (var i = 0; i < view.length; i++) {
                if (view[i] == 10) {
                  $scope.procesarComando($scope.strRecibida);
                  $scope.strRecibida = '';
                } else if (view[i] != 13) {
                  var temp_str = String.fromCharCode(view[i]);
                  var str_esc = escape(temp_str);
                  $scope.strRecibida += unescape(str_esc);
                }
              }
            }
          }, function() {
            errorSerie("Error al registrar lecturas");
          });

          // Mandamos al Arduino que se inicialice, por si ya estaba conectado desde antes
          $scope.enviarComandoArduino(CMD_RESET);
        }, $scope.errorSerie);
      }, $scope.errorSerie);
    } else
      $scope.errorSerie("Dispositivo serie no disponible");

  };

  /**
   * Este método procesa un comando proviniente del Arduino
   */
  $scope.procesarComando = function(cadena) {
    comando = "";
    parametros = "";

    var sep = cadena.indexOf(' ');
    if (sep != -1) {
      comando = cadena.substring(0, sep);
      parametros = cadena.substring(1 + sep);
    } else
      comando = cadena;

    if (comando.startsWith("AS_")) {
      console.log("<= COMANDO: " + comando);
      console.log("<= PARAMETROS: " + parametros);

      if (comando == CMD_INITREQ) {
        // Arduino nos pide inicialización
        $scope.inicializacionArduino();
      } else if (comando == CMD_INITOK) {
        // Arduino nos notifica que todo está inicializado
        $scope.arduinoInicializado();
      } else if (comando == CMD_ERROR)
        $scope.errorSerie("Error de Arduino: " + parametros);
    } else
      console.log(cadena);
  };

  /**
   * Método par enviar comandos al Arduino
   */
  $scope.enviarComandoArduino = function(comando, parametros) {
    console.log("=> COMANDO: " + comando);
    console.log("=> PARAMETROS: " + parametros);
    if (typeof (parametros) == "undefined")
      window.serial.write(comando);
    else
      window.serial.write(comando + " " + parametros);
  };

  /**
   * Manda una inicialización al Arduino indicándole la disposición de los sensores
   */
  $scope.inicializacionArduino = function() {
    console.log('Enviamos la inicialización al Arduino');
    var parm = "";
    for (var i = 0; i < $rootScope.sensores.length; i++) {
      if (i > 0)
        parm += ",";
      parm += $rootScope.sensores[i].gpio + "=" + $rootScope.sensores[i].tipo;
    }
    $scope.enviarComandoArduino(CMD_INIT, parm);
  };

  /**
   * Este método se invoca cuando el Arduino da por buena la inicialización
   */
  $scope.arduinoInicializado = function() {
    console.log('Arduino inicializado correctamente');
    $scope.estado.arduinoIni = true;
    $scope.todoConectado();
  };

  /**
   * Método genérico de error del puerto Serie
   */
  $scope.errorSerie = function(err) {
    console.log(err);
    $scope.desconectarTodo();
    $ionicPopup.alert({
      title : 'Error de conexión USB',
      template : err
    });
  };

  /**
   * FIN MÉTODOS DEL PUERTO SERIE
   */

  /**
   * Se invoca cuando todas las conexiones se han realizado con éxito
   */
  $scope.todoConectado = function() {
    $scope.conectando = false;
    $scope.estado.servicio = true;
    $scope.$apply();
  };

  /**
   * Se invoca para cerrar todas las conexiones
   */
  $scope.desconectarTodo = function() {
    if ($scope.estado.mqtt || $scope.conectandoMQTT) {
      console.log('Desconectamos MQTT');
      if (MqttClient.connected)
        MqttClient.disconnect();
    }

    if ($scope.estado.arduinoCon) {
      console.log('Cerramos puerto serie');
      window.serial.close(function() {
        console.log('Puerto cerrado');
      }, function() {
      });
    }

    $scope.estado.mqtt = false;
    $scope.estado.arduinoCon = false;
    $scope.estado.arduinoIni = false;
    $scope.conectando = false;
    $scope.conectandoMQTT = false;
    $scope.estado.servicio = false;
  };

  /**
   * Este método se invoca al pulsar el botón Iniciar / Cancelar / Detener
   */
  $scope.iniciarDetener = function() {
    if ($scope.conectando || $scope.estado.servicio) {
      $scope.desconectarTodo();
    } else {
      if ($rootScope.sensores.length == 0) {
        $ionicPopup.alert({
          title : 'Error',
          template : 'No hay ningún sensor definido. Debe definir al menos uno'
        });
      } else {
        $scope.conectando = true;
        $scope.conectarMQTT($rootScope.mqtt.servidor, $rootScope.mqtt.puerto, $rootScope.mqtt.usuario, $rootScope.mqtt.password);
      }
    }
  };
});