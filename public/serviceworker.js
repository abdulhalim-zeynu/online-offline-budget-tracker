const name_ = "static-cache-v2";
const data_name = "data-cache-v1";

const files = [
    "/",
    "/db.js",
    "/index.html",
    "/index.js",
    "/styles.css",
  ];
  
  self.addEventListener("install", function(evt) {
    evt.waitUntil(
      caches.open(name_).then(cache => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(files);
      })
    );
  
    self.skipWaiting();
  });
  
  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== name_ && key !== data_name) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(data_name).then(cache => {
          return fetch(evt.request)
            .then(response => {
   
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
             
                return cache.match(evt.request);
              
            });
        }).catch(err => {
          console.log(err)
        })
      );
  
      return;
    }
  
    evt.respondWith(
      caches.open(name_).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  });
  