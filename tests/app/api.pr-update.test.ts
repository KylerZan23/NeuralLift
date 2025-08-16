import { NextRequest } from 'next/server';
import { POST } from '@/app/api/pr/update/route';

// Mock the Supabase integrations
jest.mock('@/lib/integrations/supabase-server', () => ({
  getServiceSupabaseClient: jest.fn()
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn()
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));

describe('PR Update API Integration Tests', () => {
  const mockServiceClient = {
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn(),
    insert: jest.fn()
  };

  const mockAuthClient = {
    auth: {
      getUser: jest.fn()
    }
  };

  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    const { getServiceSupabaseClient } = require('@/lib/integrations/supabase-server');
    const { createServerClient } = require('@supabase/ssr');
    const { cookies } = require('next/headers');
    
    getServiceSupabaseClient.mockReturnValue(mockServiceClient);
    createServerClient.mockReturnValue(mockAuthClient);
    cookies.mockReturnValue(mockCookieStore);
  });

  describe('Authentication and Authorization', () => {
    it('returns 401 Unauthorized when no user is authenticated', async () => {
      // Mock unauthenticated state
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/pr/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bench: 225, squat: 315, deadlift: 405 })
        })
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(mockServiceClient.upsert).not.toHaveBeenCalled();
    });

    it('successfully updates PR for authenticated user', async () => {
      // Mock authenticated state
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Mock successful database operations
      mockServiceClient.upsert.mockResolvedValue({ error: null });
      mockServiceClient.insert.mockResolvedValue({ error: null });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/pr/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bench: 225, squat: 315, deadlift: 405 })
        })
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ok: true });
      
      // Verify the service was called with the authenticated user's ID
      expect(mockServiceClient.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          bench: 225,
          squat: 315,
          deadlift: 405
        })
      );
      
      // Verify PR history was created
      expect(mockServiceClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          bench: 225,
          squat: 315,
          deadlift: 405
        })
      );
    });

    it('uses session user ID and ignores any user_id in payload (security test)', async () => {
      // Mock authenticated state for user-123
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      mockServiceClient.upsert.mockResolvedValue({ error: null });
      mockServiceClient.insert.mockResolvedValue({ error: null });

      // Attempt to send a malicious payload with different user_id
      const maliciousPayload = {
        bench: 225,
        squat: 315,
        deadlift: 405,
        user_id: 'attacker-user-456' // This should be completely ignored
      };

      const request = new NextRequest(
        new Request('http://localhost:3000/api/pr/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(maliciousPayload)
        })
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ok: true });
      
      // CRITICAL: Verify that only the authenticated user's ID is used
      expect(mockServiceClient.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123', // Should be session user, not payload user
          bench: 225,
          squat: 315,
          deadlift: 405
        })
      );
      
      // Verify the malicious user_id was NOT used
      expect(mockServiceClient.upsert).not.toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'attacker-user-456'
        })
      );
    });
  });

  describe('Input Validation', () => {
    it('returns 400 for invalid request body', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/pr/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bench: 'invalid-number' })
        })
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid body' });
      expect(mockServiceClient.upsert).not.toHaveBeenCalled();
    });

    it('accepts partial PR updates', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      mockServiceClient.upsert.mockResolvedValue({ error: null });
      mockServiceClient.insert.mockResolvedValue({ error: null });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/pr/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bench: 245 }) // Only updating bench
        })
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ok: true });
      
      expect(mockServiceClient.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          bench: 245,
          squat: undefined,
          deadlift: undefined
        })
      );
    });
  });

  describe('Database Error Handling', () => {
    it('returns 500 when database upsert fails', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Mock database error
      mockServiceClient.upsert.mockResolvedValue({ 
        error: { message: 'Database connection failed' } 
      });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/pr/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bench: 225 })
        })
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Database connection failed' });
    });

    it('handles unexpected exceptions gracefully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Mock unexpected error
      mockServiceClient.upsert.mockRejectedValue(new Error('Unexpected database error'));

      const request = new NextRequest(
        new Request('http://localhost:3000/api/pr/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bench: 225 })
        })
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Unexpected database error' });
    });
  });
});


