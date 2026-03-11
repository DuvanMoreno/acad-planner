require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");

const authRoutes    = require("./routes/auth");
const subjectRoutes = require("./routes/subjects");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — permitir frontend local y producción ─────────────────
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// ── Rutas ────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/subjects", subjectRoutes);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date() })
);

// ── Iniciar servidor PRIMERO ─────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend en http://0.0.0.0:${PORT}`);
});

// ── Conexión MongoDB (en paralelo) ───────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
  })
  .catch(err => {
    console.error("❌ MongoDB error:", err.message);
  });
