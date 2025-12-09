import { useState, useEffect } from 'react';

interface ValidationResult {
  isValid: boolean;
  isChecking: boolean;
  message: string;
}

export function useDocumentValidation(
  documento: string,
  existingDocuments: string[],
  currentDocumento?: string // Para edición, ignorar el documento actual
) {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    isChecking: false,
    message: ''
  });

  useEffect(() => {
    if (!documento || documento.length < 5) {
      setValidation({
        isValid: true,
        isChecking: false,
        message: ''
      });
      return;
    }

    // Si es edición y el documento no cambió, no validar
    if (currentDocumento && documento === currentDocumento) {
      setValidation({
        isValid: true,
        isChecking: false,
        message: ''
      });
      return;
    }

    // Simular delay de validación en tiempo real
    setValidation(prev => ({ ...prev, isChecking: true }));
    
    const timer = setTimeout(() => {
      const exists = existingDocuments.some(
        doc => doc.toLowerCase() === documento.toLowerCase()
      );

      setValidation({
        isValid: !exists,
        isChecking: false,
        message: exists ? 'Este documento ya está registrado' : ''
      });
    }, 300); // Pequeño delay para evitar validaciones excesivas

    return () => clearTimeout(timer);
  }, [documento, existingDocuments, currentDocumento]);

  return validation;
}
