// src/tests/integration/solicitud.routes.test.ts
import request from 'supertest';
import app from '../../app';

const createDataContext = async () => {
  // Crear previamente un cliente válido
  const cliente = await request(app).post('/api/clientes').send({
    nombre: 'Cliente Test',
    nif: '12345678A',
    direccion: 'Dirección Test',
  });
  //crear previamente una prueba válida
  const prueba = await request(app).post('/api/pruebas').send({
    cod_prueba: 'Prueba Test',
    prueba: 'Descripción de prueba',
  });

  // Crear previamente una solicitud válida
  const solicitud = await request(app).post('/api/solicitudes').send({
    num_solicitud: 'REQ-GET-TEST',
    id_cliente: cliente.body.id,
    id_prueba: prueba.body.id,
    f_entrada: new Date().toISOString(),
    f_compromiso: new Date().toISOString(),
    f_creacion: new Date().toISOString(),
    estado_solicitud: 'CREADA',
    created_by: 1,
    updated_by: 1,
  });
  return {
    cliente: cliente,
    prueba: prueba,
    solicitud: solicitud,
  };
};

describe('Solicitud Routes - Integration', () => {
  describe('POST /api/solicitudes', () => {
    it('debería crear una nueva solicitud', async () => {
      // Crear el contexto de datos necesario
      const { solicitud } = await createDataContext();

      expect(solicitud.status).toBe(201);
      expect(solicitud.body).toHaveProperty('id_solicitud');
      //comprobar que la solicitud creada tiene el valor num_solicitud
      expect(solicitud.body.num_solicitud).toBe('REQ-GET-TEST');
    });
  });

  describe('GET /api/solicitudes', () => {
    it('debería devolver la lista de solicitudes con relaciones', async () => {
      // Crear el contexto de datos necesario
      await createDataContext();
      const response = await request(app).get('/api/solicitudes');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const solicitud = response.body[0];
      expect(solicitud).toHaveProperty('cliente');
      expect(solicitud.cliente).toHaveProperty('nombre');
      expect(solicitud).toHaveProperty('prueba');
      expect(solicitud.prueba).toHaveProperty('prueba');
    });
  });
});
