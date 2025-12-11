import { MuestraRepository } from '../repositories/muestra.repository';
import { DimReactivoService } from './dimReactivo.service';
import {
  ContadorRepository,
  NextCounterValue,
} from '../repositories/contador.repository';

interface CreateMuestraDTO {
  id_muestra?: number;
  codigo_epi?: string;
  codigo_externo?: string;
  f_toma?: string;
  f_recepcion?: string;
  f_destruccion?: string;
  f_devolucion?: string;
  estado_muestra?: string;
  paciente?: {
    id: string | number;
    nombre?: string;
    sip?: string;
    direccion?: string;
  };
  solicitud: {
    id_solicitud?: number;
    f_creacion?: string;
    f_entrada?: string;
    f_compromiso?: string;
    f_entrega?: string;
    f_resultado?: string;
    condiciones_envio?: string;
    tiempo_hielo?: string;
    cliente: {
      id: string | number;
      nombre?: string;
      razon_social?: string;
      nif?: string;
    };
  };
  tecnico_resp?: {
    id_usuario: string | number;
    nombre?: string;
  };
  tipo_muestra?: {
    id: string | number;
    cod_tipo_muestra?: string;
    tipo_muestra?: string;
  };
  centro?: {
    id: string | number;
    codigo?: string;
    descripcion?: string;
  };
  criterio_validacion?: {
    id: number;
    codigo?: string;
    descripcion?: string;
  };
  ubicacion?: {
    id: number;
    codigo?: string;
    ubicacion?: string;
  };
  prueba?: {
    id: string | number;
    cod_prueba?: string;
    prueba?: string;
  };
  tecnicas?: Array<{
    id_tecnica_proc: string | number;
    comentarios?: string;
  }>;
}

interface UpdateMuestraDTO {
  codigo_epi?: string;
  codigo_externo?: string;
  f_toma?: Date;
  f_recepcion?: Date;
  f_destruccion?: Date;
  f_devolucion?: Date;
  estado_muestra?: string;
  id_paciente?: number;
  id_tecnico_resp?: number;
  id_tipo_muestra?: number;
  id_centro_externo?: number;
  id_criterio_val?: number;
  id_ubicacion?: number;
  id_prueba?: number;
}

export class MuestraService {
  private dimReactivoService: DimReactivoService;
  private readonly muestraRepo: MuestraRepository;
  private readonly contadorRepo: ContadorRepository;

  constructor(
    muestraRepo?: MuestraRepository,
    contadorRepo?: ContadorRepository
  ) {
    this.dimReactivoService = new DimReactivoService();
    this.muestraRepo =
      muestraRepo || new MuestraRepository(this.dimReactivoService);
    this.contadorRepo = contadorRepo || new ContadorRepository();
  }

  async createMuestra(data: CreateMuestraDTO) {
    // Validar que los datos obligatorios estén presentes
    if (!data.solicitud?.cliente?.id) {
      throw new Error('El cliente es obligatorio para crear una muestra');
    }

    // Establecer fecha de recepción por defecto si no se proporciona
    if (!data.f_recepcion) {
      data.f_recepcion = new Date().toISOString();
    }

    const resultado = await this.muestraRepo.create(data);

    return {
      ...resultado.toJSON(),
      mensaje: 'Muestra, solicitud y técnicas creadas correctamente',
      tecnicasCreadas: data.tecnicas ? data.tecnicas.length : 0,
    };
  }

  async getMuestraById(id: number) {
    const muestra = await this.muestraRepo.findById(id);
    if (!muestra) {
      throw new Error('Muestra no encontrada');
    }
    return muestra;
  }

  async getTecnicasById(id_muestra: number) {
    const muestra = await this.muestraRepo.findTecnicasById(id_muestra);
    if (!muestra) {
      throw new Error('Muestra no encontrada');
    }
    return muestra;
  }

  async getAllMuestras() {
    return this.muestraRepo.findAll();
  }

  async updateMuestra(id: number, data: UpdateMuestraDTO) {
    const muestra = await this.muestraRepo.findById(id);
    if (!muestra) {
      throw new Error('Muestra no encontrada');
    }
    return this.muestraRepo.update(muestra, data);
  }

  async deleteMuestra(id: number) {
    const muestra = await this.muestraRepo.findById(id);
    if (!muestra) {
      throw new Error('Muestra no encontrada');
    }
    await this.muestraRepo.delete(muestra);
    return { message: 'Muestra eliminada correctamente' };
  }

  async getMuestrasStats() {
    return this.muestraRepo.getMuestrasStats();
  }

  async getCodigoEpi() {
    const { year, value } = await this.getNextSequenceValue();
    const codigo = this.formatCodigoEpi(year, value);

    return {
      codigo_epi: codigo,
      secuencia: value,
      year,
    };
  }

  private async getNextSequenceValue(): Promise<NextCounterValue> {
    const now = new Date();
    const currentYear = now.getFullYear();
    return this.contadorRepo.getNextValue('muestra', currentYear);
  }

  private formatCodigoEpi(year: number, sequence: number): string {
    const configuredDigits = Number(
      process.env.CODIGO_EPI_SEQUENCE_DIGITS ?? '5'
    );
    const digits =
      Number.isFinite(configuredDigits) && configuredDigits >= 4
        ? Math.min(configuredDigits, 8)
        : 5;
    const yearPrefix = year.toString().slice(-2);
    const paddedSequence = sequence.toString().padStart(digits, '0');

    return `${yearPrefix}.${paddedSequence}`;
  }
}
