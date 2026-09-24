// Importa la función que crea un cliente para comunicarse con Supabase.
import { createClient } from '@supabase/supabase-js';
// Obtiene la URL y la clave pública configuradas para el entorno actual.
import { environment } from '../../environments/environment';

// Crea y exporta una instancia reutilizable para consultar Supabase desde la aplicación.
export const supabase = createClient(environment.supabaseUrl, environment.supabasePublishableKey);