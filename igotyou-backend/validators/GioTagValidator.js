const { body,param, validationResult } = require('express-validator')


exports.isIdMongoID = [
    param('id').isMongoId().withMessage('Invalid ID format'),
    body('_id').optional().isMongoId().withMessage('Invalid ID format')
];
exports.newTagValidation = [
    body('name').isString().notEmpty().withMessage('Name is required and should be a string.'),
    body('phoneNumber').isString().notEmpty().withMessage('Phone number is mandatory')
]
exports.getTagValidation = [
    param('id').isString().notEmpty().withMessage('ID Must be a UUID')
]

exports.validate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }))
  
    return res.status(422).json({
      errors: extractedErrors,
    })
  }