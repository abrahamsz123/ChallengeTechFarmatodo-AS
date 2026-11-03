import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import Departamento from '#models/departamento'
import Cargo from '#models/cargo'
import NotaCredito from '#models/nota_credito'
import NotaCreditoAuditoria from '#models/nota_credito_auditoria'

const Authenticatable = compose(
  BaseModel,
  withAuthFinder(() => hash.use(), {
    uids: ['email'],
    passwordColumnName: 'password',
  })
)

export default class User extends Authenticatable {
  public static table = 'users'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare departamentoId: number

  @column()
  declare cargoId: number

  @column()
  declare nombreCompleto: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare pais: string

  @column.date()
  declare fechaIngreso: DateTime

  @column()
  declare rol: 'admin' | 'jefe' | 'colaborador'

  @column()
  declare estado: 'activo' | 'inactivo'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Departamento)
  declare departamento: BelongsTo<typeof Departamento>

  @belongsTo(() => Cargo)
  declare cargo: BelongsTo<typeof Cargo>

  @hasMany(() => NotaCredito, { foreignKey: 'creadoPorId' })
  declare notasCreadas: HasMany<typeof NotaCredito>

  @hasMany(() => NotaCreditoAuditoria, { foreignKey: 'userId' })
  declare auditorias: HasMany<typeof NotaCreditoAuditoria>
}
