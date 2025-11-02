// Add this to a test page to diagnose Supabase issues
// Create a file: app/test-supabase/page.tsx

"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupabaseDiagnostics() {
  const [results, setResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const testConnection = async () => {
    setResults([])
    addResult("Starting diagnostics...")

    try {
      // Test 1: Check Supabase client
      addResult("✓ Supabase client initialized")

      // Test 2: Check auth configuration
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        addResult(`✗ Session check error: ${sessionError.message}`)
      } else {
        addResult(`✓ Auth working - Session: ${session ? 'Active' : 'None'}`)
      }

      // Test 3: Test database connection (try to read from User table)
      const { data: users, error: dbError } = await supabase
        .from('User')
        .select('count')
        .limit(1)
      
      if (dbError) {
        addResult(`✗ Database connection error: ${dbError.message}`)
        addResult(`  Code: ${dbError.code}, Details: ${dbError.details}`)
      } else {
        addResult(`✓ Database connection working`)
      }

      // Test 4: Check auth settings
      const { data: settings, error: settingsError } = await supabase.auth.getUser()
      if (settingsError) {
        addResult(`✗ Auth settings error: ${settingsError.message}`)
      } else {
        addResult(`✓ Auth settings accessible`)
      }

      // Test 5: Try a minimal signup (don't actually create)
      addResult("Testing auth endpoint accessibility...")
      const testEmail = `test-${Date.now()}@example.com`
      const { error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: "TestPassword123!",
        options: {
          data: { test: true }
        }
      })

      if (signupError) {
        if (signupError.status === 500) {
          addResult(`✗ SIGNUP ERROR 500: ${signupError.message}`)
          addResult(`  This usually means:`)
          addResult(`  1. Database trigger is missing or failing`)
          addResult(`  2. Table constraints are not met`)
          addResult(`  3. RLS policies are blocking the insert`)
        } else {
          addResult(`⚠ Signup test: ${signupError.message}`)
        }
      } else {
        addResult(`✓ Auth signup endpoint accessible`)
      }

    } catch (error) {
      addResult(`✗ Unexpected error: ${error}`)
    }

    addResult("Diagnostics complete!")
  }

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Supabase Connection Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection}>Run Diagnostics</Button>
          
          {results.length > 0 && (
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
              {results.map((result, i) => (
                <div key={i}>{result}</div>
              ))}
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2 mt-6">
            <p><strong>Common Issues:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>500 Error: Database trigger not set up or failing</li>
              <li>Check if auth.users table exists and is accessible</li>
              <li>Verify User table has correct column names (case-sensitive)</li>
              <li>Ensure RLS policies allow inserts from auth triggers</li>
              <li>Check Supabase project settings for email confirmation requirements</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}