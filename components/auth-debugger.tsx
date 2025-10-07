"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"

export function AuthDebugger() {
  const { user, isAuthenticated, session, isLoading } = useAuth()
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const newLog = `${new Date().toLocaleTimeString()}: Auth State - Loading: ${isLoading}, Authenticated: ${isAuthenticated}, User: ${user?.email || 'None'}, Type: ${user?.userType || 'None'}, Session: ${session ? 'Yes' : 'No'}`
    
    setLogs(prev => [newLog, ...prev.slice(0, 9)]) // Keep last 10 logs
  }, [user, isAuthenticated, session, isLoading])

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 text-xs max-w-md rounded-lg shadow-lg z-50">
      <div className="mb-2 font-bold text-green-400">🔍 Auth Debug</div>
      <div className="space-y-1">
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {user?.email || '❌'}</div>
        <div>Type: {user?.userType || '❌'}</div>
        <div>Session: {session ? '✅' : '❌'}</div>
      </div>
      
      <div className="mt-3 border-t border-gray-600 pt-2">
        <div className="text-gray-400 text-xs mb-1">Recent logs:</div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="text-xs text-gray-300 leading-tight">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}