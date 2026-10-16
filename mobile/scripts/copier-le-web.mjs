/* Recopie l'album dans mobile/www/, d'ou Capacitor l'embarque.

   On ne pointe pas Capacitor directement sur la racine du depot : il y
   deposerait node_modules et le projet Xcode au milieu du site, et la
   version publiee sur GitHub Pages s'en trouverait polluee. Une copie
   coute quelques secondes et garde les deux mondes separes. */
import { cp, rm, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(ici, '..', '..');
const www = path.resolve(ici, '..', 'www');

const A_COPIER = ['index.html', 'manifest.webmanifest', 'app', 'images'];

await rm(www, { recursive: true, force: true });
await mkdir(www, { recursive: true });
for (const nom of A_COPIER) {
  const src = path.join(racine, nom);
  if (!existsSync(src)) { console.warn('absent, ignore :', nom); continue; }
  await cp(src, path.join(www, nom), { recursive: true });
  console.log('copie :', nom);
}
/* Le service worker reste dehors a dessein : dans une application
   native, tout est deja sur l'appareil. Le garder ajouterait un cache
   par-dessus un cache, et c'est la premiere cause de « j'ai publie une
   mise a jour mais l'application montre encore l'ancienne ». */
console.log('\nwww/ pret — lance maintenant : npx cap sync ios');
