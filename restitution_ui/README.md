# 🎨 IRIS UI – Frontend React + TypeScript + TailwindCSS (-v ^18.2.0 + 4.9.5 + 3.0.0)

Ce projet est l'interface utilisateur du système IRIS. Il est construit avec **React**, **TypeScript** et **TailwindCSS** pour un développement rapide, moderne et maintenable.

---

## 🛠️ Stack technique

- [React](https://reactjs.org/) – Librairie JavaScript pour créer des interfaces utilisateurs.
- [TypeScript](https://www.typescriptlang.org/) – Superset typé de JavaScript.
- [Tailwind CSS](https://tailwindcss.com/) – Framework CSS utilitaire pour un design rapide et responsive.
- [ESLint](https://eslint.org/) – Linter pour garder un code propre.

---

## ⚙️ Prérequis

- Node.js ≥ 16.x
- npm ou yarn

---

## 🚀 Création & configuration du projet

```bash
npx create-react-app restitution-ui
cd restitution-ui
npm install react@18.2.0 react-dom@18.2.0
npm install typescript@4.9.5 --save-dev
npx tsc --init
npm install --save-dev @types/react @types/react-dom @types/leaflet
```

Mettez à jour `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### 🔧 Installation TailwindCSS

```bash
npm install -D tailwindcss@3.0.0 postcss autoprefixer
npx tailwindcss init -p
```

### 🧩 Configuration Tailwind

Dans `tailwind.config.js` :

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Dans `src/App.css` :

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 🔧 Installation Librairies utiles

```bash
npm install react-router-dom
npm install react-leaflet@4.2.1 leaflet
```

### 🧩 Configuration des tags "@/\*" (Optionnel)

Installez d'abord :

```bash
npm install react-app-rewired --save-dev
```

Creez le fichier suivant `tsconfig.paths.json` a la racine du projet :

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Ajoutez le dans le fichier `tsconfig.json`:

```json
{
  "extends": "./tsconfig.paths.json",
  "compilerOptions": {
    // contenu par defaut
  },
  "include": ["src"]
}
```

Modifiez le script dans `package.json` :

```json
  "scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test"
  },

```

Creez un fichier `config-overrides.js` à la racine

```js
const path = require("path");

module.exports = function override(config, env) {
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    "@": path.resolve(__dirname, "src"),
  };
  return config;
};
```

---

## ✅ Lancer l'application en développement

```bash
npm start
```

Ouvrir dans le navigateur : [http://localhost:5173](http://localhost:5173)
Ouvrir dans le navigateur : [http://IP:PORT](a configurer dans .env)

---

## 🧪 Linting & Qualité du code

### Configuration recommandée (Optionnel)

Si vous développez pour la production, utilisez des règles strictes avec type-checking (Extension de la configuration ESLint pour projets professionnels) :

```bash
npm install --save-dev @types/node
```

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── assets/         # Images, logos, etc.
│   ├── components/     # Composants réutilisables
│   ├── pages/          # Pages principales de l'app
│   ├── hooks/          # Hooks personnalisés
│   ├── services/       # API calls, services de données
│   ├── styles/         # Fichiers CSS ou Tailwind
│   └── main.tsx        # Entrée principale
├── public/             # Fichiers publics
├── index.html
├── tailwind.config.cjs
├── postcss.config.cjs
└── vite.config.ts
```

---

## 📄 Déploiement

Utilisez des solutions comme :

- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [Render](https://render.com/)

> Le projet est prêt à être déployé après un `npm run build`.

---

## 🧾 Auteur

- **Trofel**
- Email : trofel.2025@gmail.com

---

## 🔗 Backend associé

Voir le projet [IRIS API – Backend Django + DRF + Celery/Redis](../api_restitution/README.md)
🔗 Link: ...
