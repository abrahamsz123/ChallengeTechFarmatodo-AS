import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'companias'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').primary() // preserva IDs del dataset Farmatodo
      table.string('nombre', 100).notNullable()
      table.string('rubro', 50).notNullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
