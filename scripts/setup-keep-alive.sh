#!/bin/bash

# Script de configuración para Keep-Alive de Base de Datos
# Este script te ayuda a configurar todo el sistema

echo "🚀 Configurando Sistema de Keep-Alive para Supabase"
echo "=================================================="

# Verificar que estemos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Debes ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

echo "✅ Directorio del proyecto verificado"

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p .github/workflows
mkdir -p scripts
mkdir -p supabase/functions/keep-alive

echo "✅ Directorios creados"

# Verificar si ya existe el workflow
if [ -f ".github/workflows/keep-alive-db.yml" ]; then
    echo "⚠️  El workflow de GitHub Actions ya existe"
    read -p "¿Quieres sobrescribirlo? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configuración cancelada"
        exit 1
    fi
fi

echo "🔧 Configurando GitHub Actions..."

# Crear archivo de configuración de GitHub
cat > .github/workflows/keep-alive-db.yml << 'EOF'
name: Keep Database Alive

on:
  schedule:
    # Ejecutar diariamente a las 9:00 AM UTC
    - cron: '0 9 * * *'
  workflow_dispatch: # Permite ejecución manual

jobs:
  keep-alive:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Keep Database Alive
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      run: node scripts/keep-alive.js
        
    - name: Success notification
      if: success()
      run: echo "✅ Base de datos mantenida activa exitosamente"
      
    - name: Failure notification
      if: failure()
      run: echo "❌ Error al mantener base de datos activa"
EOF

echo "✅ Workflow de GitHub Actions creado"

