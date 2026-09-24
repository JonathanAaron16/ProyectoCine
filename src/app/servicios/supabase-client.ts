import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// Crea y exporta una instancia reutilizable para consultar Supabase desde la aplicación.
export const supabase = createClient(environment.supabaseUrl, environment.supabasePublishableKey);
