import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notas_credito'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.decimal('monto', 12, 2).notNullable()
      table.string('moneda', 5).notNullable() // USD, VES
      table.string('motivo', 255).notNullable()
      table
        .integer('tienda_id')
        .references('id')
        .inTable('tiendas')
        .onDelete('RESTRICT')
        .notNullable()
      table
        .integer('compania_id')
        .references('id')
        .inTable('companias')
        .onDelete('RESTRICT')
        .notNullable()
      table.string('departamento_responsable', 50).notNullable() // 'Cuentas por Cobrar' | 'Cuentas por Pagar'
      table
        .integer('departamento_id')
        .unsigned()
        .references('id')
        .inTable('departamentos')
        .onDelete('SET NULL')
        .nullable()
      table
        .integer('creado_por_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .nullable()
      table.string('estado', 20).notNullable().defaultTo('pendiente') // pendiente, aprobada, rechazada
      table.integer('risk_score').notNullable().defaultTo(0)
      table.string('risk_level', 10).notNullable().defaultTo('BAJO') // BAJO, MEDIO, ALTO
      table.text('risk_justification').nullable()
      table.timestamp('fecha_creacion', { useTz: true }).notNullable().defaultTo(this.now())

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
