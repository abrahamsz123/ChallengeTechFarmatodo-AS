# Data de ejemplo — Caso 2: Flujo de aprobación de notas de crédito

Este archivo contiene un dataset de ejemplo que puedes usar como semilla para tu base de datos.
**Es completamente opcional**: puedes usarlo tal cual, adaptarlo, o generar tu propia data
ficticia con AI o scripts — lo que se evalúa es el modelo relacional y el flujo de aprobación
que construyas encima, no el origen de los datos.

## Contexto de negocio

Las notas de crédito las recibe el departamento de **Cuentas por Cobrar** o **Cuentas por
Pagar** por productos que fueron despachados a las tiendas (ej. devoluciones, errores de
facturación, ajustes de precio), pertenecientes a distintas compañías proveedoras.

Es un proceso **aislado de usuarios específicos**: no hay una persona "dueña" de la nota, ni un
solicitante ni un aprobador individual — es un proceso de departamento. Por eso, en tu portal,
la única regla de control debería ser:

> Un usuario puede ejecutar (aprobar/rechazar) una nota de crédito **si su rol pertenece al
> departamento responsable de esa nota** (`departamento_responsable`). No necesitas registrar
> ni mostrar *quién específicamente* la ejecutó.

## Qué contiene

| Tabla | Registros | Descripción |
|---|---|---|
| `tiendas` | 6 | Tiendas ficticias en Venezuela y Argentina — destino del despacho que originó la nota. |
| `companias` | 6 | Compañías ficticias (proveedores/fabricantes) dueñas de los productos despachados. |
| `notas_credito` | 25 | Monto, moneda (USD/VES), motivo, tienda, compañía del producto, departamento responsable, estado. |
| `notas_credito_auditoria` | 38 | Historial de creación y resolución (aprobación/rechazo) de cada nota — sin usuario asociado. |

## Cómo usarlo

```bash
# SQLite
sqlite3 mi_base.db < data_dummy_notas_credito_candidato.sql

# PostgreSQL
psql -U usuario -d mi_base -f data_dummy_notas_credito_candidato.sql
```

Si prefieres otro motor de base de datos, puedes adaptar los tipos de dato del `CREATE TABLE`
que incluye el script.

## Una aclaración importante

Este dataset cubre solo el proceso de notas de crédito en sí. El resto del portal (login, roles,
departamentos de la VP de Finanzas) lo debes diseñar tú, según la sección 3 del enunciado
general de la prueba.
