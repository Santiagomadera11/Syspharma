// 🔴 UTILIDADES DE VALIDACIÓN EXHAUSTIVAS EN TIEMPO REAL
// Sistema completo de validaciones con mensajes en español

export interface ValidationResult {
  isValid: boolean;
  message: string;
  strength?: 'weak' | 'medium' | 'strong';
}

// =============================================
// 🔴 VALIDACIONES DE TEXTO Y NOMBRES
// =============================================

/**
 * Valida que el campo solo contenga letras, espacios, tildes y caracteres latinos
 */
export const validateOnlyLetters = (value: string, fieldName: string = 'Este campo'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} es obligatorio` };
  }
  
  const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!lettersRegex.test(value)) {
    return { isValid: false, message: `${fieldName} solo debe contener letras` };
  }
  
  if (value.length < 2) {
    return { isValid: false, message: `${fieldName} debe tener al menos 2 caracteres` };
  }
  
  if (value.length > 100) {
    return { isValid: false, message: `${fieldName} no puede exceder 100 caracteres` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida nombre completo (nombres + apellidos)
 */
export const validateFullName = (value: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'El nombre completo es obligatorio' };
  }
  
  const nameParts = value.trim().split(/\s+/);
  if (nameParts.length < 2) {
    return { isValid: false, message: 'Ingresa nombre y apellido' };
  }
  
  const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!lettersRegex.test(value)) {
    return { isValid: false, message: 'Solo debe contener letras' };
  }
  
  if (value.length < 5) {
    return { isValid: false, message: 'El nombre es muy corto' };
  }
  
  if (value.length > 100) {
    return { isValid: false, message: 'El nombre es muy largo (máx. 100 caracteres)' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida texto alfanumérico (letras, números, espacios, guiones)
 */
export const validateAlphanumeric = (value: string, fieldName: string = 'Este campo'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} es obligatorio` };
  }
  
  const alphanumericRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-_.]+$/;
  if (!alphanumericRegex.test(value)) {
    return { isValid: false, message: `${fieldName} contiene caracteres no válidos` };
  }
  
  return { isValid: true, message: '' };
};

// =============================================
// 🔴 VALIDACIONES NUMÉRICAS
// =============================================

/**
 * Valida que el input solo contenga números enteros positivos
 */
