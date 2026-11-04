import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notas_credito'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('requiere_doble_aprobacion').defaultTo(false)
      table.integer('primer_aprobador_id').unsigned().references('id').inTable('users').nullable().onDelete('SET NULL')
      table.timestamp('fecha_primera_aprobacion', { useTz: true }).nullable()
      table.integer('segundo_aprobador_id').unsigned().references('id').inTable('users').nullable().onDelete('SET NULL')
      table.timestamp('fecha_segunda_aprobacion', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('requiere_doble_aprobacion')
      table.dropColumn('primer_aprobador_id')
      table.dropColumn('fecha_primera_aprobacion')
      table.dropColumn('segundo_aprobador_id')
      table.dropColumn('fecha_segunda_aprobacion')
    })
  }
}
