export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const pick = (obj, keys) => {
  const out = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
};

export const normalizeLevel = (level) => {
  const lvl = String(level || "").toUpperCase().trim();
  return ["A1", "A2", "B1", "B2", "C1", "C2"].includes(lvl) ? lvl : null;
};

export const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};