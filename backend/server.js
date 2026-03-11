require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");

const authRoutes    = require("./routes/auth");
const subjectRoutes = require("./routes/subjects");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — abierto (la seguridad la maneja JWT) ─────────────────
app.use(cors());
app.use(express.json());

// ── Rutas ────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/subjects", subjectRoutes);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date() })
);

// ── Conexión MongoDB ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    app.listen(PORT, () =>
      console.log(`🚀 Backend en http://0.0.0.0:${PORT}`)
    );
  })
  .catch(err => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });
