// Validation middleware for request validation

const validateMapping = (req, res, next) => {
  const { teamMemberId, projectName } = req.body;
  const errors = [];

  if (!teamMemberId || teamMemberId.trim() === '') {
    errors.push('teamMemberId is required');
  }

  if (!projectName || projectName.trim() === '') {
    errors.push('projectName is required and cannot be empty');
  }

  if (teamMemberId && teamMemberId.length > 255) {
    errors.push('teamMemberId must be less than 255 characters');
  }

  if (projectName && projectName.length > 255) {
    errors.push('projectName must be less than 255 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
};

const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      error: 'Page must be greater than 0'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be between 1 and 100'
    });
  }

  req.pagination = { page, limit };
  next();
};

module.exports = {
  validateMapping,
  validatePagination
};
