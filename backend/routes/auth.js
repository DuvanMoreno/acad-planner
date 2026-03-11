const express = require("express");
const jwt     = require("jsonwebtoken");
const router  = express.Router();
const User    = require("../models/User");
const protect = require("../middleware/auth");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
}

// ── POST /api/auth/register ─────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;

    // Validar código de invitación
    if (inviteCode !== process.env.INVITE_CODE) {
      return res.status(403).json({ error: "Código de invitación inválido" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son requeridos" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email" });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me ────────────────────────── usuario actual ──
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
