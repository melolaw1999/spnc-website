import { initializationPageRoute } from '@/lib/abacus/initialization-page';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = (request: Request) => initializationPageRoute(request, 'page');
