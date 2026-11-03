import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notas_credito_auditoria'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('nota_credito_id')
        .unsigned()
        .references('id')
        .inTable('notas_credito')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .nullable()
      table.string('accion', 30).notNullable() // creacion, resolucion, aprobacion, rechazo
      table.string('estado_anterior', 20).nullable()
      table.string('estado_nuevo', 20).notNullable()
      table.string('comentario', 255).nullable()
      table.timestamp('fecha', { useTz: true }).notNullable().defaultTo(this.now())

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
