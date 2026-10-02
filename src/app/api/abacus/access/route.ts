import { apiRoute } from '@/lib/abacus/runtime';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const POST = (request: Request) => apiRoute('access', request);
