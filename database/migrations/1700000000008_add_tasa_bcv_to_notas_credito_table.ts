import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notas_credito'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('tasa_cambio_bcv', 10, 2).nullable()
      table.decimal('monto_usd_equivalente', 12, 2).nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tasa_cambio_bcv')
      table.dropColumn('monto_usd_equivalente')
    })
  }
}
