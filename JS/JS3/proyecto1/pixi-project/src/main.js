import { Application, Graphics, TextStyle, Text } from 'pixi.js';

// Configuraciones fijas del juego (Mejor mantener la proporción de la rejilla controlada)
const TAMANO_CUADRO = 15; // 20px es perfecto para que sea visible y óptimo
let ANCHO_MAPA;
let ALTO_MAPA;
const VELOCIDAD_JUEGO = 1; // Un poco más rápido; 180ms se siente algo lento

let app;
let snake = [];
let comida;
let direccion = { x: 1, y: 0 }; 
let nuevaDireccion = { x: 1, y: 0 };
let juegoTerminado = false;
let ultimoMovimiento = 0;

async function iniciarJuego() {
    // 1. Capturamos el tamaño de la ventana de manera segura dentro de la ejecución
    // Usamos un tamaño múltiplo de TAMANO_CUADRO para evitar problemas de redondeo
    const altoDisponible = window.innerHeight;
    ANCHO_MAPA = Math.floor((altoDisponible * 0.8) / TAMANO_CUADRO) * 100; // 80% del alto de la ventana
    ALTO_MAPA = ANCHO_MAPA; // Cuadrado perfecto

    // Inicializar la aplicación de Pixi (v8)
    app = new Application();
    await app.init({ 
        width: ANCHO_MAPA, 
        height: ALTO_MAPA, 
        backgroundColor: 0x1a1a1a 
    });

    document.body.appendChild(app.canvas);

    configurarControles();
    reiniciar();

    // Game Loop
    app.ticker.add(() => {
        const tiempoActual = performance.now();
        if (tiempoActual - ultimoMovimiento > VELOCIDAD_JUEGO && !juegoTerminado) {
            actualizarJuego();
            ultimoMovimiento = tiempoActual;
        }
    });
}

function reiniciar() {
    app.stage.removeChildren();
    juegoTerminado = false;
    direccion = { x: 1, y: 0 };
    nuevaDireccion = { x: 1, y: 0 };

    snake = [];
    // Aseguramos que empiece en una posición central válida basada en las nuevas dinámicas del mapa
    const centroX = Math.floor((ANCHO_MAPA / TAMANO_CUADRO) / 2);
    const centroY = Math.floor((ALTO_MAPA / TAMANO_CUADRO) / 2);

    for (let i = 2; i >= 0; i--) {
        const bloque = crearBloque(centroX + i, centroY, 0x00ff00); 
        snake.push(bloque);
    }

    comida = crearBloque(0, 0, 0xff0000); 
    reposicionarComida();
}

function crearBloque(gridX, gridY, color) {
    const graphics = new Graphics();
    // Dejamos 2px de margen para que se note la separación entre bloques
    graphics.rect(0, 0, TAMANO_CUADRO - 2, TAMANO_CUADRO - 2); 
    graphics.fill(color);
    
    graphics.gridX = gridX;
    graphics.gridY = gridY;
    graphics.x = gridX * TAMANO_CUADRO;
    graphics.y = gridY * TAMANO_CUADRO;

    app.stage.addChild(graphics);
    return graphics;
}

function actualizarJuego() {
    direccion = nuevaDireccion;

    const cabezaActual = snake[0];
    const nuevaX = cabezaActual.gridX + direccion.x;
    const nuevaY = cabezaActual.gridY + direccion.y;

    // Colisión con Paredes
    if (nuevaX < 0 || nuevaX >= ANCHO_MAPA / TAMANO_CUADRO || nuevaY < 0 || nuevaY >= ALTO_MAPA / TAMANO_CUADRO) {
        morir();
        return;
    }

    // Colisión con el cuerpo
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].gridX === nuevaX && snake[i].gridY === nuevaY) {
            morir();
            return;
        }
    }

    // Verificar si come
    if (nuevaX === comida.gridX && nuevaY === comida.gridY) {
        const nuevoBloque = crearBloque(nuevaX, nuevaY, 0x00ff00);
        snake.unshift(nuevoBloque); 
        reposicionarComida();
    } else {
        const cola = snake.pop();
        cola.gridX = nuevaX;
        cola.gridY = nuevaY;
        cola.x = nuevaX * TAMANO_CUADRO;
        cola.y = nuevaY * TAMANO_CUADRO;
        snake.unshift(cola); 
    }
}

function reposicionarComida() {
    const columnas = ANCHO_MAPA / TAMANO_CUADRO;
    const filas = ALTO_MAPA / TAMANO_CUADRO;
    let enSerpiente = true;
    let randX, randY;

    while (enSerpiente) {
        randX = Math.floor(Math.random() * columnas);
        randY = Math.floor(Math.random() * filas);
        enSerpiente = snake.some(bloque => bloque.gridX === randX && bloque.gridY === randY);
    }

    comida.gridX = randX;
    comida.gridY = randY;
    comida.x = randX * TAMANO_CUADRO;
    comida.y = randY * TAMANO_CUADRO;
}

function configurarControles() {
    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'w': case 'W': case 'ArrowUp':
                if (direccion.y === 0) nuevaDireccion = { x: 0, y: -1 };
                break;
            case 's': case 'S': case 'ArrowDown':
                if (direccion.y === 0) nuevaDireccion = { x: 0, y: 1 };
                break;
            case 'a': case 'A': case 'ArrowLeft':
                if (direccion.x === 0) nuevaDireccion = { x: -1, y: 0 };
                break;
            case 'd': case 'D': case 'ArrowRight':
                if (direccion.x === 0) nuevaDireccion = { x: 1, y: 0 };
                break;
            case 'Enter':
                if (juegoTerminado) reiniciar();
                break;
        }
    });
}

function morir() {
    juegoTerminado = true;
    const estilo = new TextStyle({ fill: '#ffffff', fontSize: 36, fontWeight: 'bold' });
    const textoGameOver = new Text({ text: 'GAME OVER\nPresiona Enter', style: estilo });
    textoGameOver.x = ANCHO_MAPA / 2 - textoGameOver.width / 2;
    textoGameOver.y = ALTO_MAPA / 2 - textoGameOver.height / 2;
    app.stage.addChild(textoGameOver);
}

iniciarJuego();