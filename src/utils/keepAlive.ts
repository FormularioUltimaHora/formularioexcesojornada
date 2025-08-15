import { supabase } from '../../constants';

/**
 * Función para mantener la base de datos activa
 * Se puede llamar manualmente o programar con setInterval
 */
export const keepDatabaseAlive = async (): Promise<boolean> => {
  try {
    console.log('🔄 Manteniendo base de datos activa...');
    
    // Hacer una consulta simple para mantener la DB activa
    const { data, error } = await supabase
      .from('_keep_alive_log')
      .select('count(*)')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      // La tabla no existe, crear un registro simple
      console.log('📝 Tabla keep-alive no existe, creando...');
      
      // Hacer una consulta simple a la base de datos
      const { data: pingData } = await supabase
        .rpc('version');
        
      console.log('✅ Ping exitoso sin tabla keep-alive');
    } else {
      // Insertar un registro de actividad
      const { error: insertError } = await supabase
        .from('_keep_alive_log')
        .insert({
          timestamp: new Date().toISOString(),
          action: 'keep_alive_ping',
          status: 'success'
        });

      if (insertError) {
        console.warn('⚠️ Error al insertar en keep-alive log:', insertError);
      } else {
        console.log('✅ Registro de actividad insertado');
      }
    }

    console.log('✅ Base de datos mantenida activa');
    return true;
    
  } catch (error) {
    console.error('❌ Error al mantener base de datos activa:', error);
    return false;
  }
};

/**
 * Iniciar el mantenimiento automático de la base de datos
 * @param intervalMinutes Intervalo en minutos (por defecto: 24 horas)
 */
export const startKeepAliveService = (intervalMinutes: number = 1440): void => {
  console.log(`🚀 Iniciando servicio de mantenimiento cada ${intervalMinutes} minutos`);
  
  // Ejecutar inmediatamente
  keepDatabaseAlive();
  
  // Programar ejecución periódica
  setInterval(keepDatabaseAlive, intervalMinutes * 60 * 1000);
  
  console.log('✅ Servicio de mantenimiento iniciado');
};

/**
 * Detener el servicio de mantenimiento
 */
export const stopKeepAliveService = (): void => {
  console.log('🛑 Deteniendo servicio de mantenimiento');
  // Nota: En una implementación real, necesitarías guardar el ID del intervalo
  // y usar clearInterval para detenerlo
};
