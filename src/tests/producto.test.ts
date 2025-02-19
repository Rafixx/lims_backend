// src/tests/producto.test.ts
import request from 'supertest';
import express from 'express';
import productoRoutes from '../routes/producto.routes';

const app = express();
app.use(express.json());
app.use('/api/productos', productoRoutes);

describe('Producto API Endpoints', () => {
  // GET /api/productos
  it('should return all productos', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // GET /api/productos/:id
  it('should return a single producto by id', async () => {
    // Se asume que ya existe un producto con id 'prod1' en la base de datos in-memory
    const res = await request(app).get('/api/productos/prod1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'prod1');
  });

  // POST /api/productos
  it('should create a new producto', async () => {
    const newProducto = {
      nombre: 'Producto de Test',
      tecnicas: ['tec1', 'tec2'],
    };
    const res = await request(app).post('/api/productos').send(newProducto);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe(newProducto.nombre);
    expect(Array.isArray(res.body.tecnicas)).toBe(true);
  });

  // PUT /api/productos/:id
  it('should update an existing producto', async () => {
    // Primero, se crea un producto para actualizar
    const newProducto = {
      nombre: 'Producto a actualizar',
      tecnicas: ['tec3'],
    };
    const createRes = await request(app)
      .post('/api/productos')
      .send(newProducto);
    const createdProducto = createRes.body;

    // Ahora, se actualiza el producto
    const updatedData = { nombre: 'Producto Actualizado' };
    const updateRes = await request(app)
      .put(`/api/productos/${createdProducto.id}`)
      .send(updatedData);
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.nombre).toBe(updatedData.nombre);
  });

  // DELETE /api/productos/:id
  it('should delete an existing producto', async () => {
    // Primero, se crea un producto para eliminar
    const newProducto = {
      nombre: 'Producto a eliminar',
      tecnicas: ['tec4'],
    };
    const createRes = await request(app)
      .post('/api/productos')
      .send(newProducto);
    const productoId = createRes.body.id;

    // Se elimina el producto
    const deleteRes = await request(app).delete(`/api/productos/${productoId}`);
    expect(deleteRes.status).toBe(204);

    // Se verifica que ya no exista
    const getRes = await request(app).get(`/api/productos/${productoId}`);
    expect(getRes.status).toBe(404);
  });
});
