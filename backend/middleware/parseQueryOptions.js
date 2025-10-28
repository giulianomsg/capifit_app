function safeJsonParse(value) {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch (error) {
    return undefined;
  }
}

module.exports = function parseQueryOptions(req, res, next) {
  req.queryOptions = {
    where: safeJsonParse(req.query.where) || {},
    orderBy: safeJsonParse(req.query.orderBy) || {},
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
  };

  next();
};
