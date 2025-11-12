#!/usr/bin/env node
// Simple local chat server to emulate Supabase Functions chat endpoint
// Listens on port 54321 at /functions/v1/chat
// Loads .env.local if present and forwards requests to Lovable gateway using LOVABLE_API_KEY

import http from 'http';
import { once } from 'events';
import fs from 'fs';

// Load .env.local if present (simple parser)
const envPath = new URL('../.env.local', import.meta.url).pathname;
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) {
      const key = m[1];
      let val = m[2] || '';
      // strip optional surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const PORT = 54321;
const TARGET = 'https://ai.gateway.lovable.dev/v1/chat/completions';

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    });
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/functions/v1/chat') {
    try {
      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      const bodyText = Buffer.concat(buffers).toString('utf8');
      let body;
      try { body = JSON.parse(bodyText); } catch (e) { body = null; }

      const SKIP_AUTH = process.env.SKIP_AUTH === 'true';
      const auth = req.headers['authorization'];
      if (!SKIP_AUTH && !auth) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Authentication required' }));
      }

      const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
      if (!LOVABLE_API_KEY) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }));
      }

      // Forward request to Lovable gateway
      const fetchRes = await fetch(TARGET, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: body?.messages || [],
          stream: true,
        }),
      });

      // Pipe status and headers back
      const headers = {
        ...Object.fromEntries(fetchRes.headers.entries()),
        'Access-Control-Allow-Origin': '*',
      };
      res.writeHead(fetchRes.status, headers);

      if (fetchRes.body) {
        for await (const chunk of fetchRes.body) {
          res.write(chunk);
        }
      }
      return res.end();
    } catch (err) {
      console.error('local-chat-server error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Local chat server listening on http://localhost:${PORT}/functions/v1/chat`);
  console.log('SKIP_AUTH=' + (process.env.SKIP_AUTH === 'true'));
  console.log('LOVABLE_API_KEY present:', !!process.env.LOVABLE_API_KEY);
});

// handle termination gracefully
process.on('SIGINT', async () => {
  console.log('Shutting down local chat server...');
  server.close();
  await once(server, 'close');
  process.exit(0);
});
