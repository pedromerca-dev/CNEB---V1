/**
 * @file server.ts
 * @description Servidor Full-Stack Express + React SPA (Vite) compatible con Google Cloud Run.
 * - Escucha explícitamente en '0.0.0.0' y process.env.PORT || 3000.
 * - Expone '/health' respondiendo res.status(200).send('OK') instantáneamente.
 * - Expone POST '/api/generar-documento' para la generación curricular CNEB con IA.
 * - Sirve la interfaz completa de la aplicación React desde 'dist/' (express.static + index.html)
 *   en '/' y cualquier ruta web, o mediante Vite en desarrollo si 'dist/' aún no existe.
 */

import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Manejo defensivo de errores de proceso para evitar caídas durante el arranque en Cloud Run
process.on('uncaughtException', (err) => {
  console.error('[Server] uncaughtException manejada:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server] unhandledRejection manejada:', reason);
});

// Carga bajo demanda del módulo de rutas de IA para no retrasar el arranque del servidor HTTP
let routeModulePromise: ReturnType<typeof loadRouteModule> | null = null;

function loadRouteModule() {
  return import('./src/app/api/generar-documento/route.ts');
}

function getRouteModule() {
  if (!routeModulePromise) {
    routeModulePromise = loadRouteModule();
  }
  return routeModulePromise;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '2mb' }));

  // 1. Ruta exclusiva para la prueba de salud (Health Check) en Cloud Run
  app.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });

  app.get(['/healthz', '/_ah/health'], (_req, res) => {
    res.status(200).send('OK');
  });

  // 2. Ruta API: POST /api/generar-documento
  app.post('/api/generar-documento', async (req, res) => {
    try {
      const {
        generarDocumentoCurricularCore,
        validarDocumentoCurricularCompleto,
        validarPayloadCurricular,
      } = await getRouteModule();
      const validacion = validarPayloadCurricular(req.body);

      if (!validacion.valido || !validacion.datos) {
        res.status(400).json({
          ok: false,
          success: false,
          error: 'Datos de planificación incompletos o inválidos.',
          detalles: validacion.errores,
        });
        return;
      }

      const documento = await generarDocumentoCurricularCore(validacion.datos);
      const verificacionIntegridad = validarDocumentoCurricularCompleto(documento);

      if (!verificacionIntegridad.valido) {
        throw new Error(
          `Documento curricular incompleto: ${verificacionIntegridad.errores.join(' | ')}`
        );
      }

      res.status(200).json({
        ok: true,
        success: true,
        documento,
        data: documento,
      });
    } catch (error) {
      console.warn('[Server] Controlando excepción en POST /api/generar-documento.');
      const mensajeSaturacion503 =
        'Todos los proveedores de IA se encuentran saturados. Por favor, reintenta en unos segundos.';
      const mensajeError =
        error instanceof Error && error.message ? error.message : mensajeSaturacion503;
      const errConDebug = error as {
        debugError?: string;
        diagnosticoClaves?: { GEMINI: string; GROQ: string; OPENROUTER: string };
      } | null;
      const debugError =
        typeof errConDebug?.debugError === 'string' && errConDebug.debugError.length > 0
          ? errConDebug.debugError
          : mensajeError;

      res.status(503).json({
        ok: false,
        success: false,
        status: 503,
        error: mensajeError.includes('saturados') ? mensajeError : mensajeSaturacion503,
        message: mensajeSaturacion503,
        debugError,
        diagnosticoClaves: errConDebug?.diagnosticoClaves,
      });
    }
  });

  // 3. Servir los archivos estáticos compilados de React ('dist/') e 'index.html' en '/' y cualquier ruta web
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexHtml = path.join(distPath, 'index.html');

  // Servir recursos estáticos de 'dist' (JS, CSS, assets)
  app.use(express.static(distPath));

  // Fallback para servir siempre la interfaz completa de la SPA ('index.html') en '/' y rutas cliente
  let viteMiddleware: express.RequestHandler | null = null;

  app.get('*', async (req, res, next) => {
    if (fs.existsSync(distIndexHtml) && process.env.NODE_ENV === 'production') {
      res.sendFile(distIndexHtml);
      return;
    }

    if (viteMiddleware) {
      viteMiddleware(req, res, next);
      return;
    }

    if (fs.existsSync(distIndexHtml)) {
      res.sendFile(distIndexHtml);
      return;
    }

    // Si en desarrollo aún no existe dist/index.html, inicializar Vite bajo demanda
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      viteMiddleware = vite.middlewares;
      viteMiddleware(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  // 4. Escuchar explícitamente en 0.0.0.0 y process.env.PORT || 3000 de forma inmediata
  app.listen(PORT, HOST, () => {
    console.log(`CNEB Planificador Curricular ejecutándose en http://${HOST}:${PORT}`);
  });
}

startServer();
