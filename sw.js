/* ==================================================================
   Le service worker. C'est lui qui fait tenir l'album hors connexion
   et qui le fait demarrer instantanement.

   Trois regimes, parce que les trois sortes de fichiers n'ont pas les
   memes besoins :

   - la PAGE : reseau d'abord, cache en secours. Sans quoi une mise a
     jour de l'album ne parviendrait jamais a un telephone qui l'a deja
     ouvert une fois.
   - les PHOTOS : cache d'abord. Une carte ne change jamais ; aller la
     redemander au reseau ne ferait que couter du temps et des donnees.
   - les POLICES : cache d'abord aussi, et rafraichies en arriere-plan.
     Elles viennent d'un autre domaine, donc la reponse est opaque — on
     ne peut pas lire son code de statut, seulement la garder telle
     quelle.
   ================================================================== */
const VERSION = 'album-tam-v1';
const COQUILLE = VERSION + '-coquille';
const PHOTOS   = VERSION + '-photos';
const POLICES  = VERSION + '-polices';

/* la coquille : le strict necessaire pour que l'application s'ouvre,
   meme en avion, meme au tout premier lancement hors ligne */
const A_PRECHARGER = [
  './',
  './index.html',
  './manifest.webmanifest',
  './app/icons/icone-180.png',
  './app/icons/icone-192.png',
  './app/icons/icone-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(COQUILLE)
      .then((c) => c.addAll(A_PRECHARGER))
      /* une seule ressource manquante ferait echouer addAll et laisserait
         l'application sans aucun cache : on prefere un prechargement
         partiel a pas de prechargement du tout */
      .catch(() => caches.open(COQUILLE).then((c) =>
        Promise.all(A_PRECHARGER.map((u) => c.add(u).catch(() => null)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(
        noms.filter((n) => !n.startsWith(VERSION)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'passer-la-main') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* 1. la page elle-meme */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((rep) => {
          const copie = rep.clone();
          caches.open(COQUILLE).then((c) => c.put('./index.html', copie));
          return rep;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  /* 2. les photos et les icones : immuables */
  if (url.origin === location.origin &&
      /\.(jpe?g|png|webp|gif|svg)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((rep) => {
        if (rep.ok) {
          const copie = rep.clone();
          caches.open(PHOTOS).then((c) => c.put(req, copie));
        }
        return rep;
      }).catch(() => hit))
    );
    return;
  }

  /* 3. les polices Google, servies depuis un autre domaine */
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const frais = fetch(req).then((rep) => {
          const copie = rep.clone();
          caches.open(POLICES).then((c) => c.put(req, copie));
          return rep;
        }).catch(() => hit);
        return hit || frais;
      })
    );
    return;
  }

  /* 4. tout le reste : reseau, cache en secours */
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
