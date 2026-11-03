import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('departamento_id')
        .unsigned()
        .references('id')
        .inTable('departamentos')
        .onDelete('RESTRICT')
        .notNullable()
      table
        .integer('cargo_id')
        .unsigned()
        .references('id')
        .inTable('cargos')
        .onDelete('RESTRICT')
        .notNullable()
      table.string('nombre_completo', 150).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password', 255).notNullable()
      table.string('pais', 50).notNullable() // Venezuela, Argentina
      table.date('fecha_ingreso').notNullable()
      table.string('rol', 30).notNullable().defaultTo('colaborador') // admin, jefe, colaborador
      table.string('estado', 20).notNullable().defaultTo('activo') // activo, inactivo

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
