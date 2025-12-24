const crypto = require("crypto");

function json(context, status, body) {
  context.res = {
    status,
    headers: {
      "Content-Type": "application/json"
    },
    body
  };
}

function makeId(prefix) {
  // Example: media_1a2b3c4d
  return `${prefix}_${crypto.randomBytes(4).toString("hex")}`;
}

function nowIso() {
  return new Date().toISOString();
}

module.exports = { json, makeId, nowIso };
