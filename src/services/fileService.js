const File = require('../models/File');
const fs = require('fs');
const path = require('path');

const uploadFiles = async (files, basketId, fileCategory) => {
  const uploadedFiles = [];

  for (const file of files) {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}h${String(now.getMinutes()).padStart(2, "0")}`;

    const fileSize =
      file.size < 1024
        ? `${file.size} B`
        : file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(2)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    let fileType = 'other';
    if (['pdf'].includes(fileExtension)) fileType = 'pdf';
    else if (['doc', 'docx'].includes(fileExtension)) fileType = 'word';
    else if (['xls', 'xlsx'].includes(fileExtension)) fileType = 'excel';
    else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) fileType = 'image';
    else if (['zip', 'rar', '7z'].includes(fileExtension)) fileType = 'archive';

    const fileRecord = await File.create({
      name: file.originalname,
      size: fileSize,
      sentDate: formattedDate,
      type: fileType,
      path: file.path,
      basketId,
      fileCategory,
    });

    uploadedFiles.push(fileRecord);
  }

  return uploadedFiles;
};

const deleteFile = async (file) => {
  const filePath = path.join(__dirname, '..', file.path);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  await file.destroy();
};

module.exports = { uploadFiles, deleteFile };