import type { NextRequest } from 'next/server';

import { POST } from '@/app/[locale]/convert/[templateId]/route';

export async function getResponse(request: NextRequest, templateId: string) {
  const response = await POST(request, { params: { templateId } });
  return { response };
}
