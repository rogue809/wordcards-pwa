// 定义缓存的名称
const CACHE_NAME = 'wordcards-cache-v1';

// 定义基础路径
const BASE_PATH = '/wordcards-pwa';

// 需要缓存的资源列表
const CACHE_ASSETS = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/css/styles.css',
  BASE_PATH + '/js/app.js',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/images/icon-192.png',
  BASE_PATH + '/images/icon-512.png',
  BASE_PATH + '/images/favicon.ico'
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
  
  // 获取请求URL
  const requestUrl = new URL(event.request.url);
  
  // 处理子路径
  // 检查URL是否应该被重写
  if (requestUrl.origin === self.location.origin) {
    // 只处理同源请求
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
              if (requestUrl.pathname.includes('/css/') || 
                  requestUrl.pathname.includes('/js/') || 
                  requestUrl.pathname.includes('/images/') ||
                  requestUrl.pathname.includes('.html') ||
                  requestUrl.pathname.includes('.json')) {
                
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              
              return networkResponse;
            })
            .catch(() => {
              // 如果网络请求失败，尝试返回离线页面
              if (requestUrl.pathname.includes('.html')) {
                return caches.match(BASE_PATH + '/index.html');
              }
            });
        })
    );
  } else {
    // 对于非同源请求，使用默认行为
    event.respondWith(fetch(event.request));
  }
});

// 处理推送通知
self.addEventListener('push', event => {
  console.log('Service Worker: Push Received');
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: BASE_PATH + '/images/icon-192.png',
    badge: BASE_PATH + '/images/icon-192.png',
    data: {
      url: data.url || BASE_PATH + '/'
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