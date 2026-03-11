const mongoose = require("mongoose");

// ── Item (actividad dentro de una fase) ────────────────────────────
const ItemSchema = new mongoose.Schema({
  label:     { type: String, required: true },
  dateStart: { type: String },
  dateEnd:   { type: String, required: true },
  desc:      { type: String, default: "" },
  type:      { type: String, enum: ["individual","group","document","deadline"], default: "individual" },
  done:      { type: Boolean, default: false },
  order:     { type: Number, default: 0 },
}, { _id: true });

// ── Phase (fase dentro de una materia) ────────────────────────────
const PhaseSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  subtitle: { type: String, default: "" },
  points:   { type: Number, default: 100 },
  start:    { type: String, required: true },
  end:      { type: String, required: true },
  items:    [ItemSchema],
}, { _id: true });

// ── Subject (materia) ─────────────────────────────────────────────
const SubjectSchema = new mongoose.Schema({
  owner:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:   { type: String, required: true },
  code:   { type: String, default: "" },
  color:  { type: String, default: "#E63946" },
  phases: [PhaseSchema],
  archived: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Subject", SubjectSchema);
