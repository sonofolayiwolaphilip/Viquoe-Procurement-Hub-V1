type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  userId?: string
  component: string
  metadata?: Record<string, any>
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    }
    
    const currentLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    return levels[level] <= levels[currentLevel as LogLevel]
  }

  private log(level: LogLevel, component: string, message: string, metadata?: Record<string, any>) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      component,
      metadata
    }

    // In production, you'd send this to a logging service
    console[level](JSON.stringify(entry))
  }

  error(component: string, message: string, error?: any) {
    this.log('error', component, message, { error: error?.message, stack: error?.stack })
  }

  warn(component: string, message: string, metadata?: Record<string, any>) {
    this.log('warn', component, message, metadata)
  }

  info(component: string, message: string, metadata?: Record<string, any>) {
    this.log('info', component, message, metadata)
  }

  debug(component: string, message: string, metadata?: Record<string, any>) {
    this.log('debug', component, message, metadata)
  }
}

export const logger = new Logger()