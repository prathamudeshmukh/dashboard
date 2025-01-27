import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { authenticateApi } from './authenticateApi';

// wrapper function that takes an API handler as an argument
export function withApiAuth(handler: (req: NextRequest, params: { params: any }) => Promise<NextResponse>) {
  // Return a new function that wraps the original handler
  return async (req: NextRequest, context: { params: any }) => {
    // First, perform authentication
    const authResult = await authenticateApi(req);

    // If authentication fails, return the error response
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // If authentication succeeds, call the original handler
    return handler(req, context);
  };
}
