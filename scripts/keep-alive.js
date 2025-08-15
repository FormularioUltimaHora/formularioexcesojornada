#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

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
keepDatabaseAlive()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  });
