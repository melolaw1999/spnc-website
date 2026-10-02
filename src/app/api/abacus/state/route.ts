import { apiRoute } from '@/lib/abacus/runtime';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const PUT = (request: Request) => apiRoute('state', request);
