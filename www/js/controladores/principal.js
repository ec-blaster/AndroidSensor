/**
 * Controlador de la pantalla principal
 */
app.controller("CtrlPrincipal", function($scope, $rootScope, $ionicPopover, $ionicPopup, $cordovaDevice, $timeout, $state,
    MqttClient) {
  $scope.estado = {
    mqtt : false,
    arduinoCon : false,
    arduinoIni : false,
    servicio : false
  };
  $scope.lecturas = [];
  $scope.cronometro = null;

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
    if (typeof (cordova.plugins.backgroundMode) != "undefined") {
      console.log("Actualizando notificación");
      cordova.plugins.backgroundMode.configure({
        title : "Android Sensor",
        text : "Conectando..."
      });
    }

    if (servidor) {
      console.log("Conectando con el broker " + servidor);
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
            template : err.errorMessage,
            cssClass : 'error'
          });
        }
      });
    } else {
      $scope.desconectarTodo();
      $ionicPopup.alert({
        title : 'Error de conexión MQTT',
        template : 'No se ha definido el servidor MQTT',
        cssClass : 'error'
      });
    }
  };

  /**
   * Conexión exitosa con el broker
   */
  $scope.MQTTconectado = function() {
    console.log("Conectado con " + $rootScope.mqtt.servidor);
    $scope.conectandoMQTT = false;
    $scope.estado.mqtt = true;
    $scope.$apply();
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
          sleepOnPause : false
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
      } else if (comando == CMD_READOK) {
        // Arduino nos envía los datos de un sensor que le hemos pedido previamente
        $scope.sensorLeido(parametros);
      } else if (comando == CMD_ERROR)
        $scope.errorSerie("Error de Arduino: " + parametros);
    } else
      console.log(cadena);
  };

  /**
   * Método para enviar comandos al Arduino
   */
  $scope.enviarComandoArduino = function(comando, parametros) {
    console.log("=> COMANDO: " + comando);
    console.log("=> PARAMETROS: " + parametros);

    if (typeof (parametros) != "undefined")
      comando += " " + parametros;

    window.serial.write(comando + "\n", function() {
    }, function() {
      $scope.errorSerie("Error al enviar el comando al Arduino");
    });
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
      template : err,
      cssClass : 'error'
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
    if (typeof (cordova.plugins.backgroundMode) != "undefined") {
      console.log("Actualizando notificación");
      cordova.plugins.backgroundMode.configure({
        text : "La comunicación está activa"
      });
    }
    $scope.iniciarLecturas();
  };

  /**
   * Inicializamos los datos de lecturas de todos los sensores definidos
   */
  $scope.iniciarLecturas = function() {

    // Inicializamos el array de lecturas con el tiempo que queda para la siguiente lectura y el valor actual del sensor
    $scope.lecturas = [];
    for (var i = 0; i < $rootScope.sensores.length; i++) {
      var elem = {
        restante : 0,
        valor : null
      };
      $scope.lecturas[i] = elem;
    }

    $scope.comprobarSensores();
  };

  /**
   * Comprobamos si hay que leer algún sensor, descontamos y reprogramamos de nuevo el cronómetro
   */
  $scope.comprobarSensores = function() {
    for (var i = 0; i < $scope.lecturas.length; i++) {
      if ($scope.lecturas[i].restante == 0) {
        // Leemos el valor del sensor (de forma asíncrona)
        $scope.enviarComandoArduino(CMD_READ, i);

        // Reiniciamos el contador de este sensor
        $scope.lecturas[i].restante = $rootScope.sensores[i].periodicidad;
      } else
        $scope.lecturas[i].restante--;
    }

    $scope.cronometro = $timeout($scope.comprobarSensores, 1000);
  }

  /**
   * Obtenemos los datos de un sensor
   */
  $scope.sensorLeido = function(params) {
    // 1.- Obtenemos de los parámetros el número de sensor y el valor leído
    var idSensor = -1;
    var valor = -1;
    var sep = params.indexOf(' ');
    if (sep != -1) {
      idSensor = params.substring(0, sep);
      valor = params.substring(1 + sep);
    } else {
      idSensor = params;
      valor = 0;
    }

    // 2.- Actualizamos el valor en el array de lecturas
    $scope.lecturas[idSensor].valor = valor;

    // 3.- Lo enviamos al tópico MQTT asociado
    var payload = new Paho.MQTT.Message(valor);
    payload.destinationName = $rootScope.sensores[idSensor].topico;
    MqttClient.send(payload);
    console.log("Valor para el sensor " + $rootScope.sensores[idSensor].nombre + " publicado en "
        + $rootScope.sensores[idSensor].topico)
  };

  /**
   * Se invoca para cerrar todas las conexiones
   */
  $scope.desconectarTodo = function() {
    if (typeof (cordova.plugins.backgroundMode) != "undefined") {
      console.log("Actualizando notificación");
      cordova.plugins.backgroundMode.configure({
        text : "La comunicación está inactiva"
      });
    }

    if ($scope.cronometro != null) {
      console.log('Detenemos las lecturas');
      $timeout.cancel($scope.cronometro);
      $scope.cronometro = null;
    }

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
          template : 'No hay ningún sensor definido. Debe definir al menos uno',
          cssClass : 'error'
        });
      } else {
        $scope.conectando = true;
        $scope.conectarMQTT($rootScope.mqtt.servidor, $rootScope.mqtt.puerto, $rootScope.mqtt.usuario, $rootScope.mqtt.password);
      }
    }
  };

  $scope.ir = function(pagina) {
    $state.go(pagina);
  };

  /**
   * Cancelamos el cronómetro si aún está activo
   */
  $scope.$on("$destroy", function() {
    if ($scope.cronometro != null)
      $timeout.cancel($scope.cronometro);
  });
});