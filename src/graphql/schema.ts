//src/graphql/schema.ts
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar JSON

  type Producto {
    id: ID!
    nombre: String!
    tecnicas: [Tecnica!]!
  }

  type Tecnica {
    id: ID!
    nombre: String!
    productoId: ID!
    maquinaId: ID
    parametros: JSON
  }

  type Resultado {
    id: ID!
    valor: String
    unidad: String
    fechaResultado: String
  }

  type TecnicaMuestra {
    tecnicaId: ID!
    resultados: [Resultado!]!
  }

  type ProductoMuestra {
    productoId: ID!
    tecnicas: [TecnicaMuestra!]!
  }

  type Muestra {
    id: ID!
    identificacionExterna: String!
    codigoInterno: String!
    fechaIngreso: String!
    estado: String!
    ubicacion: String!
    productos: [ProductoMuestra!]!
  }

  type Placa {
    id: ID!
    codigoPlaca: String!
    estado: String!
    numeroMuestras: Int!
    muestras: [PlacaMuestra!]!
  }

  type PlacaMuestra {
    id: ID!
    posicion: String!
  }

  type Maquina {
    id: ID!
    nombre: String!
    tipo: String!
  }

  type Usuario {
    id: ID!
    nombre: String!
    email: String!
    rol: String!
    fechaCreacion: String!
  }

  type Perfil {
    rol: String!
    permisos: [String!]!
  }

  type Query {
    productos: [Producto!]!
    producto(id: ID!): Producto

    tecnicas: [Tecnica!]!
    tecnica(id: ID!): Tecnica

    muestras: [Muestra!]!
    muestra(id: ID!): Muestra

    placas: [Placa!]!
    placa(id: ID!): Placa

    maquinas: [Maquina!]!
    maquina(id: ID!): Maquina

    usuarios: [Usuario!]!
    usuario(id: ID!): Usuario

    perfiles: [Perfil!]!
    perfil(rol: String!): Perfil
  }

  type Mutation {
    createProducto(nombre: String!, tecnicas: [ID!]!): Producto!
    updateProducto(id: ID!, nombre: String, tecnicas: [ID!]): Producto!
    deleteProducto(id: ID!): Boolean!

    createTecnica(
      nombre: String!
      productoId: ID!
      maquinaId: ID
      parametros: JSON
    ): Tecnica!
    updateTecnica(
      id: ID!
      nombre: String
      productoId: ID
      maquinaId: ID
      parametros: JSON
    ): Tecnica!
    deleteTecnica(id: ID!): Boolean!

    createMuestra(
      identificacionExterna: String!
      codigoInterno: String!
      fechaIngreso: String!
      estado: String!
      ubicacion: String!
      productos: [ProductoMuestraInput!]!
    ): Muestra!
    updateMuestra(
      id: ID!
      identificacionExterna: String
      codigoInterno: String
      fechaIngreso: String
      estado: String
      ubicacion: String
    ): Muestra!
    deleteMuestra(id: ID!): Boolean!

    createPlaca(
      codigoPlaca: String!
      estado: String!
      numeroMuestras: Int!
      muestras: [PlacaMuestraInput!]!
    ): Placa!
    updatePlaca(
      id: ID!
      codigoPlaca: String
      estado: String
      numeroMuestras: Int
    ): Placa!
    deletePlaca(id: ID!): Boolean!

    createMaquina(nombre: String!, tipo: String!): Maquina!
    updateMaquina(id: ID!, nombre: String, tipo: String): Maquina!
    deleteMaquina(id: ID!): Boolean!

    createUsuario(
      nombre: String!
      email: String!
      rol: String!
      fechaCreacion: String!
    ): Usuario!
    updateUsuario(id: ID!, nombre: String, email: String, rol: String): Usuario!
    deleteUsuario(id: ID!): Boolean!

    createPerfil(rol: String!, permisos: [String!]!): Perfil!
    updatePerfil(rol: String!, permisos: [String!]!): Perfil!
    deletePerfil(rol: String!): Boolean!
  }

  type Subscription {
    muestraActualizada: Muestra!
  }

  input ProductoMuestraInput {
    productoId: ID!
    tecnicas: [TecnicaMuestraInput!]!
  }

  input TecnicaMuestraInput {
    tecnicaId: ID!
  }

  input PlacaMuestraInput {
    id: ID!
    posicion: String!
  }
`;
