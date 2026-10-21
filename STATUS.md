# Estado

_Actualizado 2026-10-21 · Claude Code (rescate trailkeep)_

## Probar

- Conciliación en 2 niveles con CSV real: etiqueta Level 1, ranking con razones, conciliación masiva, unlink que devuelve la factura a Pending Cómo: Correr la app, importar un CSV en Bank Reconciliation y vincular/desvincular movimientos (necesita facturas impagas y Supabase activo). _(«Describe este repo» · Codex · 31/03)_
- Pagos parciales y split entre varias facturas en LinkInvoiceDialog, con rollback si falla Cómo: En Bank Reconciliation vincular un movimiento a varias facturas y revisar estados Paid/Partially Paid. _(«Describe este repo» · Codex · 31/03)_
- Estado de pago por email y plantillas persistidas en Settings Cómo: Facturas > estado de pago, elegir cliente y facturas, previsualizar; requiere la function deployada. _(«Describe este repo» · Codex · 31/03)_
- Modo MVP sin auth con VITE_DISABLE_AUTH=true, aging por cliente, timeline de actividad y bloque de tesorería en el dashboard Cómo: Levantar con la variable y revisar sidebar, Customers > detalle y el dashboard. _(«Describe este repo» · Codex · 31/03)_

## Destrabar

- Reanudar el proyecto Supabase pausado desde el dashboard; bloquea migraciones, functions y cualquier prueba con datos reales **Recomiendo:** Reanudar el actual: es lo único que no rompe tus restricciones (sin Docker, sin otro remoto, sin mocks). (opciones: Reanudar el proyecto actual / Crear un Supabase dev remoto aparte / Aceptar Docker para Supabase local / Aceptar mock mode con datos locales) _(«Describe este repo» · Codex · 31/03)_
- Dar credenciales de SendGrid y desplegar la function de envío para que los estados de pago y recibos salgan de verdad **Recomiendo:** Configurarlas vos como secreto del proyecto, después un agente deploya. (opciones: Configurarlas vos en Supabase al despausar / Pasarle a un agente el acceso para deployar) _(«Describe este repo» · Codex · 31/03)_

## Pendiente sin backlog

- Commitear los cambios del MVP que siguen sin commit en el working tree: conciliación en 2 niveles, estados de pago por email, plantillas, reglas de auto-conciliación, pagos parciales/split, timeline por cliente, tesorería y modo MVP sin auth _(«Describe este repo» · Codex · 31/03)_
- Deployar las Edge Functions send-payment-statement-email y manage-users; sin eso el envío de estados de pago y la pestaña de usuarios no andan _(«Describe este repo» · Codex · 31/03)_
- Crear una migración baseline con el schema actual (customers, invoices, companies, user_settings, etc.); hoy el repo solo tiene las dos migraciones nuevas y no se puede reproducir la base desde cero _(«Describe este repo» · Codex · 31/03)_
- Cerrar la deuda de lint previa del repo (65 findings: no-explicit-any, exhaustive-deps, only-export-components) _(«Upgrade vulnerable dependencies» · Codex · 31/03)_
- Conectar end-to-end las plantillas invoice, reminder y receipt; hoy solo el flujo de statement y receipt al conciliar usan la plantilla guardada _(«Describe este repo» · Codex · 31/03)_
- Forecast de 8 semanas: las recurrencias proyectadas pueden duplicar facturas ya generadas porque el schema no guarda un next run confiable _(«Describe este repo» · Codex · 31/03)_
- Seguir el backlog copiado de Chipax/Fonder que quedó sin implementar (cobranza automática semanal, capa de tesorería restante) _(«Describe este repo» · Codex · 31/03)_
- Antes de salir del modo MVP sin auth, revisar RLS y filtros por user_id: muchas lecturas (useInvoices, CustomerList) no filtran por usuario _(«Describe este repo» · Codex · 31/03)_

## Último cambio

- 2026-03-18 · chore(deps): patch vulnerable packages (1155104)

## Próxima sesión

Leer README.md y el git status del repo: hay muchísimo trabajo sin commitear (solo existe el commit de dependencias). Revisar el diff, correr tsc y build, y commitear por feature.
Después ver si el Supabase pausado se reanudó (issue #1) para pushear las dos migraciones y deployar las functions.