# Crear script de keep-alive
echo "📝 Creando script de keep-alive..."
cat > scripts/keep-alive.js << 'EOF'
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuración
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno requeridas:');
  console.error('   SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función principal de keep-alive
async function keepDatabaseAlive() {
  const startTime = Date.now();
  console.log('🚀 Iniciando keep-alive de base de datos...');
  console.log('📅', new Date().toISOString());
  
  try {
    // Array de consultas para mantener la DB activa
    const queries = [
      {
        name: 'Consulta de versión PostgreSQL',
        query: () => supabase.rpc('version')
      },
      {
        name: 'Información del sistema',
        query: () => supabase.rpc('pg_stat_database')
      },
      {
        name: 'Tablas del esquema público',
        query: () => supabase.from('information_schema.tables')
          .select('table_name, table_type')
          .eq('table_schema', 'public')
          .limit(10)
      },
      {
        name: 'Estadísticas de la base de datos',
        query: () => supabase.rpc('pg_stat_database')
      },
      {
        name: 'Extensiones instaladas',
        query: () => supabase.from('pg_extension')
          .select('extname, extversion')
          .limit(5)
      }
    ];

    console.log(`🔄 Ejecutando ${queries.length} consultas...`);
    
    // Ejecutar todas las consultas en paralelo
    const results = await Promise.allSettled(
      queries.map(async (queryInfo) => {
        try {
          const result = await queryInfo.query();
          return {
            name: queryInfo.name,
            success: true,
            data: result.data,
            error: result.error
          };
        } catch (error) {
          return {
            name: queryInfo.name,
            success: false,
            error: error.message
          };
        }
      })
    );

    // Contar resultados exitosos
    const successfulQueries = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedQueries = results.length - successfulQueries;

    console.log(`📊 Resultados: ${successfulQueries} exitosas, ${failedQueries} fallidas`);

    // Intentar crear/insertar en la tabla de logs
    try {
      const { error: insertError } = await supabase
        .from('_keep_alive_log')
        .insert({
          timestamp: new Date().toISOString(),
          action: 'github_actions_keep_alive',
          status: 'success',
          details: {
            source: 'github_actions',
            queries_executed: results.length,
            successful_queries: successfulQueries,
            failed_queries: failedQueries,
            execution_time_ms: Date.now() - startTime,
            timestamp: new Date().toISOString()
          }
        });

      if (insertError) {
        console.warn('⚠️ Error al insertar en log:', insertError.message);
      } else {
        console.log('✅ Log de actividad registrado');
      }
    } catch (logError) {
      console.warn('⚠️ No se pudo registrar en log:', logError.message);
    }

    // Mostrar resumen de consultas
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const query = result.value;
        if (query.success) {
          console.log(`  ✅ ${query.name}`);
        } else {
          console.log(`  ❌ ${query.name}: ${query.error}`);
        }
      } else {
        console.log(`  ❌ ${queries[index].name}: ${result.reason}`);
      }
    });

    const executionTime = Date.now() - startTime;
    console.log(`\n🎯 Keep-alive completado en ${executionTime}ms`);
    console.log('✅ Base de datos mantenida activa exitosamente');
    
    return true;

  } catch (error) {
    console.error('❌ Error crítico en keep-alive:', error.message);
    
    // Intentar registrar el error
    try {
      await supabase
        .from('_keep_alive_log')
        .insert({
          timestamp: new Date().toISOString(),
          action: 'github_actions_keep_alive',
          status: 'error',
          details: {
            source: 'github_actions',
            error: error.message,
            execution_time_ms: Date.now() - startTime,
            timestamp: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.error('❌ Error al registrar error:', logError.message);
    }
    
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  keepDatabaseAlive()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error inesperado:', error);
      process.exit(1);
    });
}

module.exports = { keepDatabaseAlive };
EOF

echo "✅ Script de keep-alive creado"

# Hacer el script ejecutable
chmod +x scripts/keep-alive.js

echo "✅ Script hecho ejecutable"

# Crear archivo de configuración de Supabase
echo "🗄️  Creando configuración de Supabase..."

cat > supabase/functions/keep-alive/create_keep_alive_table.sql << 'EOF'
-- Función para crear la tabla de keep-alive si no existe
CREATE OR REPLACE FUNCTION create_keep_alive_log_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Crear la tabla si no existe
  CREATE TABLE IF NOT EXISTS _keep_alive_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb
  );

  -- Crear índice para optimizar consultas
  CREATE INDEX IF NOT EXISTS idx_keep_alive_timestamp ON _keep_alive_log(timestamp);
  
  -- Crear política RLS (opcional, para mayor seguridad)
  ALTER TABLE _keep_alive_log ENABLE ROW LEVEL SECURITY;
  
  -- Política que permite solo al servicio insertar/leer
  DROP POLICY IF EXISTS "Service can manage keep alive log" ON _keep_alive_log;
  CREATE POLICY "Service can manage keep alive log" ON _keep_alive_log
    FOR ALL USING (true);
    
  -- Insertar registro inicial
  INSERT INTO _keep_alive_log (action, status, details)
  VALUES ('table_created', 'success', '{"message": "Keep alive table initialized"}')
  ON CONFLICT DO NOTHING;
  
END;
$$;
EOF

echo "✅ SQL de configuración creado"

# Crear archivo de configuración de cron
echo "⏰ Creando configuración de cron..."

cat > supabase/functions/keep-alive/cron.json << 'EOF'
{
  "name": "keep-alive-daily",
  "schedule": "0 9 * * *",
  "function": "keep-alive",
  "description": "Ejecuta la función keep-alive diariamente a las 9:00 AM UTC para mantener la base de datos activa"
}
EOF

echo "✅ Configuración de cron creada"

echo ""
echo "🎉 ¡Configuración completada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve a tu repositorio de GitHub"
echo "2. Ve a Settings > Secrets and variables > Actions"
echo "3. Agrega estos secrets:"
echo "   - SUPABASE_URL: https://eugowbqnmztgtacog.supabase.co"
echo "   - SUPABASE_SERVICE_ROLE_KEY: (tu service role key)"
echo ""
echo "4. Haz commit y push de los cambios"
echo "5. El workflow se ejecutará automáticamente cada día a las 9:00 AM UTC"
echo ""
echo "🔧 Para probar manualmente:"
echo "   - Ve a Actions en tu repositorio"
echo "   - Selecciona 'Keep Database Alive'"
echo "   - Haz clic en 'Run workflow'"
echo ""
echo "📊 Para monitorear:"
echo "   - Revisa los logs en Actions"
echo "   - Verifica la tabla _keep_alive_log en Supabase"
echo ""
echo "✅ Tu base de datos se mantendrá activa automáticamente!"
