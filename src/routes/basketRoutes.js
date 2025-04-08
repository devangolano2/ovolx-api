const express = require('express');
const router = express.Router();
const path = require('path');
const basketController = require('../controllers/basketController');
const fileController = require('../controllers/fileController'); // Adicionado
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/', authMiddleware, basketController.createBasket);
router.get('/', authMiddleware, basketController.getBaskets);
router.get('/:id', authMiddleware, basketController.getBasketById);
router.put('/:id', authMiddleware, basketController.updateBasket);
router.delete('/:id', authMiddleware, basketController.deleteBasket);
router.post('/:id/files', authMiddleware, upload.array('files'), basketController.uploadFiles);
router.delete('/files/:fileId', authMiddleware, basketController.deleteFile);
router.get('/:basketId/files', authMiddleware, fileController.getFilesByBasket); 
router.get('/files/:fileId/download', authMiddleware, fileController.downloadFile); 

module.exports = router;