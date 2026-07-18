import { useEffect, useRef } from 'react';

// Same base the fetch client uses. In dev this is '/api' (proxied to the
// backend), so EventSource is same-origin and the auth cookie is sent.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Subscribes the logged-in client to their own live booking updates (SSE) and
// calls onBooking(booking) whenever one of their bookings changes — e.g. an
// admin approving or completing it. The callback is held in a ref so the
// connection stays open across re-renders; EventSource auto-reconnects on drop.
export function useBookingStream(onBooking) {
  const cbRef = useRef(onBooking);

  useEffect(() => {
    cbRef.current = onBooking;
  }, [onBooking]);

  useEffect(() => {
    const es = new EventSource(`${API_BASE}/bookings/stream`, {
      withCredentials: true,
    });

    es.addEventListener('booking', (e) => {
      let booking;
      try {
        booking = JSON.parse(e.data);
      } catch {
        return;
      }
      cbRef.current?.(booking);
    });

    return () => es.close();
  }, []);
}
