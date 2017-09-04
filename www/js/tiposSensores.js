// Definición de los distintos tipos de sensores

var tiposSensores = [ {
  id : 'dht11_temp',
  nombre : 'DHT11 (temperatura)',
  tipo : 'temp',
  icono : 'ion-thermometer',
  gpio : true
}, {
  id : 'dht11_hum',
  nombre : 'DHT11 (humedad)',
  tipo : 'temp',
  icono : 'ion-waterdrop',
  gpio : true
}, {
  id : 'dht22_temp',
  nombre : 'DHT22 (temperatura)',
  tipo : 'temp',
  icono : 'ion-thermometer',
  gpio : true
}, {
  id : 'dht22_hum',
  nombre : 'DHT22 (humedad)',
  tipo : 'temp',
  icono : 'ion-waterdrop',
  gpio : true
}, {
  id : 'ds18b20',
  nombre : 'DS18B20',
  tipo : 'temp',
  icono : 'ion-thermometer',
  gpio : true
}, {
  id : 'lux',
  nombre : 'Luminosidad',
  tipo : 'lux',
  icono : 'ion-aperture',
  gpio : false
}, {
  id : 'mov',
  nombre : 'Movimiento',
  tipo : 'mov',
  icono : 'ion-android-walk',
  gpio : false
}, {
  id : 'gen',
  nombre : 'Genérico',
  tipo : 'gen',
  icono : 'ion-speedometer',
  gpio : true
} ];