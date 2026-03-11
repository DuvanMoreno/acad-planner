const express = require("express");
const router  = express.Router();
const Subject = require("../models/Subject");
const protect = require("../middleware/auth");

// Todas las rutas requieren autenticación
router.use(protect);

// ── Helper: normaliza _id con formato MongoDB Extended JSON ────────
function normalizeId(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const o = { ...obj };
  if (o._id && typeof o._id === "object" && o._id.$oid) o._id = o._id.$oid;
  if (Array.isArray(o.phases)) {
    o.phases = o.phases.map(ph => {
      const p = { ...ph };
      if (p._id && typeof p._id === "object" && p._id.$oid) p._id = p._id.$oid;
      if (Array.isArray(p.items)) {
        p.items = p.items.map(it => {
          const i = { ...it };
          if (i._id && typeof i._id === "object" && i._id.$oid) i._id = i._id.$oid;
          return i;
        });
      }
      return p;
    });
  }
  return o;
}

// ── GET /api/subjects ──────────────────────── solo las del usuario
router.get("/", async (req, res) => {
  try {
    const { archived } = req.query;
    const filter = {
      owner: req.user._id,
      ...(archived === "true" ? { archived: true } : { archived: { $ne: true } }),
    };
    const subjects = await Subject.find(filter).sort({ createdAt: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/subjects ─────────────────────── crear (owner = yo)
router.post("/", async (req, res) => {
  try {
    const body = normalizeId(req.body);
    delete body._id;
    const subject = new Subject({ ...body, owner: req.user._id });
    const saved = await subject.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Helper: verificar que la materia pertenece al usuario ──────────
async function ownSubject(id, userId) {
  const s = await Subject.findById(id);
  if (!s) return null;
  if (String(s.owner) !== String(userId)) return null;
  return s;
}

// ── PUT /api/subjects/:id ──────────────────── actualizar
router.put("/:id", async (req, res) => {
  try {
    const own = await ownSubject(req.params.id, req.user._id);
    if (!own) return res.status(404).json({ error: "No encontrada o sin permiso" });
    const updated = await Subject.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /api/subjects/:id ───────────────── eliminar
router.delete("/:id", async (req, res) => {
  try {
    const own = await ownSubject(req.params.id, req.user._id);
    if (!own) return res.status(404).json({ error: "No encontrada o sin permiso" });
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: "Materia eliminada", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/subjects/:id/archive ───────── archivar
router.patch("/:id/archive", async (req, res) => {
  try {
    const own = await ownSubject(req.params.id, req.user._id);
    if (!own) return res.status(404).json({ error: "No encontrada o sin permiso" });
    const updated = await Subject.findByIdAndUpdate(
      req.params.id, { archived: true }, { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/subjects/:id/phases ────────── actualizar fases
router.patch("/:id/phases", async (req, res) => {
  try {
    const own = await ownSubject(req.params.id, req.user._id);
    if (!own) return res.status(404).json({ error: "No encontrada o sin permiso" });
    const updated = await Subject.findByIdAndUpdate(
      req.params.id, { phases: req.body.phases }, { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
