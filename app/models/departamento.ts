import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Cargo from '#models/cargo'
import User from '#models/user'
import NotaCredito from '#models/nota_credito'

export default class Departamento extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare codigo: string

  @column()
  declare descripcion: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Cargo)
  declare cargos: HasMany<typeof Cargo>

  @hasMany(() => User)
  declare colaboradores: HasMany<typeof User>

  @hasMany(() => NotaCredito, { foreignKey: 'departamentoId' })
  declare notasCredito: HasMany<typeof NotaCredito>
}
