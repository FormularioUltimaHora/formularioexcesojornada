import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };
}

// Función para generar un token temporal seguro
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Función para verificar si un token es válido (expira en 24 horas)
function isTokenValid(token: string, timestamp: number): boolean {
  const now = Date.now();
  const tokenAge = now - timestamp;
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
  return tokenAge < maxAge;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response("Configuración incompleta", { status: 500, headers: corsHeaders() });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === "POST") {
      // Generar token de acceso seguro
      const { screenshotUrl, userEmail } = await req.json();
      
      if (!screenshotUrl || !userEmail) {
        return new Response("Datos incompletos", { status: 400, headers: corsHeaders() });
      }

      // Generar token temporal
      const token = generateSecureToken();
      const timestamp = Date.now();
      
      // Guardar token en base de datos temporal
      const { error } = await supabase
        .from('_secure_screenshot_tokens')
        .insert({
          token,
          screenshot_url: screenshotUrl,
          user_email: userEmail,
          created_at: new Date(timestamp).toISOString(),
          expires_at: new Date(timestamp + 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) {
        console.error('Error guardando token:', error);
        return new Response("Error interno", { status: 500, headers: corsHeaders() });
      }

      // Crear URL segura
      const secureUrl = `${supabaseUrl}/functions/v1/secure-screenshot-access?token=${token}`;
      
      return new Response(JSON.stringify({ 
        secureUrl,
        expiresAt: new Date(timestamp + 24 * 60 * 60 * 1000).toISOString()
      }), { 
        status: 200, 
        headers: { ...corsHeaders(), "Content-Type": "application/json" } 
      });

    } else if (req.method === "GET") {
      // Acceder a la captura con token
      const url = new URL(req.url);
      const token = url.searchParams.get('token');
      
      if (!token) {
        return new Response("Token requerido", { status: 400, headers: corsHeaders() });
      }

      // Verificar token en base de datos
      const { data: tokenData, error: tokenError } = await supabase
        .from('_secure_screenshot_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (tokenError || !tokenData) {
        return new Response("Token inválido", { status: 401, headers: corsHeaders() });
      }

      // Verificar si el token ha expirado
      if (!isTokenValid(token, new Date(tokenData.created_at).getTime())) {
        // Eliminar token expirado
        await supabase
          .from('_secure_screenshot_tokens')
          .delete()
          .eq('token', token);
        
        return new Response("Token expirado", { status: 401, headers: corsHeaders() });
      }

      // Obtener la imagen desde Supabase Storage
      const screenshotUrl = tokenData.screenshot_url;
      const pathMatch = screenshotUrl.match(/\/storage\/v1\/object\/public\/screenshots\/(.+)/);
      
      if (!pathMatch) {
        return new Response("URL de captura inválida", { status: 400, headers: corsHeaders() });
      }

      const filePath = pathMatch[1];
      
      // Descargar la imagen
      const { data: fileData, error: fileError } = await supabase.storage
        .from('screenshots')
        .download(filePath);

      if (fileError || !fileData) {
        return new Response("Error accediendo a la captura", { status: 404, headers: corsHeaders() });
      }

      // Convertir a ArrayBuffer para la respuesta
      const arrayBuffer = await fileData.arrayBuffer();
      
      // Determinar el tipo MIME
      const fileExtension = filePath.split('.').pop()?.toLowerCase();
      let contentType = 'image/jpeg'; // Por defecto
      
      if (fileExtension === 'png') contentType = 'image/png';
      else if (fileExtension === 'gif') contentType = 'image/gif';
      else if (fileExtension === 'webp') contentType = 'image/webp';

      // Eliminar token usado (uso único)
      await supabase
        .from('_secure_screenshot_tokens')
        .delete()
        .eq('token', token);

      return new Response(arrayBuffer, {
        status: 200,
        headers: {
          ...corsHeaders(),
          "Content-Type": contentType,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });
    }

    return new Response("Método no permitido", { status: 405, headers: corsHeaders() });

  } catch (err) {
    console.error('Error en secure-screenshot-access:', err);
    return new Response(`Error interno: ${err.message}`, { status: 500, headers: corsHeaders() });
  }
});
