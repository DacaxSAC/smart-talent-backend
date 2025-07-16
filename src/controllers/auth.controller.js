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
      res.status(201).json(result);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      const statusCode = error.message === 'El usuario o correo electrónico ya está registrado' ? 400 : 
                        error.message.includes('Error al asignar rol') ? 500 : 500;
      res.status(statusCode).json({ message: error.message });
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
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      const statusCode = error.message === 'Credenciales inválidas' ? 401 : 
                        error.message === 'Usuario inactivo' ? 401 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      const result = await AuthService.getUserProfile(req.userId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
};

module.exports = { AuthController };