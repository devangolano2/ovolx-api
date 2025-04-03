const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');
const uploadConfig = require('../config/upload');

const upload = multer(uploadConfig);

// Rotas públicas
router.post('/register', upload.single('photo'), authController.register);
router.post('/login', authController.login);
router.post('/users/document', authController.getUsersByDocument);

// Rotas protegidas
router.put('/users/profile', 
  authMiddleware, 
  upload.single('photo'), 
  authController.updateUser
);

router.get('/users/profile',
  authMiddleware,
  authController.getProfile
);

// Nova rota para excluir foto de perfil
router.delete('/user/delete-photo',
  authMiddleware,
  authController.deletePhoto
);

module.exports = router;