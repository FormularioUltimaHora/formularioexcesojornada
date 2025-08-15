# Sistema de Keep-Alive para Base de Datos Supabase

Este sistema mantiene tu base de datos de Supabase activa para evitar que se borre por inactividad en proyectos DEMO.

## 🚀 Soluciones Implementadas

### 1. Función Edge (Recomendada)
- **Ubicación:** `supabase/functions/keep-alive/`
- **Función:** Se ejecuta automáticamente cada día
- **Ventaja:** No depende de tu aplicación web

### 2. Servicio en Aplicación
- **Ubicación:** `src/utils/keepAlive.ts`
- **Función:** Se ejecuta cada vez que se carga la aplicación
- **Ventaja:** Mantiene la DB activa mientras los usuarios navegan

### 3. Función SQL
- **Ubicación:** `supabase/functions/keep-alive/create_keep_alive_table.sql`
- **Función:** Crea tabla de logs para tracking

## 📋 Pasos de Implementación

### Paso 1: Desplegar la Función Edge
```bash
# Desde el directorio raíz del proyecto
cd supabase/functions/keep-alive
supabase functions deploy keep-alive
```

### Paso 2: Configurar Variables de Entorno
En tu dashboard de Supabase, asegúrate de tener:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Paso 3: Crear la Tabla de Logs
Ejecuta el SQL en tu base de datos:
```sql
-- Ejecutar en SQL Editor de Supabase
SELECT create_keep_alive_table();
```

### Paso 4: Configurar Cron Job (Opcional)
En tu dashboard de Supabase:
1. Ve a Edge Functions
2. Selecciona `keep-alive`
3. Configura el cron job para ejecutarse diariamente

## ⚙️ Configuración del Cron Job

### Formato Cron: `0 9 * * *`
- **0** - Minuto (0-59)
- **9** - Hora (0-23) - 9:00 AM UTC
- **\*** - Día del mes (1-31)
- **\*** - Mes (1-12)
- **\*** - Día de la semana (0-7, donde 0 y 7 son domingo)

### Horarios Recomendados:
- **9:00 AM UTC** - `0 9 * * *`
- **12:00 PM UTC** - `0 12 * * *`
- **Cada 12 horas** - `0 */12 * * *`

## 🔧 Personalización

### Cambiar Frecuencia del Servicio
```typescript
// En src/utils/keepAlive.ts
// Cambiar de 1440 (24 horas) a 720 (12 horas)
startKeepAliveService(720);
```

### Agregar Más Operaciones
```typescript
// Agregar más consultas para mayor actividad
const { data } = await supabase
  .from('tu_tabla_principal')
  .select('count(*)')
  .limit(1);
```

## 📊 Monitoreo

### Ver Logs en Consola
- Abre DevTools en tu navegador
- Busca mensajes con 🔄, ✅, ❌

### Ver Logs en Base de Datos
```sql
SELECT * FROM _keep_alive_log 
ORDER BY timestamp DESC 
LIMIT 10;
```

### Ver Logs de Edge Functions
En tu dashboard de Supabase:
1. Edge Functions → keep-alive
2. Ver logs de ejecución

## 🚨 Solución de Problemas

### Error: "Function not found"
```bash
# Verificar que la función esté desplegada
supabase functions list
```

### Error: "Permission denied"
- Verificar que tengas `SUPABASE_SERVICE_ROLE_KEY`
- No usar `SUPABASE_ANON_KEY`

### La función no se ejecuta automáticamente
- Verificar configuración del cron job
- Revisar logs de Edge Functions
- Probar manualmente la función

## 💡 Recomendaciones

1. **Usar la función Edge** para máxima confiabilidad
2. **Configurar múltiples horarios** si es crítico
3. **Monitorear logs** regularmente
4. **Probar manualmente** antes de confiar en automático
5. **Tener respaldo** con el servicio en la aplicación

## 🔗 Enlaces Útiles

- [Documentación de Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Cron Job Syntax](https://crontab.guru/)
- [Supabase Dashboard](https://supabase.com/dashboard)

## 📝 Notas Importantes

- **Proyectos DEMO:** Se borran después de 7 días de inactividad
- **Función Edge:** Se ejecuta en servidores de Supabase, no en tu máquina
- **Costo:** Las funciones edge tienen un costo por ejecución
- **Límites:** Verificar límites de tu plan de Supabase

---

**¡Tu base de datos se mantendrá activa automáticamente!** 🎉
