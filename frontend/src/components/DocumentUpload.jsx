import { useState } from 'react'
import { Upload, FileText, ArrowRight } from 'lucide-react'
import { DOCUMENT_TYPES } from '../utils/documentValidation.js'
import { uploadDocument } from '../utils/api.js'

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const badgeStyles = {
  accept: { background: 'rgba(16,185,129,0.12)', color: '#047857' },
  caution: { background: 'rgba(245,158,11,0.12)', color: '#92400e' },
  reject: { background: 'rgba(220,38,38,0.12)', color: '#991b1b' },
  review: { background: 'rgba(59,130,246,0.12)', color: '#1d4ed8' },
}

export default function DocumentUpload() {
  const [file, setFile] = useState(null)
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0])
  const [serverResult, setServerResult] = useState(null)
  const [uploadedAt, setUploadedAt] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return
    setFile(selectedFile)
    setServerResult(null)
    setUploadedAt(null)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    setError(null)
    setServerResult(null)

    try {
      const result = await uploadDocument(file, documentType)
      setUploadedAt(new Date())
      setServerResult(result)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragActive(false)
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  const validation = serverResult?.validation
  const storageName = serverResult?.document?.storageName

  return (
    <div className="document-upload-shell glass-card">
      <div className="document-upload-header">
        <div>
          <div className="tag" style={{ marginBottom: 10 }}>Document Upload</div>
          <h2 style={{ fontSize: 28, marginBottom: 12, color: 'var(--navy)' }}>Legal Verification Demo</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, maxWidth: 640 }}>
            Upload India-specific legal documents for real backend validation. The server stores the file and returns authenticity recommendations for e-Katha, A-Katha, B-Katha, and other titles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
          <div className="status-pill" style={{ background: 'rgba(16,185,129,0.12)', color: '#047857' }}>Accepted</div>
          <div className="status-pill" style={{ background: 'rgba(245,158,11,0.12)', color: '#92400e' }}>Caution</div>
          <div className="status-pill" style={{ background: 'rgba(220,38,38,0.12)', color: '#991b1b' }}>Rejected</div>
          <div className="status-pill" style={{ background: 'rgba(59,130,246,0.12)', color: '#1d4ed8' }}>Review</div>
        </div>
      </div>

      <div className="document-upload-body">
        <div className="document-upload-panel">
          <div
            className={`document-upload-dropzone ${dragActive ? 'active' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
          >
            <Upload size={28} color="#b08d57" />
            <div>
              <strong>Drag & drop a document here</strong>
              <p>or click to select a file</p>
            </div>
            <input
              type="file"
              accept="application/pdf,image/*"
              className="document-upload-input"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
          </div>

          <div className="document-upload-controls">
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ color: 'var(--muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Document Type</label>
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="input-field">
                {DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <button className="btn-primary" style={{ marginTop: 24, minWidth: 170 }} onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? 'Verifying...' : 'Verify Document'} <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="document-upload-status-grid">
          <div className="glass-card document-upload-summary">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <FileText size={18} color="#102a43" />
              <h3 style={{ margin: 0, fontSize: 18 }}>Document Details</h3>
            </div>
            {file ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <div className="document-upload-row"><span>File Name</span><strong>{file.name}</strong></div>
                <div className="document-upload-row"><span>File Size</span><strong>{formatFileSize(file.size)}</strong></div>
                <div className="document-upload-row"><span>Uploaded</span><strong>{uploadedAt ? uploadedAt.toLocaleString() : 'Not uploaded yet'}</strong></div>
                <div className="document-upload-row"><span>Document Type</span><strong>{documentType}</strong></div>
                {storageName && <div className="document-upload-row"><span>Server File</span><strong>{storageName}</strong></div>}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)' }}>No document selected yet. Drag a file into the upload box to begin.</p>
            )}

            {error && (
              <p style={{ marginTop: 16, color: '#b91c1c' }}>{error}</p>
            )}
          </div>

          {validation && (
            <div className="glass-card document-validation-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Validation Result</div>
                  <h3 style={{ margin: '8px 0 0', fontSize: 24, color: 'var(--navy)' }}>{validation.status}</h3>
                </div>
                <div style={{ ...badgeStyles[validation.badge], padding: '10px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                  {validation.risk}
                </div>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                <div className="document-validation-row"><span>Document Category</span><strong>{validation.category}</strong></div>
                <div className="document-validation-row"><span>Recommendation</span><strong>{validation.recommendation}</strong></div>
                <div className="document-validation-row"><span>Verifier Message</span><strong>{validation.message}</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
