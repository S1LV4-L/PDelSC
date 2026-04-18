import { calcular } from './modules/calculos.js';
import { mostrarClima } from './modules/tiempo.js';

console.log(calcular.sumar(10, 5));
console.log(calcular.dividir(20, 4));
console.log(mostrarClima().estado);
console.log(mostrarClima().temperatura)