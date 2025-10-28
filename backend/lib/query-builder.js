const ALLOWED_OPERATORS = new Set(['=', '!=', '>', '>=', '<', '<=', 'LIKE', 'IN']);

function sanitizeIdentifier(identifier) {
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new Error(`Invalid identifier: ${identifier}`);
  }
  return identifier;
}

function buildWhereClause(where = {}, values = [], prefix = '') {
  const conditions = [];

  for (const [key, value] of Object.entries(where)) {
    if (key === '$or' && Array.isArray(value)) {
      const orConditions = value
        .map((clause) => {
          const subValues = [];
          const subClause = buildWhereClause(clause, subValues, prefix);
          values.push(...subValues);
          return `(${subClause})`;
        })
        .filter(Boolean);

      if (orConditions.length) {
        conditions.push(orConditions.join(' OR '));
      }
      continue;
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      for (const [operator, operand] of Object.entries(value)) {
        const normalizedOperator = operator.toUpperCase();
        if (!ALLOWED_OPERATORS.has(normalizedOperator)) {
          continue;
        }

        const column = sanitizeIdentifier(prefix ? `${prefix}.${key}` : key);
        if (normalizedOperator === 'IN' && Array.isArray(operand)) {
          const placeholders = operand.map(() => '?').join(', ');
          conditions.push(`${column} IN (${placeholders})`);
          values.push(...operand);
        } else {
          conditions.push(`${column} ${normalizedOperator} ?`);
          values.push(operand);
        }
      }
      continue;
    }

    const column = sanitizeIdentifier(prefix ? `${prefix}.${key}` : key);
    conditions.push(`${column} = ?`);
    values.push(value);
  }

  return conditions.join(' AND ');
}

function buildOrderByClause(orderBy = {}) {
  const clauses = [];
  for (const [column, direction] of Object.entries(orderBy)) {
    const safeColumn = sanitizeIdentifier(column);
    const safeDirection = String(direction).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    clauses.push(`${safeColumn} ${safeDirection}`);
  }
  return clauses.length ? `ORDER BY ${clauses.join(', ')}` : '';
}

function buildLimitClause(limit, offset) {
  const parts = [];
  if (typeof limit === 'number') {
    parts.push(`LIMIT ${Math.max(0, limit)}`);
  }
  if (typeof offset === 'number') {
    parts.push(`OFFSET ${Math.max(0, offset)}`);
  }
  return parts.join(' ');
}

module.exports = {
  buildWhereClause,
  buildOrderByClause,
  buildLimitClause,
};
