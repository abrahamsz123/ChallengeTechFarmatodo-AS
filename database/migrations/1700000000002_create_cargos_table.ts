import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cargos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('departamento_id')
        .unsigned()
        .references('id')
        .inTable('departamentos')
        .onDelete('CASCADE')
        .notNullable()
      table.string('nombre_cargo', 120).notNullable()
      table.string('nivel_seniority', 50).notNullable() // Junior, Semi-Senior, Senior, Jefatura, Gerencia
      table.text('funciones_principales').notNullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
