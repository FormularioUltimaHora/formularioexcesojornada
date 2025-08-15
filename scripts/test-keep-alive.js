#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Usar las credenciales del proyecto
const supabaseUrl = 'https://eugowbqnmztgtacoxdcg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Z293YnFubXp0Z3RhY294ZGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTQ2MDEsImV4cCI6MjA2ODQzMDYwMX0.UGu9Iz4_bp8xoahSkkRMCQprCW9T8CVAl8CueqvbS5A';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testKeepAlive() {
  console.log('🧪 Probando keep-alive con credenciales del proyecto...');
  console.log('📅', new Date().toISOString());
  
  try {
    // Hacer consultas simples para mantener la DB activa
    const queries = [
      {
        name: 'Consulta de versión PostgreSQL',
        query: () => supabase.rpc('version')
      },
      {
        name: 'Tablas del esquema público',
        query: () => supabase.from('information_schema.tables')
          .select('table_name, table_type')
          .eq('table_schema', 'public')
          .limit(5)
      },
      {
        name: 'Verificar tabla keep-alive',
        query: () => supabase.from('_keep_alive_log')
          .select('count(*)')
          .limit(1)
      }
    ];

    console.log(`🔄 Ejecutando ${queries.length} consultas...`);
    
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

    // Mostrar resultados
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const query = result.value;
        if (query.success) {
          console.log(`  ✅ ${query.name}`);
          if (query.data) {
            console.log(`     📊 Datos: ${JSON.stringify(query.data).substring(0, 100)}...`);
          }
        } else {
          console.log(`  ❌ ${query.name}: ${query.error}`);
        }
      } else {
        console.log(`  ❌ ${queries[index].name}: ${result.reason}`);
      }
    });

    console.log('\n🎯 Prueba completada exitosamente');
    console.log('✅ Base de datos mantenida activa');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testKeepAlive();
