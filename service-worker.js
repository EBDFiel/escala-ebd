const CACHE_NAME = "escala-ebd-v5-push";
const APP_URL = "https://escala.ebdfiel.com.br/";

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const destino = (event.notification && event.notification.data && event.notification.data.url) || APP_URL;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (janelas) {
      for (const janela of janelas) {
        try {
          const urlJanela = new URL(janela.url);
          const urlDestino = new URL(destino, APP_URL);
          if (urlJanela.origin === urlDestino.origin && "focus" in janela) {
            if ("navigate" in janela) {
              return janela.navigate(urlDestino.href).then(function () { return janela.focus(); });
            }
            return janela.focus();
          }
        } catch (erro) {
          // Continua procurando outra janela compatível.
        }
      }
      return clients.openWindow ? clients.openWindow(destino) : null;
    })
  );
});

function obterConfigFirebaseDoWorker() {
  try {
    const params = new URL(self.location.href).searchParams;
    return {
      apiKey: params.get("apiKey") || "",
      authDomain: params.get("authDomain") || "",
      projectId: params.get("projectId") || "",
      storageBucket: params.get("storageBucket") || "",
      messagingSenderId: params.get("messagingSenderId") || "",
      appId: params.get("appId") || ""
    };
  } catch (erro) {
    return {};
  }
}

function configFirebaseValida(config) {
  return Boolean(
    config &&
    config.apiKey &&
    config.projectId &&
    config.messagingSenderId &&
    config.appId
  );
}

(function inicializarFirebaseMessagingNoWorker() {
  const config = obterConfigFirebaseDoWorker();
  if (!configFirebaseValida(config)) return;

  try {
    importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
    importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

    firebase.initializeApp(config);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(function (payload) {
      const dados = (payload && payload.data) || {};
      const titulo = dados.title || "Escala EBD";
      const opcoes = {
        body: dados.body || "Você recebeu um lembrete da Escala EBD.",
        icon: "logoebd.png",
        badge: "logoebd.png",
        tag: dados.tag || "escala-ebd-lembrete",
        renotify: true,
        data: {
          url: dados.url || APP_URL
        }
      };

      return self.registration.showNotification(titulo, opcoes);
    });
  } catch (erro) {
    console.warn("Firebase Messaging não pôde ser iniciado no service worker:", erro);
  }
})();

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.map(function (nome) {
        return caches.delete(nome);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request, { cache: "no-store" }));
});
