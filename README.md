## 🏟️ **Reserva de Campos Deportivas** 🏃⚽

📍 **Descubre, reserva y gestiona fácilmente tus campos deportivas favoritas.**Este proyecto permite a los usuarios explorar diferentes campos disponibles, reservarlas en línea, visualizar su historial de reservas y gestionar sus datos de manera eficiente.

---

## 📌 **🔗 Demo en Producción**

👉 [Reserva de Campos - Vercel](https://victory-craft-front.vercel.app/)

---

## 📌 **🚀 Características**

👉 **Mapa Interactivo:** Muestra todas las campos con su ubicación exacta.👉 **Filtrado por Tipo:** Filtra las campos por tipo (fútbol, pádel, tenis).👉 **Historial de Reservas:** Consulta todas tus reservas pasadas y futuras.👉 **CRUD de Campos:** Permite a los administradores agregar, editar y eliminar campos.👉 **Interfaz Responsiva:** Adaptado para escritorio y dispositivos móviles.

---

## 📌 **📚 Tecnologías Utilizadas**

### **Frontend 🖥️**

- ⚡ React + TypeScript + Vite
- 🎨 Tailwind CSS
- 🗺️ Mapbox GL
- 🗓 FullCalendar
- 📊 Chart.js
- ⚡ Axios para consumir la API

### **Backend 🛠️**

- 💪 Node.js + Express
- 📜 TypeScript
- 💾 MongoDB + Mongoose
- 🔒 Autenticación con JWT
- 💤 CORS habilitado para conexión con el frontend
- ⚡ Desplegado en **Vercel**

---

## 📌 **⚙️ Instalación y Uso**

### **1️⃣ Clonar el repositorio**

```bash
git clone https://github.com/liniconde/victory-craft-front
cd victory-craft-front
```

🖊️ **Crear un archivo `.env`** en la raiz con lo siguiente:

```env
VITE_MAPBOX_TOKEN=xxxxx
VITE_API_URL=http://localhost:5001/
VITE_ENV=development
VITE_BUCKET_NAME=victory-craft
```

📌 **Ejecutar el backend**:

```bash
npm run dev
```

El backend se ejecutará en `http://localhost:5001`

### ** Configuración del Frontend**

```bash
cd frontend
npm install
```

📌 **Ejecutar el frontend**:

```bash
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173`

---

## 📌 **🛠️ Contribuir**

✨ ¡Las contribuciones son bienvenidas! 🚀Si deseas mejorar este proyecto:

1. **Forkea** el repositorio.
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`).
3. Haz tus cambios y **confirma los commits** (`git commit -m "Agregada nueva funcionalidad"`).
4. Haz un **push** a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un **Pull Request** en GitHub.

---

## 📌 **📄 Licencia**

Este proyecto está bajo la **Licencia MIT**. Puedes usarlo y modificarlo libremente.

---


💡 **Desarrollado con ❤️ por [Tu Nombre](https://github.com/liniconde)**
