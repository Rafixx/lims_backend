export const parseDate = (value?: string): Date | undefined => {
  return value ? new Date(value) : undefined;
};

/**
 * Parsea una fecha en formato español DD/MM/YYYY HH:MM:SS o DD/MM/YYYY
 * @param dateString - String con la fecha en formato DD/MM/YYYY [HH:MM:SS]
 * @param fallbackToCurrent - Si es true, devuelve la fecha actual en caso de error. Si es false, devuelve undefined
 * @returns Date parseada o fecha actual/undefined según fallbackToCurrent
 *
 * @example
 * parseDateES('31/03/2025 17:27:38') // 2025-03-31T17:27:38
 * parseDateES('31/03/2025') // 2025-03-31T00:00:00
 * parseDateES('invalid', true) // new Date() (fecha actual)
 * parseDateES('invalid', false) // undefined
 */
export const parseDateES = (
  dateString?: string,
  fallbackToCurrent: boolean = true
): Date | undefined => {
  if (!dateString) {
    return fallbackToCurrent ? new Date() : undefined;
  }

  try {
    const dateStr = dateString.trim();
    const dateTimeParts = dateStr.split(' ');
    const dateParts = dateTimeParts[0].split('/');

    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Los meses en JS son 0-11
      const year = parseInt(dateParts[2], 10);

      let hours = 0,
        minutes = 0,
        seconds = 0;

      // Parsear la hora si existe
      if (dateTimeParts.length > 1) {
        const timeParts = dateTimeParts[1].split(':');
        hours = parseInt(timeParts[0] || '0', 10);
        minutes = parseInt(timeParts[1] || '0', 10);
        seconds = parseInt(timeParts[2] || '0', 10);
      }

      const parsedDate = new Date(year, month, day, hours, minutes, seconds);

      // Validar que la fecha sea válida
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Si llegamos aquí, el formato no es válido
    console.warn(
      `⚠️ Formato de fecha no reconocido: ${dateString}${fallbackToCurrent ? ', usando fecha actual' : ''}`
    );
    return fallbackToCurrent ? new Date() : undefined;
  } catch (error) {
    console.warn(
      `⚠️ Error parseando fecha: ${error}${fallbackToCurrent ? ', usando fecha actual' : ''}`
    );
    return fallbackToCurrent ? new Date() : undefined;
  }
};
