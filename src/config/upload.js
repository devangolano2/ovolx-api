const multer = require("multer")
const path = require("path")

module.exports = {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, "..", "..", "uploads"),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
      cb(null, uniqueSuffix + path.extname(file.originalname))
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/pjpeg", "image/png", "image/gif"]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Tipo de arquivo inválido."))
    }
  },
}

