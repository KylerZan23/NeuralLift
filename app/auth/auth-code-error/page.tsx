'use client';
import { Button } from '@/lib/ui/button';
import { Card } from '@/lib/ui/card';
import { useRouter } from 'next/navigation';

export default function AuthCodeErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 mb-6">
            There was an issue completing your Google sign-in. This can happen if you closed the popup or there was a network issue.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Try Sign In Again
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/about')}
              className="w-full"
            >
              Learn More About NeuralLift
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
