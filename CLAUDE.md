# Padel Cañaveral — Landing B2B

## Descripción
Landing page B2B para Padel Cañaveral. Permite a clubes, monitores, academias y creadores de contenido solicitar acceso a precios profesionales. El formulario crea automáticamente un cliente en Shopify con tag `b2b-pendiente`.

- **Stack:** HTML + Tailwind CSS (CDN) + Node.js (sin framework)
- **GitHub:** `joseubeda100392/landing-page-b2b-padel-ca-averal`
- **Deploy:** Railway (conectado al repo de GitHub)

## Estructura
```
/
  index.html      ← toda la UI, una sola página
  server.js       ← servidor HTTP: sirve estáticos + POST /solicitar-acceso → Shopify
  package.json    ← { "start": "node server.js" }
  railway.json    ← config Railway (startCommand, healthcheck)
  img/            ← logo.webp y demás imágenes
```

## Cómo correr localmente
```bash
SHOPIFY_ADMIN_TOKEN=xxx node server.js   # http://localhost:3000
```
Sin el token, el servidor arranca igualmente pero el POST /solicitar-acceso dará error.

## Variables de entorno (Railway)
| Variable | Descripción |
|---|---|
| `SHOPIFY_ADMIN_TOKEN` | Token de Admin API de Shopify |
| `SHOP` | Dominio myshopify (default: `utrsp8-0c.myshopify.com`) |
| `SHOPIFY_API_VERSION` | Versión API Shopify (default: `2024-07`) |
| `PORT` | Railway lo inyecta automáticamente |

## Flujo del formulario
1. Usuario rellena el form y acepta privacidad
2. `POST /solicitar-acceso` con JSON: `{ negocio, contacto, email, tipo, telefono, comentarios }`
3. `server.js` llama a `POST /admin/api/customers.json` de Shopify
4. Cliente creado con tag `b2b-pendiente` para revisión manual en Shopify

## Deploy
Railway se conecta al repo de GitHub. Cada push a `main` dispara un nuevo deploy automático. La configuración está en `railway.json`.

## Estilo de Comunicación
Respuestas cortas y directas. Sin introducciones ni resúmenes. Una frase por actualización.
