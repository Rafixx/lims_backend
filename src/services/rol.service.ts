import { RolRepository } from '../repositories/rol.repository';

interface CreateRolDTO {
  name: string;
  management_users?: boolean;
  read_only?: boolean;
  export?: boolean;
}

export class RolService {
  constructor(private readonly rolRepo = new RolRepository()) {}

  async createRol(data: CreateRolDTO) {
    return this.rolRepo.create(data);
  }

  async getRolById(id: number) {
    const rol = await this.rolRepo.findById(id);
    if (!rol) {
      throw new Error('Rol no encontrado');
    }
    return rol;
  }

  async getAllRoles() {
    return this.rolRepo.findAll();
  }

  async updateRol(id: number, data: Partial<CreateRolDTO>) {
    const rol = await this.rolRepo.findById(id);
    if (!rol) {
      throw new Error('Rol no encontrado');
    }
    return this.rolRepo.update(rol, data);
  }

  async deleteRol(id: number) {
    const rol = await this.rolRepo.findById(id);
    if (!rol) {
      throw new Error('Rol no encontrado');
    }
    await this.rolRepo.delete(rol);
    return { message: 'Rol eliminado correctamente' };
  }
}
