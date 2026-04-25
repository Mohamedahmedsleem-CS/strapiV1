function parseCsvOrigins(value) {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function buildCorsOrigins() {
  const set = new Set([
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:1337',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:1337',
  ]);
  parseCsvOrigins(process.env.FRONTEND_URL).forEach((o) => set.add(o));
  parseCsvOrigins(process.env.CORS_ORIGINS).forEach((o) => set.add(o));
  if (process.env.STRAPI_PUBLIC_URL) {
    const u = String(process.env.STRAPI_PUBLIC_URL).trim().replace(/\/$/, '');
    if (u) set.add(u);
  }
  return [...set];
}

module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // Allow HTTPS media (local uploads are same-origin; legacy absolute URLs stay valid)
          'img-src': ["'self'", 'data:', 'blob:', 'https://market-assets.strapi.io', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          'connect-src': ["'self'", 'https:', 'http:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: buildCorsOrigins(),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      keepHeaderOnError: true,
      credentials: true,
      maxAge: 86400,
      expose: ['Content-Type', 'Authorization', 'X-Frame-Options', 'Origin', 'Accept'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
