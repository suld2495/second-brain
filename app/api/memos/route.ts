import { NextRequest, NextResponse } from 'next/server';
import { memoRepository } from '@/src/infrastructure/persistence/repository';

interface CreateMemoRequest {
  content: string;
}

export async function GET(): Promise<NextResponse> {
  const memos = await memoRepository.findAll();

  return NextResponse.json(
    memos.map((memo) => ({
      id: memo.id,
      content: memo.content,
      createdAt: memo.createdAt.toISOString(),
    }))
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body: unknown = await request.json();

  if (!isValidCreateMemoRequest(body)) {
    return NextResponse.json(
      { error: 'content is required' },
      { status: 400 }
    );
  }

  const memo = await memoRepository.create({ content: body.content });

  return NextResponse.json(
    {
      id: memo.id,
      content: memo.content,
      createdAt: memo.createdAt.toISOString(),
    },
    { status: 201 }
  );
}

function isValidCreateMemoRequest(body: unknown): body is CreateMemoRequest {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const { content } = body as Record<string, unknown>;

  if (typeof content !== 'string' || content.trim() === '') {
    return false;
  }

  return true;
}
