const { validateDocument } = require('../utils/documentValidation.cjs')

const uploadDocument = async (req, res) => {
  const documentType = req.body.documentType || 'Unknown Document Type'

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No document file was uploaded.' })
  }

  const validation = validateDocument({ fileName: req.file.originalname, documentType })

  const document = {
    originalName: req.file.originalname,
    storageName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`,
  }

  return res.status(201).json({
    success: true,
    message: 'Document uploaded and validated successfully.',
    document,
    validation,
  })
}

module.exports = { uploadDocument }
