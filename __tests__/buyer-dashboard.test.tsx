import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BuyerDashboard from '@/components/buyer-dashboard'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabaseClient'

// Mock dependencies
vi.mock('@/components/auth-provider')
vi.mock('@/lib/supabaseClient')
vi.mock('@/hooks/useRealTimeUpdates')
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

const mockUser = {
  id: 'user-123',
  email: 'buyer@example.com',
  userType: 'buyer'
}

const mockOrders = [
  {
    id: 'order-1',
    items: ['Laptop', 'Mouse'],
    supplier: 'TechSupply',
    total: 150000,
    status: 'pending' as const,
    date: '2024-01-15',
    buyer_id: 'user-123'
  }
]

const mockQuotes = [
  {
    id: 'quote-1',
    product_name: 'Office Chair',
    supplier: 'Furniture Plus',
    quantity: 10,
    urgency: 'high',
    status: 'pending',
    unit_price: 25000,
    total_price: 250000,
    created_at: '2024-01-15',
    contact_person: 'John Doe',
    phone: '+1234567890',
    delivery_address: '123 Main St',
    notes: 'Ergonomic chairs preferred'
  }
]

describe('BuyerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false
    })
  })

  it('renders dashboard with user information', () => {
    render(<BuyerDashboard />)
    
    expect(screen.getByText('Buyer Dashboard')).toBeInTheDocument()
    expect(screen.getByText(`Welcome back, ${mockUser.email}`)).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    ;(useAuth as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true
    })

    render(<BuyerDashboard />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('fetches and displays orders and quotes', async () => {
    const mockFrom = vi.fn().mockReturnThis()
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockOrder = vi.fn().mockResolvedValue({
      data: mockOrders,
      error: null
    })

    ;(supabase.from as any).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder
    })

    render(<BuyerDashboard />)

    await waitFor(() => {
      expect(screen.getByText('ORD-order-1')).toBeInTheDocument()
    })
  })

  it('handles refresh button click', async () => {
    render(<BuyerDashboard />)
    
    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByText('Refreshing...')).toBeInTheDocument()
    })
  })

  it('shows confirmation modal when deleting order', async () => {
    render(<BuyerDashboard />)

    const deleteButton = screen.getByLabelText(/delete order/i)
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Delete Order')).toBeInTheDocument()
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument()
    })
  })

  it('displays error messages', async () => {
    const errorMessage = 'Failed to fetch orders'
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: errorMessage }
      })
    })

    render(<BuyerDashboard />)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('calculates dashboard statistics correctly', async () => {
    const ordersWithMixedStatus = [
      { ...mockOrders[0], status: 'delivered' as const, total: 100000 },
      { ...mockOrders[0], id: 'order-2', status: 'pending' as const, total: 50000 },
      { ...mockOrders[0], id: 'order-3', status: 'delivered' as const, total: 75000 }
    ]public.orders

    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: ordersWithMixedStatus,
        error: null
      })
    })

    render(<BuyerDashboard />)

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument() // Total Orders
      expect(screen.getByText('1')).toBeInTheDocument() // Pending Orders
      expect(screen.getByText('2')).toBeInTheDocument() // Delivered Orders
      expect(screen.getByText('₦175,000')).toBeInTheDocument