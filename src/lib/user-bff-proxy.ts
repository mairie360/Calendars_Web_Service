import { NextRequest } from 'next/server';
import { forwardToBff, validatedBffUrl } from './bff-proxy';

export function userBffRequest(request: NextRequest, path: string) {
  const baseUrl = validatedBffUrl(process.env.USER_BFF_URL ?? process.env.BFF_USER_API_URL);
  return forwardToBff(request, baseUrl, path);
}
