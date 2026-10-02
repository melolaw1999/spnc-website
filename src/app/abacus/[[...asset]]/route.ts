import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { services } from '@/lib/abacus/runtime';
import { errorResponse } from '@/lib/abacus/handlers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type ShellFile = { path: string; contentType: string; access: 'authenticated' | 'public' };

export async function GET(request: Request, context: { params: Promise<{ asset?: string[] }> }) {
  const parts = (await context.params).asset || [];
  const requested = parts.length ? parts.join('/') : 'index.html';
  const name = requested === 'access' ? 'access.html' : requested;
  try {
    const directory = path.join(process.cwd(), 'abacus-shell');
    const manifest = JSON.parse(await readFile(path.join(directory, 'shell-files.json'), 'utf8')) as { files: ShellFile[] };
    const file = manifest.files.find(entry => entry.path === name);
    if (!file || name.split('/').some(part => !part || part === '.' || part === '..')) return new Response(null, { status: 404 });
    if (file.access !== 'public') {
      try {
        const auth = services().auth;
        await auth.requireSession(request);
      } catch (error) {
        if (name === 'index.html') return new Response(null, { status: 303, headers: { Location: '/abacus/access', 'Cache-Control': 'no-store' } });
        return errorResponse(error);
      }
    }
    const bytes = await readFile(path.join(directory, name));
    return new Response(new Uint8Array(bytes), { headers: {
      'Content-Type': file.contentType,
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'DENY',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
      ...(name === 'sw.js' ? { 'Service-Worker-Allowed': '/abacus/' } : {}),
    } });
  } catch { return errorResponse({ code: 'unavailable' }); }
}
