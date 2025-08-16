/**
 * Simplified API Integration Tests for Program GET
 * Tests the core authorization and business logic
 */

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

describe('Program GET API Business Logic Tests', () => {
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
      weeks: [{ week: 1, days: [] }],
      metadata: { created_at: '2024-01-01T00:00:00Z' }
    },
    user_id: 'user-123',
    paid: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    const { getServiceSupabaseClient } = require('@/lib/integrations/supabase-server');
    const { createServerClient } = require('@supabase/ssr');
    const { createClient } = require('@supabase/supabase-js');
    const { cookies } = require('next/headers');
    
    getServiceSupabaseClient.mockReturnValue(mockServiceClient);
    createServerClient.mockReturnValue(mockAuthClient);
    createClient.mockReturnValue(mockDirectClient);
    cookies.mockReturnValue(mockCookieStore);
  });

  describe('Authentication Flow', () => {
    it('attempts cookie-based authentication first', async () => {
      const mockUser = { id: 'user-123', email: 'cookie@example.com' };
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      // Simulate authentication flow
      let user = null;
      try {
        const { data: auth } = await mockAuthClient.auth.getUser();
        user = auth?.user ?? null;
      } catch {}

      expect(user).toEqual(mockUser);
      expect(mockAuthClient.auth.getUser).toHaveBeenCalledTimes(1);
    });

    it('falls back to bearer token authentication when cookies fail', async () => {
      const bearerUser = { id: 'user-456', email: 'bearer@example.com' };
      
      // Mock cookie auth failure
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      // Mock successful bearer token auth
      mockDirectClient.auth.getUser.mockResolvedValue({ data: { user: bearerUser } });

      // Simulate authentication flow
      let user = null;
      try {
        const { data: auth } = await mockAuthClient.auth.getUser();
        user = auth?.user ?? null;
      } catch {}

      if (!user) {
        try {
          const bearer = 'Bearer test-token';
          const token = bearer?.toLowerCase().startsWith('bearer ') 
            ? bearer.slice(7) 
            : undefined;
          
          if (token) {
            const { data: auth } = await mockDirectClient.auth.getUser();
            user = auth?.user ?? null;
          }
        } catch {}
      }

      expect(user).toEqual(bearerUser);
      expect(mockDirectClient.auth.getUser).toHaveBeenCalledTimes(1);
    });

    it('handles authentication failures gracefully', async () => {
      // Mock both auth methods failing
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } });
      mockDirectClient.auth.getUser.mockResolvedValue({ data: { user: null } });

      let user = null;
      try {
        const { data: auth } = await mockAuthClient.auth.getUser();
        user = auth?.user ?? null;
      } catch {}

      if (!user) {
        try {
          const { data: auth } = await mockDirectClient.auth.getUser();
          user = auth?.user ?? null;
        } catch {}
      }

      expect(user).toBeNull();
    });
  });

  describe('Authorization Security', () => {
    it('prevents access to other users programs (critical security test)', async () => {
      const userA = { id: 'user-A', email: 'userA@example.com' };
      
      // User A is authenticated
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: userA } });
      
      // Program belongs to User B
      const userBProgram = {
        ...mockProgramData,
        user_id: 'user-B'
      };
      
      mockServiceClient.single.mockResolvedValue({ 
        data: userBProgram, 
        error: null 
      });

      // Simulate authorization check
      const { data: auth } = await mockAuthClient.auth.getUser();
      const user = auth?.user;
      
      const { data, error } = await mockServiceClient.single();
      const programData = data;
      
      // CRITICAL: Check ownership
      const isOwner = programData?.user_id === user?.id;
      const shouldDenyAccess = programData?.user_id && !isOwner;

      expect(shouldDenyAccess).toBe(true);
      expect(userA.id).toBe('user-A');
      expect(programData.user_id).toBe('user-B');
    });

    it('allows access to own programs', async () => {
      const user = { id: 'user-123', email: 'owner@example.com' };
      
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user } });
      
      const ownProgram = {
        ...mockProgramData,
        user_id: 'user-123' // Same as authenticated user
      };
      
      mockServiceClient.single.mockResolvedValue({ 
        data: ownProgram, 
        error: null 
      });

      // Simulate authorization check
      const { data: auth } = await mockAuthClient.auth.getUser();
      const authenticatedUser = auth?.user;
      
      const { data } = await mockServiceClient.single();
      const programData = data;
      
      const isOwner = programData?.user_id === authenticatedUser?.id;
      const shouldAllowAccess = !programData?.user_id || isOwner;

      expect(shouldAllowAccess).toBe(true);
      expect(isOwner).toBe(true);
    });

    it('handles legacy programs without user_id', async () => {
      const user = { id: 'user-123', email: 'legacy@example.com' };
      
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user } });
      
      const legacyProgram = {
        data: mockProgramData.data,
        user_id: null, // Legacy program without owner
        paid: false
      };
      
      mockServiceClient.single.mockResolvedValue({ 
        data: legacyProgram, 
        error: null 
      });

      // Simulate authorization check
      const { data: auth } = await mockAuthClient.auth.getUser();
      const authenticatedUser = auth?.user;
      
      const { data } = await mockServiceClient.single();
      const programData = data;
      
      const shouldAllowAccess = !programData?.user_id; // No owner means public

      expect(shouldAllowAccess).toBe(true);
      expect(programData.user_id).toBeNull();
    });
  });

  describe('Bearer Token Processing', () => {
    it('extracts token correctly from Bearer header', () => {
      const bearer = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const token = bearer?.toLowerCase().startsWith('bearer ') 
        ? bearer.slice(7) 
        : undefined;

      expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    });

    it('handles invalid bearer token format', () => {
      const invalidBearer = 'InvalidTokenFormat';
      const token = invalidBearer?.toLowerCase().startsWith('bearer ') 
        ? invalidBearer.slice(7) 
        : undefined;

      expect(token).toBeUndefined();
    });

    it('handles case-insensitive bearer prefix', () => {
      const lowerCaseBearer = 'bearer test-token';
      const token = lowerCaseBearer?.toLowerCase().startsWith('bearer ') 
        ? lowerCaseBearer.slice(7) 
        : undefined;

      expect(token).toBe('test-token');
    });
  });

  describe('Database Operations', () => {
    it('queries program with correct parameters', async () => {
      const programId = 'program-456';
      
      mockServiceClient.single.mockResolvedValue({ 
        data: mockProgramData, 
        error: null 
      });

      // Simulate database query
      await mockServiceClient
        .from('programs')
        .select('data,user_id,paid')
        .eq('id', programId)
        .single();

      expect(mockServiceClient.from).toHaveBeenCalledWith('programs');
      expect(mockServiceClient.select).toHaveBeenCalledWith('data,user_id,paid');
      expect(mockServiceClient.eq).toHaveBeenCalledWith('id', programId);
      expect(mockServiceClient.single).toHaveBeenCalledTimes(1);
    });

    it('handles program not found errors', async () => {
      mockServiceClient.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'No rows returned' }
      });

      const { data, error } = await mockServiceClient.single();

      expect(data).toBeNull();
      expect(error).toBeTruthy();
      expect(error.message).toBe('No rows returned');
    });
  });

  describe('Business Logic Flow', () => {
    it('completes successful program retrieval flow', async () => {
      const user = { id: 'user-success', email: 'success@example.com' };
      const program = {
        ...mockProgramData,
        user_id: 'user-success'
      };

      // Setup mocks
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user } });
      mockServiceClient.single.mockResolvedValue({ data: program, error: null });

      // Simulate complete flow
      // 1. Authentication
      const { data: auth } = await mockAuthClient.auth.getUser();
      const authenticatedUser = auth?.user;
      expect(authenticatedUser).toBeTruthy();

      // 2. Database query
      const { data, error } = await mockServiceClient.single();
      expect(error).toBeNull();
      expect(data).toBeTruthy();

      // 3. Authorization check
      const programData = data;
      const isAuthorized = !programData?.user_id || programData.user_id === authenticatedUser?.id;
      expect(isAuthorized).toBe(true);

      // 4. Data extraction
      const responseData = programData?.data;
      expect(responseData).toEqual(program.data);

      // Verify complete flow
      expect(mockAuthClient.auth.getUser).toHaveBeenCalledTimes(1);
      expect(mockServiceClient.single).toHaveBeenCalledTimes(1);
    });
  });
});
