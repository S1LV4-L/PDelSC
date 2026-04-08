let suma=5+4;
let resta=8-6;
let multiplicacion=3*11;
let division=30/5;

const tabla = document.getElementById("cuerpoTabla")
const nuevaFila = tabla.insertRow();

const celdaSuma = nuevaFila.insertCell(0);
const celdaResta = nuevaFila.insertCell(1);
const celdaMultiplicacion = nuevaFila.insertCell(2);
const celdaDivision = nuevaFila.insertCell(3);

celdaSuma.textContent = suma;
celdaResta.textContent = resta;
celdaMultiplicacion.textContent = multiplicacion;
celdaDivision.textContent = division;