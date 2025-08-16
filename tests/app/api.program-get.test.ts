import { NextRequest } from 'next/server';
import { GET } from '@/app/api/program/[id]/route';

// Mock the Supabase integrations
jest.mock('@/lib/integrations/supabase-server', () => ({
  getServiceSupabaseClient: jest.fn()
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn()
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));

describe('Program GET API Integration Tests', () => {
  const mockServiceClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn()
  };

  const mockAuthClient = {
    auth: {
      getUser: jest.fn()
    }
  };

  const mockDirectClient = {
    auth: {
      getUser: jest.fn()
    }
  };

  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn()
  };

  const mockProgramData = {
    data: {
      program_id: 'program-123',
      name: 'Test Program',
      weeks: [
        { week: 1, days: [] }
      ],
      metadata: { created_at: '2024-01-01T00:00:00Z' }
    },
    user_id: 'user-123',
    paid: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    const { getServiceSupabaseClient } = require('@/lib/integrations/supabase-server');
    const { createServerClient } = require('@supabase/ssr');
    const { createClient } = require('@supabase/supabase-js');
    const { cookies } = require('next/headers');
    
    getServiceSupabaseClient.mockReturnValue(mockServiceClient);
    createServerClient.mockReturnValue(mockAuthClient);
    createClient.mockReturnValue(mockDirectClient);
    cookies.mockReturnValue(mockCookieStore);
  });

  describe('Authentication and Authorization', () => {
    it('returns 401 Unauthorized when no user is authenticated (no cookies or bearer token)', async () => {
      // Mock unauthenticated state - no cookies
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      // Mock no bearer token in direct client
      mockDirectClient.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/program-123', {
          method: 'GET'
        })
      );

      const response = await GET(request, { params: { id: 'program-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(mockServiceClient.select).not.toHaveBeenCalled();
    });

    it('authenticates successfully with cookies', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      mockServiceClient.single.mockResolvedValue({ 
        data: mockProgramData, 
        error: null 
      });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/program-123', {
          method: 'GET'
        })
      );

      const response = await GET(request, { params: { id: 'program-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProgramData.data);
    });

    it('authenticates successfully with Bearer token when cookies fail', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      // Mock cookie auth failure
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      // Mock successful bearer token auth
      mockDirectClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      mockServiceClient.single.mockResolvedValue({ 
        data: mockProgramData, 
        error: null 
      });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/program-123', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-jwt-token'
          }
        })
      );

      const response = await GET(request, { params: { id: 'program-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProgramData.data);
    });

    it('returns 403 Forbidden when User A tries to access User B\'s program', async () => {
      // User A is authenticated
      const userA = { id: 'user-A', email: 'userA@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: userA } });
      
      // Program belongs to User B
      const userBProgram = {
        ...mockProgramData,
        user_id: 'user-B'  // Different owner
      };
      
      mockServiceClient.single.mockResolvedValue({ 
        data: userBProgram, 
        error: null 
      });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/program-123', {
          method: 'GET'
        })
      );

      const response = await GET(request, { params: { id: 'program-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Forbidden' });
    });

    it('returns program data when authenticated user requests their own program', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Program belongs to the same user
      const userProgram = {
        ...mockProgramData,
        user_id: 'user-123'  // Same as authenticated user
      };
      
      mockServiceClient.single.mockResolvedValue({ 
        data: userProgram, 
        error: null 
      });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/program-123', {
          method: 'GET'
        })
      );

      const response = await GET(request, { params: { id: 'program-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(userProgram.data);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Cache-Control')).toBe('private, max-age=15');
    });
  });

  describe('Program Retrieval', () => {
    it('returns 404 when program does not exist', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Mock program not found
      mockServiceClient.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'No rows returned' }
      });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/nonexistent-program', {
          method: 'GET'
        })
      );

      const response = await GET(request, { params: { id: 'nonexistent-program' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'No rows returned' });
      expect(response.headers.get('Cache-Control')).toBe('private, max-age=15');
    });

    it('handles programs without user_id (legacy data)', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Mock legacy program without user_id
      const legacyProgram = {
        data: mockProgramData.data,
        user_id: null,  // No owner
        paid: false
      };
      
      mockServiceClient.single.mockResolvedValue({ 
        data: legacyProgram, 
        error: null 
      });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/legacy-program', {
          method: 'GET'
        })
      );

      const response = await GET(request, { params: { id: 'legacy-program' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(legacyProgram.data);
    });
  });

  describe('Bearer Token Authentication', () => {
    it('handles invalid bearer token format', async () => {
      // Mock cookie auth failure
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      // Mock bearer token auth failure
      mockDirectClient.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/program-123', {
          method: 'GET',
          headers: {
            'Authorization': 'InvalidTokenFormat'  // Not "Bearer ..."
          }
        })
      );

      const response = await GET(request, { params: { id: 'program-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('extracts token correctly from Bearer header', async () => {
      const mockUser = { id: 'user-456', email: 'bearer@example.com' };
      
      // Mock cookie auth failure
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      // Mock successful bearer token auth
      mockDirectClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      const userProgram = {
        ...mockProgramData,
        user_id: 'user-456'
      };
      
      mockServiceClient.single.mockResolvedValue({ 
        data: userProgram, 
        error: null 
      });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/program-123', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        })
      );

      const response = await GET(request, { params: { id: 'program-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(userProgram.data);
    });

    it('handles case-insensitive Authorization header', async () => {
      const mockUser = { id: 'user-789', email: 'case@example.com' };
      
      // Mock cookie auth failure
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      // Mock successful bearer token auth
      mockDirectClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      const userProgram = {
        ...mockProgramData,
        user_id: 'user-789'
      };
      
      mockServiceClient.single.mockResolvedValue({ 
        data: userProgram, 
        error: null 
      });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/program-123', {
          method: 'GET',
          headers: {
            'authorization': 'bearer test-token'  // lowercase header
          }
        })
      );

      const response = await GET(request, { params: { id: 'program-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(userProgram.data);
    });
  });

  describe('Error Handling', () => {
    it('handles unexpected exceptions gracefully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Mock unexpected error
      mockServiceClient.single.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/program-123', {
          method: 'GET'
        })
      );

      const response = await GET(request, { params: { id: 'program-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Database connection failed' });
    });

    it('handles auth service exceptions during cookie authentication', async () => {
      // Mock auth service exception
      mockAuthClient.auth.getUser.mockRejectedValue(new Error('Auth service unavailable'));
      
      // Mock bearer token fallback also fails
      mockDirectClient.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/program-123', {
          method: 'GET'
        })
      );

      const response = await GET(request, { params: { id: 'program-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('handles auth service exceptions during bearer token authentication', async () => {
      const mockUser = { id: 'user-123', email: 'fallback@example.com' };
      
      // Mock cookie auth failure
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      // Mock bearer auth service exception - should be caught and result in 401
      mockDirectClient.auth.getUser.mockRejectedValue(new Error('Token validation failed'));

      const request = new NextRequest(
        new Request('http://localhost:3000/api/program/program-123', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer invalid-token'
          }
        })
      );

      const response = await GET(request, { params: { id: 'program-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });
});
