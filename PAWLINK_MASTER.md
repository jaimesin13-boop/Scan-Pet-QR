# PawLink — Versión Maestra

**Fecha de corte:** 2026-09-16
**Repositorio:** jaimesin13-boop/Scan-Pet-QR
**Rama maestra de respaldo:** `pawlink-master-2026-09-16`
**Commit de referencia:** `33f4b1f8d514b7c403158a76b3c90f313ca18206`

## Propósito
Esta rama es una fotografía estable del proyecto PawLink en la fecha indicada. No debe utilizarse para desarrollar nuevas funciones directamente. Las nuevas modificaciones deben hacerse sobre `main` o sobre ramas de trabajo y, después de probarse, conservar esta rama como referencia histórica.

## Arquitectura verificada
- Aplicación web basada en Next.js.
- TypeScript configurado mediante `tsconfig.json`.
- Configuración de Next.js en `next.config.js`.
- Dependencias y scripts definidos en `package.json`.
- Código de aplicación principalmente bajo `app/`.
- Librerías/utilidades bajo `lib/`.
- Integración con Supabase para operaciones de datos mediante RPC.

## Funciones recientes incluidas en este corte
- Centro de alertas del propietario.
- Entrada de alertas desde el dashboard del propietario.
- Consulta de medallón mediante RPC de Supabase.
- Tarjeta de mascota con QR real y corrección de renderizado de URL.
- Página de activación de medallones.
- Enlace de activación desde el dashboard.
- Formulario de activación conectado al RPC `activate_medallion`.

## Últimos cambios que forman parte de la versión maestra
1. `f5fc7bb184fff7dc2799c3a145aff5b7645a58dc` — Add medallion activation page.
2. `e0188871157585d71081dac34030474f3cd86f00` — Add medallion activation link to dashboard.
3. `33f4b1f8d514b7c403158a76b3c90f313ca18206` — Fix medallion activation form and connect activate_medallion RPC.

## Regla de seguridad
No guardar claves privadas, tokens, contraseñas ni variables de entorno con secretos dentro del repositorio. Las credenciales de Supabase/Hostinger deben mantenerse en las variables de entorno correspondientes.

## Flujo recomendado
Desarrollo y pruebas → GitHub `main`/rama de trabajo → despliegue en Hostinger → comprobación de producción.

La rama `pawlink-master-2026-09-16` queda como punto de recuperación y comparación. No se debe borrar ni modificar sin crear antes una nueva versión maestra.

## Nota para futuros asistentes
Antes de modificar PawLink:
- revisar primero el estado de `main`;
- identificar el commit de producción cuando sea posible;
- no asumir que un cambio de GitHub ya está desplegado en Hostinger;
- conservar una nueva rama de respaldo antes de cambios estructurales importantes;
- probar autenticación, dashboard, mascotas, QR, medallones y funciones de Supabase antes de considerar una versión estable.
