const crypto = require("crypto");

function json(status, body) {
  return {
    status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function makeId(prefix) {
  return `${prefix}_${crypto.randomBytes(4).toString("hex")}`;
}

function nowIso() {
  return new Date().toISOString();
}

module.exports = { json, makeId, nowIso };
