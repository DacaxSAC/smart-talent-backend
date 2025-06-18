const { check } = require('express-validator');

// Validaciones para usuarios
const userValidation = {
  create: [
    check('username', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('username', 'El nombre de usuario debe tener al menos 3 caracteres').isLength({ min: 3 }),
    check('email', 'Por favor incluya un email válido').isEmail(),
    check('password', 'Por favor ingrese una contraseña con 6 o más caracteres').isLength({ min: 6 })
  ],
  
  update: [
    check('email', 'Por favor incluya un email válido').optional().isEmail(),
    check('username', 'El nombre de usuario debe tener al menos 3 caracteres').optional().isLength({ min: 3 })
  ]
};

const authValidation = {
  register: [
    check('username', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('username', 'El nombre de usuario debe tener al menos 3 caracteres').isLength({ min: 3 }),
    check('email', 'Por favor incluya un email válido').isEmail(),
    check('password', 'Por favor ingrese una contraseña con 6 o más caracteres').isLength({ min: 6 })
  ],
  
  login: [
    check('email', 'Por favor incluya un email válido').isEmail(),
    check('password', 'La contraseña es obligatoria').exists()
  ]
};

// Validaciones para roles
const roleValidation = {
  // Validación para crear rol
  create: [
    check('name', 'El nombre del rol es obligatorio').not().isEmpty(),
    // check('name', 'El nombre del rol debe ser uno de: ADMIN, USER, MANAGER, GUEST').isIn(['ADMIN', 'USER', 'MANAGER', 'GUEST']),
    check('description', 'La descripción del rol es obligatoria').not().isEmpty(),
    check('permissions', 'Los permisos deben ser un array').isArray()
  ],
  
  // Validación para actualizar rol
  update: [
    check('description', 'La descripción del rol es obligatoria').not().isEmpty(),
    check('permissions', 'Los permisos deben ser un array').isArray()
  ]
};

const entityValidation = {
  create: [
    check('type')
      .notEmpty().withMessage('El tipo de entidad es requerido')
      .isIn(['NATURAL', 'JURIDICA']).withMessage('El tipo debe ser NATURAL o JURIDICA'),
    check('documentNumber')
      .notEmpty().withMessage('El número de documento es requerido')
      .custom((value, { req }) => {
        if (req.body.type === 'NATURAL' && !/^\d{8}$/.test(value)) {
          throw new Error('El DNI debe tener 8 dígitos');
        }
        if (req.body.type === 'JURIDICA' && !/^\d{11}$/.test(value)) {
          throw new Error('El RUC debe tener 11 dígitos');
        }
        return true;
      }),
    check('email')
      .notEmpty().withMessage('El email es requerido')
      .isEmail().withMessage('Debe proporcionar un email válido'),
    check('firstName')
      .if(check('type').equals('NATURAL'))
      .notEmpty().withMessage('El nombre es requerido para personas naturales'),
    check('paternalSurname')
      .if(check('type').equals('NATURAL'))
      .notEmpty().withMessage('El apellido paterno es requerido para personas naturales'),
      check('maternalSurname')
        .if(check('type').equals('NATURAL'))
        .notEmpty().withMessage('El apellido materno es requerido para personas naturales'),
      check('phone')
        .notEmpty().withMessage('El número de teléfono es requerido'),
    check('businessName')
      .if(check('type').equals('JURIDICA'))
      .notEmpty().withMessage('La razón social es requerida para personas jurídicas')
  ],
  
  update: [
    check('type')
      .optional()
      .isIn(['NATURAL', 'JURIDICA']).withMessage('El tipo debe ser NATURAL o JURIDICA'),
    check('documentNumber')
      .optional()
      .custom((value, { req }) => {
        if (req.body.type === 'NATURAL' && !/^\d{8}$/.test(value)) {
          throw new Error('El DNI debe tener 8 dígitos');
        }
        if (req.body.type === 'JURIDICA' && !/^\d{11}$/.test(value)) {
          throw new Error('El RUC debe tener 11 dígitos');
        }
        return true;
      }),
    check('email')
      .optional()
      .isEmail().withMessage('Debe proporcionar un email válido'),
    check('active')
      .optional()
      .isBoolean().withMessage('El campo active debe ser un valor booleano')
  ]
};

module.exports = { userValidation, authValidation, roleValidation, entityValidation };