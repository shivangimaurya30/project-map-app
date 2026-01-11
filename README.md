# 🗺️ Interactive Polygon Drawing & Overlap Detection Tool

This project is a **React + TypeScript + Vite** based web application that allows users to draw polygons on an interactive map, detect polygon overlaps, and export spatial data in **GeoJSON format**.

The application uses **OpenStreetMap** for map tiles and **Turf.js** for spatial and polygon-based operations.

---

## 🚀 Hosted Application

🔗 **Local Hosted Link:**  
http://localhost:5173/

> ⚠️ Note: Run the project locally using the steps below to access this URL.

---

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript
- **Build Tool:** Vite
- **Mapping:** Leaflet & React-Leaflet
- **Spatial Operations:** Turf.js
- **State Management:** Zustand
- **Linting:** ESLint
- **Map Tiles:** OpenStreetMap

---

## ⚙️ Setup & Run Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/shivangimaurya30/project-map-app.git
cd project-map-app
npm install
npm run dev
# Open the browser and run: http://localhost:5173/

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
