import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { ZodError } from 'zod'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')
  
  throw new Error(
    `❌ Missing Supabase environment variables: ${missingVars.join(', ')}\n\n` +
    `🔧 To fix this:\n` +
    `1. Create a .env.local file in your project root\n` +
    `2. Add your Supabase credentials:\n` +
    `   VITE_SUPABASE_URL=https://your-project-ref.supabase.co\n` +
    `   VITE_SUPABASE_ANON_KEY=your-anon-key-here\n\n` +
    `📖 See SUPABASE_SETUP.md for detailed instructions`
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  let errorMessage = 'An unexpected error occurred'
  
  if (error instanceof ZodError) {
    // Handle Zod validation errors
    const firstError = error.errors[0]
    if (firstError) {
      errorMessage = `Validation error: ${firstError.message}`
      if (firstError.path.length > 0) {
        errorMessage += ` (field: ${firstError.path.join('.')})`
      }
    }
  } else if (error?.message) {
    // Handle regular errors with messages
    errorMessage = error.message
  } else if (typeof error === 'string') {
    // Handle string errors
    errorMessage = error
  } else if (error?.code) {
    // Handle Supabase specific errors
    switch (error.code) {
      case '23505':
        errorMessage = 'This record already exists'
        break
      case '23503':
        errorMessage = 'Cannot delete this record because it is referenced by other data'
        break
      case '42501':
        errorMessage = 'You do not have permission to perform this action'
        break
      default:
        errorMessage = `Database error: ${error.message || 'Unknown error'}`
    }
  }
  
  return {
    success: false,
    error: errorMessage,
    data: null
  }
}

// Helper function for successful responses
export const handleSupabaseSuccess = <T>(data: T) => {
  return {
    success: true,
    error: null,
    data
  }
}

export type SupabaseResponse<T> = {
  success: boolean
  error: string | null
  data: T | null
} 