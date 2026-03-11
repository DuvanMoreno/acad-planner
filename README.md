# 📚 Academic Planner — MERN + Auth + Deploy

Planificador académico con MongoDB, Express, React, Node.js, autenticación JWT y despliegue en Railway + Vercel.

---

## 🗂 Estructura del proyecto

```
planner/
├── backend/
│   ├── middleware/auth.js      ← Protege rutas con JWT
│   ├── models/Subject.js       ← Esquema de materia (con campo owner)
│   ├── models/User.js          ← Esquema de usuario con bcrypt
│   ├── routes/auth.js          ← Register / Login / Me
│   ├── routes/subjects.js      ← CRUD filtrado por usuario
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx             ← App completa con auth
│   │   ├── api.js              ← Servicio con token JWT
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## ⚡ Instalación local (paso a paso)

### 1. Instalar dependencias del backend
```bash
cd backend
cp .env.example .env
# Edita .env con tu MONGO_URI, JWT_SECRET e INVITE_CODE
npm install
npm run dev
```

### 2. Instalar dependencias del frontend
```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173

---

## 🔐 Seguridad implementada

| Mecanismo | Detalle |
|---|---|
| Contraseñas | bcryptjs con 12 rondas de salt |
| Sesiones | JWT firmado, expira en 30 días |
| Código de invitación | Requerido para registrarse |
| Aislamiento de datos | Cada usuario solo ve sus materias |
| Token expirado | Logout automático con mensaje |

---

## 🚀 Deploy gratuito en Railway + Vercel

### Paso 1 — Subir el código a GitHub
1. Crea un repo en github.com (puede ser privado)
2. En la carpeta `planner/`:
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/acad-planner.git
git push -u origin main
```

### Paso 2 — Deploy del BACKEND en Railway
1. Ve a https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Selecciona tu repo → elige la carpeta `backend` como **Root Directory**
3. En **Variables** agrega:
   ```
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=string_largo_secreto_min32chars
   JWT_EXPIRES_IN=30d
   INVITE_CODE=tu_codigo_secreto
   FRONTEND_URL=https://tu-app.vercel.app
   PORT=5000
   ```
4. Railway desplegará automáticamente. Copia la URL pública (ej: `https://acad-planner.up.railway.app`)

### Paso 3 — Configurar el frontend para producción
En `frontend/vite.config.js`, el proxy solo funciona en local. Para producción, en `frontend/src/api.js` cambia:
```js
// Detecta automáticamente si estamos en local o producción
const BASE = import.meta.env.VITE_API_URL || "/api";
```

Crea `frontend/.env.production`:
```
VITE_API_URL=https://acad-planner.up.railway.app/api
```

### Paso 4 — Deploy del FRONTEND en Vercel
1. Ve a https://vercel.com → **Add New Project** → importa tu repo de GitHub
2. En **Root Directory** pon `frontend`
3. En **Environment Variables** agrega:
   ```
   VITE_API_URL=https://acad-planner.up.railway.app/api
   ```
4. Click **Deploy**. Vercel te dará una URL como `https://acad-planner.vercel.app`

### Paso 5 — Actualizar CORS en el backend
En Railway, actualiza la variable `FRONTEND_URL` con la URL real de Vercel:
```
FRONTEND_URL=https://acad-planner.vercel.app
```

---

## 👥 Invitar compañeros

1. Comparte la URL de Vercel con tus compañeros
2. Dales el `INVITE_CODE` que configuraste en Railway
3. Cada uno crea su propia cuenta — sus materias son completamente independientes

Para cambiar el código de invitación, simplemente actualiza la variable `INVITE_CODE` en Railway.

---

## ❓ Problemas comunes

**"Código de invitación inválido"**
→ Verifica que el `INVITE_CODE` en Railway coincida exactamente con lo que escribes

**"CORS bloqueado"**
→ Verifica que `FRONTEND_URL` en Railway tenga la URL exacta de Vercel (sin `/` al final)

**"No se pudo conectar al servidor" en producción**
→ Verifica que `VITE_API_URL` en Vercel apunte a la URL correcta de Railway

**Token expira y cierra sesión**
→ Normal — por seguridad el token dura 30 días. Simplemente vuelve a iniciar sesión.
