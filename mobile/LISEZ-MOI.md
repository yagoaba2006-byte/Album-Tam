# L'album de Tam, en application iOS

Ce dossier contient tout ce qu'il faut pour transformer l'album en une
vraie application iPhone, distribuable sur l'App Store. **Rien ici ne
peut être compilé ailleurs que sur un Mac** : seul Xcode produit un
fichier `.ipa`, et Xcode n'existe que sur macOS.

## Ce qu'il faut avoir, d'abord

- Un **Mac** avec **Xcode** (gratuit, sur le Mac App Store).
- **Node.js** 18 ou plus récent.
- Un **compte développeur Apple** à **99 € par an** — obligatoire pour
  publier sur l'App Store, et aussi pour installer l'application sur un
  iPhone plus de sept jours. Avec un simple identifiant Apple gratuit,
  l'application s'installe sur ton propre iPhone mais **expire au bout
  d'une semaine** et doit être réinstallée.

## Les commandes, dans l'ordre

```bash
cd mobile
npm install
npm run copier          # recopie l'album dans www/
npx cap add ios         # crée le projet Xcode — une seule fois
npm run icones          # icônes et écrans de lancement, depuis resources/
npm run preparer        # à relancer après chaque modification de l'album
npm run ouvrir          # ouvre le projet dans Xcode
```

Dans Xcode : choisis ton équipe de signature dans **Signing &
Capabilities**, branche l'iPhone, et appuie sur ▶.

Après **toute** modification de `index.html` ou des photos, relance
`npm run preparer` — sinon l'application continue d'embarquer l'ancienne
version.

## À savoir avant de viser l'App Store

**Apple refuse les sites web simplement emballés.** Sa règle 4.2 écarte
les applications qui n'apportent rien de plus que leur version web.
L'album tel quel entre dans cette description, et un refus est un risque
réel, pas théorique.

Ce qui fait pencher un dossier du bon côté, ce sont des capacités que le
web n'a pas sur iPhone :

- **une notification** quand le pack du jour est à nouveau disponible —
  c'est l'ajout le plus évident ici, et le plus utile ;
- **l'enregistrement d'une carte dans la photothèque** ;
- **le partage natif** d'une carte vers Messages ou Instagram ;
- **le retour haptique** à l'ouverture d'un pack.

Chacun est un greffon Capacitor de quelques lignes. La notification
locale suffirait probablement à elle seule à justifier l'application.

**Et une question à trancher avant de publier** : les photos sont
privées. Une application publique sur l'App Store est téléchargeable par
n'importe qui. Si l'album est destiné à une seule personne, la version
installée depuis Safari — déjà en place, sans compte ni validation — est
le choix le plus sûr. TestFlight permet aussi de limiter la diffusion à
une liste d'invités, sans passage en boutique.
