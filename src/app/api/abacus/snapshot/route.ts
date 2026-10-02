import { apiRoute } from '@/lib/abacus/runtime';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = (request: Request) => apiRoute('snapshot', request);
