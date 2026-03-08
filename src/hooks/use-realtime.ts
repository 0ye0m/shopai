'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

interface RealtimeConfig {
  table: string;
  filter?: string;
  onInsert?: (payload: Record<string, unknown>) => void;
  onUpdate?: (payload: Record<string, unknown>) => void;
  onDelete?: (payload: Record<string, unknown>) => void;
}

export function useRealtime({ table, filter, onInsert, onUpdate, onDelete }: RealtimeConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;

    const setupSubscription = async () => {
      try {
        channel = supabase.channel(`realtime-${table}-${Date.now()}`);

        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: filter ? `id=eq.${filter}` : undefined,
          },
          (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            
            switch (eventType) {
              case 'INSERT':
                onInsert?.(newRecord as Record<string, unknown>);
                break;
              case 'UPDATE':
                onUpdate?.(newRecord as Record<string, unknown>);
                break;
              case 'DELETE':
                onDelete?.(oldRecord as Record<string, unknown>);
                break;
            }
          }
        );

        await channel.subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
          setError(status === 'CHANNEL_ERROR' ? 'Failed to connect' : null);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, filter, onInsert, onUpdate, onDelete]);

  return { isConnected, error };
}

// Hook for real-time cart updates
export function useRealtimeCart(userId?: string) {
  const [cartItems, setCartItems] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!userId) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId);

      if (!error && data) {
        setCartItems(data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useRealtime({
    table: 'cart_items',
    filter: userId,
    onInsert: (payload) => {
      setCartItems((prev) => [...prev, payload]);
    },
    onUpdate: (payload) => {
      setCartItems((prev) =>
        prev.map((item) =>
          (item as { id: string }).id === (payload as { id: string }).id ? payload : item
        )
      );
    },
    onDelete: (payload) => {
      setCartItems((prev) =>
        prev.filter((item) => (item as { id: string }).id !== (payload as { id: string }).id)
      );
    },
  });

  return { cartItems, isLoading, refetch: fetchCart };
}

// Hook for real-time order updates
export function useRealtimeOrders(userId?: string) {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useRealtime({
    table: 'orders',
    filter: userId,
    onInsert: (payload) => {
      setOrders((prev) => [payload, ...prev]);
    },
    onUpdate: (payload) => {
      setOrders((prev) =>
        prev.map((order) =>
          (order as { id: string }).id === (payload as { id: string }).id ? payload : order
        )
      );
    },
  });

  return { orders, isLoading, refetch: fetchOrders };
}
