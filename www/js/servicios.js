// Definición de servicios

app.factory('MQTT', function($rootScope, $q, $ionicLoading) {

	var servicio = {};
	var cliente = {};

	servicio.conectar = function(host, puerto, usuario, password) {
		console.log("Conectando con MQTT Broker en " + host
				+ " con el usuario " + usuario);

		var resultado = $q.defer();

		cliente = new MqttClient({
			host : host,
			port : puerto,
			clientId : 'loquesea',
			username : usuario,
			password : password,
			reconnect : 5000
		});

		cliente = cliente.connect();
		cliente.on('connecting', function() {
			console.log('Conectando...');
		}).on('connect', function() {
			console.log("Conectado");
			resultado.resolve();
		}).on('disconnect', function() {
			console.log('Desconectado');
		}).on('offline', function() {
			console.log('No se pudo conectar');
			resultado.reject('El servidor no está activo');
		}).on('error', function(err) {
			console.log('error!', err);
			resultado.reject(err);
		}).on('message', function(topico, mensaje) {
			servicio.callback(topico, mensaje);
		});

		return resultado.promise;
	}

	servicio.publicar = function(topic, payload) {
		cliente.publish(topic, payload, {
			retain : true
		});
		console.log('Publicado ' + payload + ' para el tópico: ' + topic + ' '
				+ cliente);
	}

	servicio.onMessage = function(callback) {
		servicio.callback = callback;
	}

	return servicio;
});
