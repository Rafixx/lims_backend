import { Muestra } from './tipos';
import { updateMuestraEstado } from '../controllers/muestras.controller';

// Función que genera entre 5 y 8 resultados para cada técnica.
function createResultados(
  sampleIndex: number,
  prodIndex: number,
  tecnicaIndex: number
): any[] {
  // Se varía el número de resultados: 5 + (tecnicaIndex % 4) dará un valor entre 5 y 8.
  const count = 5 + (tecnicaIndex % 4);
  const resultados = [];
  for (let i = 0; i < count; i++) {
    resultados.push({
      id: `muestra${sampleIndex}_prod${prodIndex}_tec${tecnicaIndex}_res${i + 1}`,
      // Alterna entre "positivo" y "negativo" según el índice.
      valor: i % 2 === 0 ? 'positivo' : 'negativo',
      unidad: null,
      // Se calcula una fecha de resultado a partir de la técnica y el índice.
      fechaResultado: new Date(
        2025,
        1,
        15,
        10,
        tecnicaIndex * 10 + i * 5
      ).toISOString(),
    });
  }
  return resultados;
}

// Función que genera un array de técnicas para un producto.
// El parámetro "count" define cuántas técnicas se crearán (entre 5 y 7).
function createTecnicas(
  sampleIndex: number,
  prodIndex: number,
  count: number
): any[] {
  const tecnicas = [];
  for (let t = 0; t < count; t++) {
    tecnicas.push({
      tecnicaId: `tec${sampleIndex}_${prodIndex}_${t + 1}`,
      nombre: `Técnica ${t + 1}`,
      estado: 'En Proceso',
      resultados: createResultados(sampleIndex, prodIndex, t + 1),
    });
  }
  return tecnicas;
}

// Función que crea un producto para una muestra.
// Se generan entre 5 y 7 técnicas (usando 5 + (prodIndex % 3) para variar).
function createProducto(sampleIndex: number, prodIndex: number): any {
  const numTecnicas = 5 + (prodIndex % 3); // Puede ser 5, 6 o 7
  return {
    productoId: `prod${sampleIndex}_${prodIndex}`,
    nombre: `Producto ${prodIndex}`,
    estado: 'En Proceso',
    tecnicas: createTecnicas(sampleIndex, prodIndex, numTecnicas),
  };
}

// Genera el array de muestras.
// Para cada muestra se generan entre 3 y 5 productos usando: 3 + (s % 3)
export const muestras: Muestra[] = [];

for (let s = 1; s <= 10; s++) {
  const numProductos = 3 + (s % 3); // Valores cíclicos: 4, 5, 3, 4, 5, …
  const productos = [];
  for (let p = 1; p <= numProductos; p++) {
    productos.push(createProducto(s, p));
  }
  muestras.push({
    id: `muestra${s}`,
    identificacionExterna: `EXT-${s.toString().padStart(3, '0')}`,
    codigoInterno: `INT-${s.toString().padStart(3, '0')}`,
    fechaIngreso: new Date(2025, 1, 15, 8, 30 + s).toISOString(),
    // Se alterna el estado entre "Pendiente", "En Curso" y "Finalizada" según el índice.
    estado: s % 3 === 0 ? 'Pendiente' : s % 3 === 1 ? 'En Curso' : 'Finalizada',
    // Se asigna la ubicación: muestra par tendrá ubicación en "Máquina maqX", impares en "Congelador A".
    ubicacion: s % 2 === 0 ? `Máquina maq${s}` : 'Congelador A',
    productos,
  });
}
