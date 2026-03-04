const { body, param, validationResult } = require('express-validator');

/**
 * Middleware que revisa el resultado de las validaciones
 * y devuelve 400 con los errores si los hay.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array().map((e) => e.msg).join(', '),
      errors: errors.array(),
    });
  }
  next();
};

/* ─── Auth ──────────────────────────────────────────────────────── */

const loginRules = [
  body('username').trim().notEmpty().withMessage('El usuario es obligatorio.'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  validate,
];

const registerRules = [
  body('username').trim().notEmpty().withMessage('El usuario es obligatorio.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres.'),
  validate,
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria.'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres.'),
  validate,
];

const resetPasswordRules = [
  param('userId').isUUID().withMessage('ID de usuario inválido.'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres.'),
  validate,
];

/* ─── Services ─────────────────────────────────────────────────── */

const createServiceRules = [
  body('name').trim().notEmpty().withMessage('El nombre del servicio es obligatorio.'),
  body('totalCost')
    .isFloat({ gt: 0 })
    .withMessage('El costo total debe ser un número mayor a 0.'),
  validate,
];

/* ─── Treasury ─────────────────────────────────────────────────── */

const registerPaymentRules = [
  body('userId').isUUID().withMessage('ID de usuario inválido.'),
  body('amountPaid')
    .isFloat({ gt: 0 })
    .withMessage('El monto debe ser un número mayor a 0.'),
  validate,
];

module.exports = {
  loginRules,
  registerRules,
  changePasswordRules,
  resetPasswordRules,
  createServiceRules,
  registerPaymentRules,
};
