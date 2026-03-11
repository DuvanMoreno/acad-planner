const jwt  = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No autorizado — token requerido" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    req.user = user; // disponible en todos los controladores
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Sesión expirada — inicia sesión nuevamente" });
    }
    return res.status(401).json({ error: "Token inválido" });
  }
};
