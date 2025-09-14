"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockPrueba = exports.createMockCiente = exports.createMockTecnica = exports.createMockRol = exports.createMockMuestra = exports.createMockSolicitud = exports.createMockUsuario = void 0;
const createMockUsuario = (overrides = {}) => ({
    id_usuario: 1,
    nombre: 'Mock User',
    username: 'mockuser',
    email: 'mock@example.com',
    passwordhash: 'mockhash',
    id_rol: 1,
    created_by: 1,
    updated_by: 1,
    update_dt: new Date(),
    ...overrides,
});
exports.createMockUsuario = createMockUsuario;
const createMockSolicitud = (overrides = {}) => ({
    id_solicitud: 1,
    num_solicitud: 'REQ-001',
    id_cliente: 1,
    f_creacion: new Date(),
    f_entrada: new Date(),
    estado_solicitud: 'EN_PROCESO',
    update_dt: new Date(),
    created_by: 1,
    updated_by: 1,
    ...overrides,
});
exports.createMockSolicitud = createMockSolicitud;
const createMockMuestra = (overrides = {}) => ({
    id_muestra: 1,
    id_prueba: 1,
    id_solicitud: 1,
    codigo_epi: 'M-001',
    id_tipo_muestra: 1,
    estado_muestra: 'CREADA',
    f_recepcion: new Date(),
    update_dt: new Date(),
    ...overrides,
});
exports.createMockMuestra = createMockMuestra;
const createMockRol = (overrides = {}) => ({
    id_rol: 1,
    name: 'admin',
    management_users: true,
    read_only: false,
    export: true,
    update_dt: new Date(),
    ...overrides,
});
exports.createMockRol = createMockRol;
const createMockTecnica = (overrides = {}) => ({
    id_tecnica: 1,
    id_muestra: 1,
    id_tecnica_proc: 1,
    id_tecnico_resp: 1,
    fecha_inicio_tec: new Date(),
    estado: 'EnProceso',
    fecha_estado: new Date(),
    comentarios: 'mock comentario',
    update_dt: new Date(),
    ...overrides,
});
exports.createMockTecnica = createMockTecnica;
const createMockCiente = (overrides = {}) => ({
    id: 1,
    nombre: 'Mock Cliente',
    razon_social: 'Mock Razon Social',
    nif: '12345678A',
    direccion: 'Mock Direccion',
    activo: true,
    created_by: 1,
    updated_dt: new Date(),
    delete_dt: null,
    ...overrides,
});
exports.createMockCiente = createMockCiente;
const createMockPrueba = (overrides = {}) => ({
    id: 1,
    cod_prueba: 'Cod Prueba',
    prueba: 'Mock Prueba',
    activa: true,
    created_by: 1,
    updated_dt: new Date(),
    ...overrides,
});
exports.createMockPrueba = createMockPrueba;
