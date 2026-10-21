# Backlog

Lo pendiente de este repo. Lo que necesita una prueba o una decisión de Lucas está en STATUS.md.

- Commitear los cambios del MVP que siguen sin commit en el working tree: conciliación en 2 niveles, estados de pago por email, plantillas, reglas de auto-conciliación, pagos parciales/split, timeline por cliente, tesorería y modo MVP sin auth _(«Describe este repo» · Codex · 31/03)_
- Deployar las Edge Functions send-payment-statement-email y manage-users; sin eso el envío de estados de pago y la pestaña de usuarios no andan _(«Describe este repo» · Codex · 31/03)_
- Crear una migración baseline con el schema actual (customers, invoices, companies, user_settings, etc.); hoy el repo solo tiene las dos migraciones nuevas y no se puede reproducir la base desde cero _(«Describe este repo» · Codex · 31/03)_
- Cerrar la deuda de lint previa del repo (65 findings: no-explicit-any, exhaustive-deps, only-export-components) _(«Upgrade vulnerable dependencies» · Codex · 31/03)_
- Conectar end-to-end las plantillas invoice, reminder y receipt; hoy solo el flujo de statement y receipt al conciliar usan la plantilla guardada _(«Describe este repo» · Codex · 31/03)_
- Forecast de 8 semanas: las recurrencias proyectadas pueden duplicar facturas ya generadas porque el schema no guarda un next run confiable _(«Describe este repo» · Codex · 31/03)_
- Seguir el backlog copiado de Chipax/Fonder que quedó sin implementar (cobranza automática semanal, capa de tesorería restante) _(«Describe este repo» · Codex · 31/03)_
- Antes de salir del modo MVP sin auth, revisar RLS y filtros por user_id: muchas lecturas (useInvoices, CustomerList) no filtran por usuario _(«Describe este repo» · Codex · 31/03)_
