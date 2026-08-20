export const success = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data });
};

export const fail = (res, message, statusCode = 400, details) => {
  return res.status(statusCode).json({ success: false, message, ...(details ? { details } : {}) });
};

export const paginate = (page = 1, limit = 20) => {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  return { skip: (p - 1) * l, take: l, page: p, limit: l };
};