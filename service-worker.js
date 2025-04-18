// 定义缓存的名称
const CACHE_NAME = 'wordcards-cache-v1';

// 需要缓存的资源列表
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/favicon.ico'
];

// 安装服务工作线程
self.addEventListener('install', event => {
  console.log('Service Worker: Installing');
  
  // 等待缓存完成
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活服务工作线程
self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
  
  // 清除旧版本缓存
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching');
  
  event.respondWith(
    // 尝试从缓存获取资源
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有资源，则返回缓存
        if (response) {
          return response;
        }
        
        // 否则从网络获取
        return fetch(event.request)
          .then(networkResponse => {
            // 检查是否收到有效响应
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // 复制响应，一份用于缓存，一份用于返回给浏览器
            const responseToCache = networkResponse.clone();
            
            // 只缓存静态资源，不缓存API请求等
            if (event.request.url.includes('/css/') || 
                event.request.url.includes('/js/') || 
                event.request.url.includes('/images/') ||
                event.request.url.includes('.html') ||
                event.request.url.includes('.json')) {
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return networkResponse;
          })
          .catch(() => {
            // 如果网络请求失败，尝试返回离线页面
            if (event.request.url.includes('.html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// 处理推送通知
self.addEventListener('push', event => {
  console.log('Service Worker: Push Received');
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/images/icon-192.png',
    badge: '/images/icon-192.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 点击通知
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification Clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});