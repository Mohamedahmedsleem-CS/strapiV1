module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https://market-assets.strapi.io',
            'https://console.cloudinary.com',
            'https://res.cloudinary.com',
            'https://strapi-95jv.onrender.com' // إضافة رابط Strapi المنشور
          ],
          'script-src': [
            "'self'",
            'example.com',
            'https://media-library.cloudinary.com',
            'https://upload-widget.cloudinary.com',
            'https://console.cloudinary.com',
          ],
          'media-src': [
            "'self'", 
            'data:', 
            'blob:', 
            'https://console.cloudinary.com',
            'https://strapi-95jv.onrender.com' // إضافة رابط Strapi المنشور
          ],
          'frame-src': [
            "'self'",
            'https://media-library.cloudinary.com',
            'https://upload-widget.cloudinary.com',
            'https://console.cloudinary.com',
          ],
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
      // تحديث قائمة الأصول المسموح بها - إزالة النجمة '*' لتعزيز الأمان
      origin: [
        'http://localhost:8080',
        'http://localhost:3000',
        'http://localhost:1337',
        'https://almakarim-almumayyaza.vercel.app',
        'https://strapi-95jv.onrender.com'
      ],
      // إضافة إعدادات CORS المتقدمة
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      keepHeaderOnError: true,
      credentials: true, // مهم للمصادقة
      maxAge: 86400, // 24 ساعة
      expose: [
        'Content-Type',
        'Authorization',
        'X-Frame-Options',
        'Origin',
        'Accept'
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];