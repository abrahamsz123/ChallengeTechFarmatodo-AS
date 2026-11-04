import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import NotaCredito from '#models/nota_credito'
import User from '#models/user'

export default class NotaCreditoAuditoria extends BaseModel {
  public static table = 'notas_credito_auditoria'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare notaCreditoId: number

  @column()
  declare userId: number | null

  @column()
  declare accion: 'creacion' | 'resolucion' | 'aprobacion' | 'rechazo' | 'primera_aprobacion' | 'aprobacion_final'

  @column()
  declare estadoAnterior: string | null

  @column()
  declare estadoNuevo: string

  @column()
  declare comentario: string | null

  @column.dateTime()
  declare fecha: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => NotaCredito)
  declare notaCredito: BelongsTo<typeof NotaCredito>

  @belongsTo(() => User)
  declare usuario: BelongsTo<typeof User>
}
