// Formatear fecha a formato local (DD/MM/YYYY)
const formatDate = (date) => {
  if (!date) return null

  const d = new Date(date)
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Formatear precio a formato de moneda (COP)
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "$ 0"

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Formatear nombre completo
const formatFullName = (nombre, apellido) => {
  if (!nombre && !apellido) return ""
  return `${nombre || ""} ${apellido || ""}`.trim()
}

// Sanitizar texto para evitar inyección de código
const sanitizeText = (text) => {
  if (!text) return ""

  return String(text).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

module.exports = {
  formatDate,
  formatCurrency,
  formatFullName,
  sanitizeText,
}

