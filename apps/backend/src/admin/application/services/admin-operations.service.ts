import { Injectable, NotFoundException } from '@nestjs/common';

import { AdminOperationsRepository } from '../../infrastructure/repositories/admin-operations.repository';
import { AdminSystemConfigRepository } from '../../infrastructure/repositories/admin-system-config.repository';
import { ConfiguracionSistemaKey } from '../../../system-config/domain/configuracion-sistema-key';

import {
  AdminBranchDto,
  AdminVehicleDto,
} from '../dto/admin-operations-response.dto';
import { SystemConfigEntryDto } from '../dto/system-config-response.dto';

/** Las claves que el panel puede leer y editar: las que el dominio conoce. */
const CLAVES_EDITABLES: string[] = Object.values(ConfiguracionSistemaKey);

@Injectable()
export class AdminOperationsService {
  constructor(
    private readonly repository: AdminOperationsRepository,
    private readonly systemConfigRepository: AdminSystemConfigRepository,
  ) {}

  async findBranches(): Promise<AdminBranchDto[]> {
    const sucursales = await this.repository.findBranches();

    return sucursales.map((sucursal) => ({
      id: sucursal.id,
      codigo: sucursal.codigo,
      nombre: sucursal.nombre,
      telefono: sucursal.telefono,
      email: sucursal.email,
      activa: sucursal.activa,
      direccionFormateada: sucursal.direccion.direccionFormateada,
      ciudad: sucursal.direccion.ciudad.nombre,
      estado: sucursal.direccion.estadoProvincia.nombre,
      totalEmpleados: sucursal._count.empleados,
      totalVehiculos: sucursal._count.vehiculos,
    }));
  }

  async findVehicles(): Promise<AdminVehicleDto[]> {
    const vehiculos = await this.repository.findVehicles();

    return vehiculos.map((vehiculo) => {
      const asignacion = vehiculo.asignaciones[0];
      const usuario = asignacion?.repartidor.empleado.usuario;

      return {
        id: vehiculo.id,
        placas: vehiculo.placas,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio,
        capacidadKg: Number(vehiculo.capacidadKg),
        activo: vehiculo.activo,
        sucursal: vehiculo.sucursal,
        repartidorAsignado: usuario
          ? `${usuario.nombre} ${usuario.apellidoPaterno}`
          : null,
      };
    });
  }

  /**
   * Configuración del sistema.
   *
   * Se devuelven solo las claves que el dominio declara en
   * `ConfiguracionSistemaKey`: son las que gobiernan cálculos reales
   * —comisión, IVA, factor volumétrico, máximo de intentos de entrega— y las
   * únicas que tiene sentido tocar desde el panel.
   */
  async findSystemConfig(): Promise<SystemConfigEntryDto[]> {
    const configuraciones =
      await this.systemConfigRepository.findByKeys(CLAVES_EDITABLES);

    return configuraciones.map((configuracion) => ({
      clave: configuracion.clave,
      valor: configuracion.valor,
      descripcion: configuracion.descripcion,
      updatedAt: configuracion.updatedAt,
    }));
  }

  async updateSystemConfig(
    clave: string,
    valor: string,
  ): Promise<SystemConfigEntryDto> {

    // Solo se editan las claves del dominio: crear o cambiar cualquier otra
    // desde el panel no tendría ningún efecto y ensuciaría la tabla.
    if (!CLAVES_EDITABLES.includes(clave)) {
      throw new NotFoundException(
        `La clave de configuración ${clave} no existe.`,
      );
    }

    const actualizada =
      await this.systemConfigRepository.updateValue(clave, valor);

    if (!actualizada) {
      throw new NotFoundException(
        `La clave de configuración ${clave} no existe.`,
      );
    }

    return {
      clave: actualizada.clave,
      valor: actualizada.valor,
      descripcion: actualizada.descripcion,
      updatedAt: actualizada.updatedAt,
    };
  }
}
