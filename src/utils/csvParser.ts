// src/utils/csvParser.ts
import { parse } from 'csv-parse';
import { Readable } from 'stream';

export interface CSVRow {
  [key: string]: string;
}

/**
 * Detecta y decodifica el buffer según su encoding
 * @param buffer - Buffer del archivo
 * @returns String decodificado correctamente
 */
function decodeBuffer(buffer: Buffer): string {
  // Detectar BOM (Byte Order Mark)
  const bom = buffer.slice(0, 2);

  // UTF-16 LE (Little Endian)
  if (bom[0] === 0xff && bom[1] === 0xfe) {
    return buffer.toString('utf16le');
  }

  // UTF-16 BE (Big Endian)
  if (bom[0] === 0xfe && bom[1] === 0xff) {
    // Necesitamos swap de bytes para UTF-16 BE
    const swapped = Buffer.alloc(buffer.length);
    for (let i = 0; i < buffer.length; i += 2) {
      swapped[i] = buffer[i + 1];
      swapped[i + 1] = buffer[i];
    }
    return swapped.toString('utf16le');
  }

  // UTF-8 con BOM
  if (bom[0] === 0xef && bom[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.slice(3).toString('utf8');
  }

  // Por defecto UTF-8
  return buffer.toString('utf8');
}

/**
 * Parsea un buffer CSV y retorna un array de objetos
 * @param buffer - Buffer del archivo CSV
 * @param options - Opciones de parseo
 * @returns Promise con array de filas parseadas
 */
export async function parseCSV(
  buffer: Buffer,
  options?: {
    delimiter?: string;
    columns?: boolean | string[];
    skipEmptyLines?: boolean;
    trim?: boolean;
    relaxColumnCount?: boolean;
    relaxQuotes?: boolean;
    quote?: string | false;
  }
): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    const records: CSVRow[] = [];

    // Decodificar el buffer correctamente
    const content = decodeBuffer(buffer);
    const stream = Readable.from(content);

    const parser = parse({
      delimiter: options?.delimiter || ',',
      columns: options?.columns !== undefined ? options.columns : true,
      skip_empty_lines:
        options?.skipEmptyLines !== undefined ? options.skipEmptyLines : true,
      trim: options?.trim !== undefined ? options.trim : true,
      bom: true, // Maneja BOM (Byte Order Mark) en archivos UTF-8
      relax_column_count:
        options?.relaxColumnCount !== undefined
          ? options.relaxColumnCount
          : false,
      relax_quotes:
        options?.relaxQuotes !== undefined ? options.relaxQuotes : false,
      quote: options?.quote !== undefined ? options.quote : '"', // Por defecto comillas dobles
    });

    stream
      .pipe(parser)
      .on('data', (record: CSVRow) => {
        // Hacer trim manual de las claves (nombres de columnas)
        const cleanedRecord: CSVRow = {};
        for (const key in record) {
          const cleanKey = key.trim();
          cleanedRecord[cleanKey] = record[key];
        }
        records.push(cleanedRecord);
      })
      .on('error', (error) => {
        reject(new Error(`Error al parsear CSV: ${error.message}`));
      })
      .on('end', () => {
        resolve(records);
      });
  });
}

/**
 * Valida que el CSV tenga las columnas requeridas
 * @param records - Array de registros del CSV
 * @param requiredColumns - Array de nombres de columnas requeridas
 * @throws Error si falta alguna columna
 */
export function validateCSVColumns(
  records: CSVRow[],
  requiredColumns: string[]
): void {
  if (records.length === 0) {
    throw new Error('El archivo CSV está vacío');
  }

  const firstRow = records[0];
  const columns = Object.keys(firstRow);
  const missingColumns = requiredColumns.filter(
    (col) => !columns.includes(col)
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `Faltan columnas requeridas en el CSV: ${missingColumns.join(', ')}`
    );
  }
}
