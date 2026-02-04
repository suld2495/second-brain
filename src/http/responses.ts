import { NextResponse } from 'next/server';

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

export function memoNotFound(): Response {
  return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
}