export const validateOnlyNumbers = (value: string, fieldName: string = 'Este campo'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} es obligatorio` };
  }
  
  const numbersRegex = /^\d+$/;
  if (!numbersRegex.test(value)) {
    return { isValid: false, message: `${fieldName} solo debe contener números` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida números decimales (precios, pesos, etc.)
 */
export const validateDecimalNumber = (value: string, fieldName: string = 'Este campo', decimals: number = 2): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} es obligatorio` };
  }
  
  // Permitir formato: 123 o 123.45 o 123,45
  const decimalRegex = new RegExp(`^\\d+([.,]\\d{1,${decimals}})?$`);
  if (!decimalRegex.test(value)) {
    return { isValid: false, message: `Formato inválido (ej: 123.45)` };
  }
  
  const numValue = parseFloat(value.replace(',', '.'));
  if (numValue <= 0) {
    return { isValid: false, message: `${fieldName} debe ser mayor a 0` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida precio (número positivo con hasta 2 decimales)
 */
export const validatePrice = (value: string, min: number = 0.01): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'El precio es obligatorio' };
  }
  
  const priceRegex = /^\d+([.,]\d{1,2})?$/;
  if (!priceRegex.test(value)) {
    return { isValid: false, message: 'Formato inválido (ej: 1250.50)' };
  }
  
  const numValue = parseFloat(value.replace(',', '.'));
  if (numValue < min) {
    return { isValid: false, message: `Debe ser mayor o igual a $${min}` };
  }
  
  if (numValue > 999999999) {
    return { isValid: false, message: 'El precio es muy alto' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida cantidad/stock (entero positivo)
 */
export const validateQuantity = (value: string, min: number = 0, max: number = 999999): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'La cantidad es obligatoria' };
  }
  
  const quantityRegex = /^\d+$/;
  if (!quantityRegex.test(value)) {
    return { isValid: false, message: 'Solo números enteros' };
  }
  
  const numValue = parseInt(value);
  if (numValue < min) {
    return { isValid: false, message: `Mínimo: ${min}` };
  }
  
  if (numValue > max) {
    return { isValid: false, message: `Máximo: ${max}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida porcentaje (0-100)
 */
export const validatePercentage = (value: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'El porcentaje es obligatorio' };
  }
  
  const percentRegex = /^\d+([.,]\d{1,2})?$/;
  if (!percentRegex.test(value)) {
    return { isValid: false, message: 'Formato inválido (ej: 15.5)' };
  }
  
  const numValue = parseFloat(value.replace(',', '.'));
  if (numValue < 0 || numValue > 100) {
    return { isValid: false, message: 'Debe estar entre 0 y 100' };
  }
  
  return { isValid: true, message: '' };
};

// =============================================
// 🔴 VALIDACIONES DE CONTACTO
// =============================================

/**
 * Valida email con formato correcto
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'El email es obligatorio' };
  }
  
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Email inválido (ej: usuario@ejemplo.com)' };
  }
  
  if (email.length > 100) {
    return { isValid: false, message: 'El email es muy largo' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida teléfono (8-15 dígitos, puede incluir + al inicio)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: 'El teléfono es obligatorio' };
  }
  
  // Permitir formato: +56912345678, 912345678, 12345678
  const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\d{8,15}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { isValid: false, message: 'Teléfono inválido (8-15 dígitos)' };
  }
  
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 8) {
    return { isValid: false, message: 'Mínimo 8 dígitos' };
  }
  
  if (digitsOnly.length > 15) {
    return { isValid: false, message: 'Máximo 15 dígitos' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida dirección física
 */
export const validateAddress = (address: string): ValidationResult => {
  if (!address || address.trim() === '') {
    return { isValid: false, message: 'La dirección es obligatoria' };
  }
  
  if (address.length < 10) {
    return { isValid: false, message: 'La dirección es muy corta (mín. 10 caracteres)' };
  }
  
  if (address.length > 200) {
    return { isValid: false, message: 'La dirección es muy larga (máx. 200 caracteres)' };
  }
  
  return { isValid: true, message: '' };
};

// =============================================
// 🔴 VALIDACIONES DE CÓDIGOS E IDENTIFICACIÓN
// =============================================

/**
 * Valida código alfanumérico (productos, órdenes, etc.)
 */
export const validateCode = (code: string, minLength: number = 3, maxLength: number = 20): ValidationResult => {
  if (!code || code.trim() === '') {
    return { isValid: false, message: 'El código es obligatorio' };
  }
  
  const codeRegex = /^[A-Z0-9\-_]+$/;
  if (!codeRegex.test(code.toUpperCase())) {
    return { isValid: false, message: 'Formato inválido (ej: PROD-001)' };
  }
  
  if (code.length < minLength) {
    return { isValid: false, message: `Mínimo ${minLength} caracteres` };
  }
  
  if (code.length > maxLength) {
    return { isValid: false, message: `Máximo ${maxLength} caracteres` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida RUT chileno
 */
export const validateRUT = (rut: string): ValidationResult => {
  if (!rut || rut.trim() === '') {
    return { isValid: false, message: 'El RUT es obligatorio' };
  }
  
  // Limpiar formato: quitar puntos y guión
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');
  
  // Formato: 12345678-9 o 12345678-K
  const rutRegex = /^\d{7,8}[0-9Kk]$/;
  if (!rutRegex.test(cleanRut)) {
    return { isValid: false, message: 'RUT inválido (ej: 12345678-9)' };
  }
  
  // Validar dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
  
  if (dv !== calculatedDV) {
    return { isValid: false, message: 'RUT inválido (dígito verificador incorrecto)' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida DNI/Cédula (números de 7-10 dígitos)
 */
export const validateDNI = (dni: string): ValidationResult => {
  if (!dni || dni.trim() === '') {
    return { isValid: false, message: 'El DNI es obligatorio' };
  }
  
  const dniRegex = /^\d{7,10}$/;
  if (!dniRegex.test(dni)) {
    return { isValid: false, message: 'DNI inválido (7-10 dígitos)' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida NIT (9-10 dígitos)
 */
export const validateNIT = (nit: string): ValidationResult => {
  if (!nit || nit.trim() === '') {
    return { isValid: false, message: 'El NIT es obligatorio' };
  }
  
  const nitRegex = /^\d{9,10}$/;
  if (!nitRegex.test(nit.replace(/\D/g, ''))) {
    return { isValid: false, message: 'NIT inválido (9-10 dígitos)' };
  }
  
  return { isValid: true, message: '' };
};

// =============================================
// 🔴 VALIDACIONES DE CONTRASEÑA Y SEGURIDAD
// =============================================

/**
 * Valida contraseña con niveles de fortaleza
 */
export const validatePassword = (password: string): ValidationResult & { strength: 'weak' | 'medium' | 'strong' } => {
  if (!password || password.trim() === '') {
    return { isValid: false, message: 'La contraseña es obligatoria', strength: 'weak' };
  }
  
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(password);
  
  if (!hasMinLength) {
    return { isValid: false, message: 'Mínimo 8 caracteres', strength: 'weak' };
  }
  
  if (!hasUpperCase) {
    return { isValid: false, message: 'Debe contener mayúsculas', strength: 'weak' };
  }
  
  if (!hasLowerCase) {
    return { isValid: false, message: 'Debe contener minúsculas', strength: 'weak' };
  }
  
  if (!hasNumber) {
    return { isValid: false, message: 'Debe contener números', strength: 'medium' };
  }
  
  if (password.length < 12 && !hasSymbol) {
    return { isValid: true, message: 'Considera añadir símbolos (!@#$)', strength: 'medium' };
  }
  
  const strength = (hasSymbol && password.length >= 12) ? 'strong' : 'medium';
  return { isValid: true, message: '', strength };
};

/**
 * Valida confirmación de contraseña
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, message: 'Confirma tu contraseña' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Las contraseñas no coinciden' };
  }
  
  return { isValid: true, message: '' };
};

// =============================================
// 🔴 VALIDACIONES GENERALES
// =============================================

/**
 * Valida campo obligatorio genérico
 */
export const validateRequired = (value: string | number | boolean, fieldName: string = 'Este campo'): ValidationResult => {
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, message: `${fieldName} es obligatorio` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida longitud mínima
 */
export const validateMinLength = (value: string, minLength: number, fieldName: string = 'Este campo'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} es obligatorio` };
  }
  
  if (value.length < minLength) {
    return { isValid: false, message: `Mínimo ${minLength} caracteres` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida longitud máxima
 */
export const validateMaxLength = (value: string, maxLength: number, fieldName: string = 'Este campo'): ValidationResult => {
  if (value && value.length > maxLength) {
    return { isValid: false, message: `Máximo ${maxLength} caracteres` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida rango de longitud
 */
export const validateLengthRange = (value: string, minLength: number, maxLength: number, fieldName: string = 'Este campo'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} es obligatorio` };
  }
  
  if (value.length < minLength) {
    return { isValid: false, message: `Mínimo ${minLength} caracteres` };
  }
  
  if (value.length > maxLength) {
    return { isValid: false, message: `Máximo ${maxLength} caracteres` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida selección múltiple
 */
export const validateMinSelection = (selected: string[] | any[], min: number = 1): ValidationResult => {
  if (!selected || selected.length < min) {
    return { isValid: false, message: `Selecciona al menos ${min} opción${min > 1 ? 'es' : ''}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida URL
 */
export const validateURL = (url: string): ValidationResult => {
  if (!url || url.trim() === '') {
    return { isValid: false, message: 'La URL es obligatoria' };
  }
  
  const urlRegex = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d-]+(\/[\w\d-._~:/?#[\]@!$&'()*+,;=]*)?$/;
  if (!urlRegex.test(url)) {
    return { isValid: false, message: 'URL inválida (ej: https://ejemplo.com)' };
  }
  
  return { isValid: true, message: '' };
};

// =============================================
// 🔴 VALIDACIONES DE FECHA Y TIEMPO
// =============================================

/**
 * Valida fecha futura
 */
export const validateFutureDate = (date: string | Date): ValidationResult => {
  if (!date) {
    return { isValid: false, message: 'La fecha es obligatoria' };
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return { isValid: false, message: 'La fecha debe ser futura' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida fecha pasada
 */
export const validatePastDate = (date: string | Date): ValidationResult => {
  if (!date) {
    return { isValid: false, message: 'La fecha es obligatoria' };
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (selectedDate > today) {
    return { isValid: false, message: 'La fecha no puede ser futura' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida rango de fechas
 */
export const validateDateRange = (startDate: string | Date, endDate: string | Date): ValidationResult => {
  if (!startDate || !endDate) {
    return { isValid: false, message: 'Ambas fechas son obligatorias' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return { isValid: false, message: 'La fecha inicial debe ser anterior a la final' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida formato de hora (HH:MM)
 */
export const validateTime = (time: string): ValidationResult => {
  if (!time || time.trim() === '') {
    return { isValid: false, message: 'La hora es obligatoria' };
  }
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { isValid: false, message: 'Formato inválido (HH:MM)' };
  }
  
  return { isValid: true, message: '' };
};

// =============================================
// 🔴 VALIDACIONES DE UNICIDAD
// =============================================

/**
 * Valida que un código/email/valor sea único
 */
export const validateUnique = (value: string, existingValues: string[], fieldName: string = 'Este valor'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} es obligatorio` };
  }
  
  if (existingValues.includes(value.toLowerCase())) {
    return { isValid: false, message: `${fieldName} ya existe` };
  }
  
  return { isValid: true, message: '' };
};

// =============================================
// 🔴 FUNCIONES HELPER PARA FORMATEO
// =============================================

/**
 * Permite solo números en input
 */
export const onlyNumbers = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Permite solo letras en input
 */
export const onlyLetters = (value: string): string => {
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
};

/**
 * Formatea precio para mostrar
 */
export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(value);
};

/**
 * Formatea RUT chileno (12345678-9)
 */
export const formatRUT = (rut: string): string => {
  const cleaned = rut.replace(/\D/g, '');
  if (cleaned.length <= 1) return cleaned;
  
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
};

/**
 * Formatea teléfono
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  return `+${cleaned.slice(0, -8)} ${cleaned.slice(-8, -4)}-${cleaned.slice(-4)}`;
};
