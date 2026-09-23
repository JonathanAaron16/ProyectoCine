import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class Auth {
  signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  }

  signOut() {
    return supabase.auth.signOut();
  }

  getUser() {
    return supabase.auth.getUser();
  }
}