import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bceiipnbskqwyzgneiez.supabase.co'; // Substitua pelo URL do seu projeto
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZWlpcG5ic2txd3l6Z25laWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTc5MDAsImV4cCI6MjA2MzMzMzkwMH0.OHmnsOQ8S2kqnAzLL9dQ7IFcZe_8ISb4igrmk7XMxwg'; // Substitua pela anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);