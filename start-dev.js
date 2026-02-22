import { spawn } from 'child_process';
import { promisify } from 'util';

const blue = (text) => `\x1b[34m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;

console.log(blue('\n=========================================='));
console.log(blue('   INICIANDO PROYECTO LEXCONTRACT   '));
console.log(blue('==========================================\n'));

async function start() {
    console.log(yellow('[1/3] Verificando entorno...'));

    // Iniciar Backend
    console.log(yellow('[2/3] Iniciando Backend (puerto 8000)...'));
    const backend = spawn('python', ['-m', 'uvicorn', 'main:app', '--reload', '--host', '127.0.0.1', '--port', '8000'], {
        cwd: './backend',
        shell: true,
        stdio: 'pipe'
    });

    let backendReady = false;

    backend.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Uvicorn running on')) {
            if (!backendReady) {
                console.log(green('✔ Backend iniciado correctamente en http://127.0.0.1:8000'));
                backendReady = true;
                startFrontend();
            }
        }
    });

    backend.stderr.on('data', (data) => {
        const output = data.toString();
        // Check for startup message in stderr too (Uvicorn often logs here)
        if (output.includes('Uvicorn running on')) {
            if (!backendReady) {
                console.log(green('✔ Backend iniciado correctamente en http://127.0.0.1:8000'));
                backendReady = true;
                startFrontend();
            }
        }

        if (output.includes('ERROR') || output.includes('Error')) {
            console.error(red(`\n[ERROR BACKEND]: ${output}`));
        }
    });

    backend.on('error', (err) => {
        console.error(red(`\n[ERROR CRITICO]: No se pudo iniciar el backend. ¿Python instalado?`));
    });

    function startFrontend() {
        console.log(yellow('[3/3] Iniciando Frontend (Vite)...'));
        const frontend = spawn('npm', ['run', 'dev'], {
            shell: true,
            stdio: 'inherit'
        });

        frontend.on('error', (err) => {
            console.error(red(`\n[ERROR]: No se pudo iniciar el frontend.`));
        });
    }

    // Timeout de seguridad para el backend
    setTimeout(() => {
        if (!backendReady) {
            console.log(yellow('! El backend esta tardando en responder, intentando iniciar frontend de todos modos...'));
            startFrontend();
        }
    }, 10000);
}

start();
