const { validationResult } = require('express-validator');
const AuthService = require('../services/auth.service');

const AuthController = {
  // Registro de usuario
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await AuthService.registerUser(req.body);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        ...result
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
  },

  // Inicio de sesión
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await AuthService.loginUser(req.body);

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        ...result
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      const statusCode = error.message.includes('Credenciales inválidas') || error.message.includes('desactivado') ? 401 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      const user = await AuthService.getUserProfile(req.userId);
      res.status(200).json(user);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
};

module.exports = { AuthController };