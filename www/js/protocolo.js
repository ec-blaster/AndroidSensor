// Definición de los comandos del protocolo

var CMD_ERROR = "AS_ERROR"; // Error general
var CMD_INITREQ = "AS_INITREQ"; // Comando para petición de inicialización por
								// parte del Arduino
var CMD_INIT = "AS_INITDATA"; // Comando para envío de datos de inicialización
								// de Android al Arduino
var CMD_INITOK = "AS_INITOK"; // Comando para confirmar que la inicialización
								// ha ido bien
var CMD_INITERR = "AS_INITERR"; // Comando para indicar un error de
								// inicialización por parte del Arduino
var CMD_READ = "AS_READ"; // Comando de petición de lectura de un sensor
