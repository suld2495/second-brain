import { NextRequest, NextResponse } from 'next/server';
import { memoRepository } from '@/src/infrastructure/persistence/repository';
import { memoNotFound } from '@/src/http/responses';
import { deleteMemoHandler } from '@/src/memos/http/deleteMemoHandler';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  const { id } = await params;
  const memo = await memoRepository.findById(id);

  if (!memo) {
    return memoNotFound();
  }

  return NextResponse.json({
    id: memo.id,
    content: memo.content,
    createdAt: memo.createdAt.toISOString(),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  const { id } = await params;
  return deleteMemoHandler({ id, repo: memoRepository });
}
