import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

interface UseRealTimeUpdatesProps {
  userId: string
  onOrderUpdate: (payload: any) => void
  onQuoteUpdate: (payload: any) => void
}

export function useRealTimeUpdates({ userId, onOrderUpdate, onQuoteUpdate }: UseRealTimeUpdatesProps) {
  useEffect(() => {
    if (!userId) return

    logger.info('useRealTimeUpdates', 'Setting up real-time subscriptions', { userId })

    // Subscribe to orders changes
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `buyer_id=eq.${userId}`
        },
        (payload) => {
          logger.debug('useRealTimeUpdates', 'Order change detected', { 
            event: payload.eventType, 
            orderId: payload.new?.id 
          })
          onOrderUpdate(payload)
        }
      )
      .subscribe()

    // Subscribe to quote requests changes
    const quotesSubscription = supabase
      .channel('quotes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_requests',
          filter: `buyer_id=eq.${userId}`
        },
        (payload) => {
          logger.debug('useRealTimeUpdates', 'Quote change detected', { 
            event: payload.eventType, 
            quoteId: payload.new?.id 
          })
          onQuoteUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      ordersSubscription.unsubscribe()
      quotesSubscription.unsubscribe()
      logger.info('useRealTimeUpdates', 'Real-time subscriptions cleaned up')
    }
  }, [userId, onOrderUpdate, onQuoteUpdate])
}