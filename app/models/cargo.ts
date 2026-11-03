import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Departamento from '#models/departamento'
import User from '#models/user'

export default class Cargo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare departamentoId: number

  @column()
  declare nombreCargo: string

  @column()
  declare nivelSeniority: string

  @column()
  declare funcionesPrincipales: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Departamento)
  declare departamento: BelongsTo<typeof Departamento>

  @hasMany(() => User)
  declare colaboradores: HasMany<typeof User>
}
