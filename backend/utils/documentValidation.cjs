const validateDocument = ({ fileName = '', documentType = '' }) => {
  const normalized = `${fileName} ${documentType}`.toLowerCase()

  if (normalized.includes('b-katha')) {
    return {
      category: documentType || 'Document',
      risk: 'High Risk',
      status: 'Rejected',
      recommendation: 'Do not accept until the issue is resolved.',
      message: 'B-Katha documents typically signal high encumbrance or title issues. Escalate for legal review.',
      badge: 'reject',
    }
  }

  if (normalized.includes('a-katha')) {
    return {
      category: documentType || 'Document',
      risk: 'Medium Risk',
      status: 'Caution',
      recommendation: 'Review carefully and confirm all supporting papers.',
      message: 'A-Katha indicates conditional ownership and may require additional verification.',
      badge: 'caution',
    }
  }

  if (normalized.includes('e-katha')) {
    return {
      category: documentType || 'Document',
      risk: 'Low Risk',
      status: 'Accepted',
      recommendation: 'Proceed with confidence.',
      message: 'e-Katha validation is strong for this demo scenario.',
      badge: 'accept',
    }
  }

  return {
    category: documentType || 'Document',
    risk: 'Manual Review Required',
    status: 'Manual Review',
    recommendation: 'Submit the document for human verification.',
    message: 'This document requires a manual review by the legal verification team.',
    badge: 'review',
  }
}

module.exports = { validateDocument }
