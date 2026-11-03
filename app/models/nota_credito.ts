import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Tienda from '#models/tienda'
import Compania from '#models/compania'
import Departamento from '#models/departamento'
import User from '#models/user'
import NotaCreditoAuditoria from '#models/nota_credito_auditoria'

export default class NotaCredito extends BaseModel {
  public static table = 'notas_credito'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare monto: number

  @column()
  declare moneda: string

  @column()
  declare motivo: string

  @column()
  declare tiendaId: number

  @column()
  declare companiaId: number

  @column()
  declare departamentoResponsable: string

  @column()
  declare departamentoId: number | null

  @column()
  declare creadoPorId: number | null

  @column()
  declare estado: 'pendiente' | 'aprobada' | 'rechazada'

  @column()
  declare riskScore: number

  @column()
  declare riskLevel: 'BAJO' | 'MEDIO' | 'ALTO'

  @column()
  declare riskJustification: string | null

  @column.dateTime()
  declare fechaCreacion: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Tienda)
  declare tienda: BelongsTo<typeof Tienda>

  @belongsTo(() => Compania)
  declare compania: BelongsTo<typeof Compania>

  @belongsTo(() => Departamento)
  declare departamento: BelongsTo<typeof Departamento>

  @belongsTo(() => User, { foreignKey: 'creadoPorId' })
  declare creador: BelongsTo<typeof User>

  @hasMany(() => NotaCreditoAuditoria, { foreignKey: 'notaCreditoId' })
  declare auditorias: HasMany<typeof NotaCreditoAuditoria>
}
