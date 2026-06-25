'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.webp': 'image/webp',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.css':  'text/css',
  '.js':   'text/javascript',
};

const SHOP        = process.env.SHOP || 'utrsp8-0c.myshopify.com';
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-07';

async function createShopifyCustomer(data) {
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!token) throw new Error('SHOPIFY_ADMIN_TOKEN no configurado');

  const nameParts = (data.contacto || '').trim().split(' ');
  const firstName = nameParts[0] || data.negocio;
  const lastName  = nameParts.slice(1).join(' ') || '-';

  const payload = {
    customer: {
      first_name: firstName,
      last_name:  lastName,
      email:      data.email,
      phone:      data.telefono || undefined,
      tags:       'b2b-pendiente',
      note:       `Negocio: ${data.negocio}\nTipo: ${data.tipo}\nComentarios: ${data.comentarios || '-'}`,
      accepts_marketing: false,
      send_email_invite: false,
    },
  };

  const r = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/customers.json`, {
    method:  'POST',
    headers: {
      'Content-Type':           'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify(payload),
  });

  const json = await r.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.customer;
}

const server = http.createServer((req, res) => {
  // POST /solicitar-acceso → crea cliente en Shopify con tag b2b-pendiente
  if (req.method === 'POST' && req.url === '/solicitar-acceso') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      try {
        const data     = JSON.parse(body);
        const customer = await createShopifyCustomer(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, id: customer.id }));
      } catch (err) {
        console.error('[solicitar-acceso] Error:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // Archivos estáticos bajo /img/
  if (req.url.startsWith('/img/')) {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
    return;
  }
  // Cualquier otra ruta → index.html
  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading page');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Landing B2B] Corriendo en puerto ${PORT}`);
});
