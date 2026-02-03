import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as listGet } from '../../../app/api/memos/route';
import { GET as detailGet } from '../../../app/api/memos/[id]/route';
import { memoRepository } from '@/src/infrastructure/persistence/repository';

function createGetRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'GET' });
}

beforeEach(async () => {
  const memos = await memoRepository.findAll();
  let index = 0;
  while (index < memos.length) {
    const memo = memos[index];
    await memoRepository.delete(memo.id);
    index += 1;
  }
});

describe('GET /api/memos', () => {
  it('should return empty list when no memos exist', async () => {
    const response = await listGet();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toEqual([]);
  });

  it('should return memos sorted by latest first', async () => {
    vi.useFakeTimers();

    try {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const firstMemo = await memoRepository.create({ content: 'first memo' });

      vi.setSystemTime(new Date('2024-01-01T00:01:00.000Z'));
      const secondMemo = await memoRepository.create({ content: 'second memo' });

      const response = await listGet();
      const data = await response.json();

      const expectedCount = 2;
      const orderCheck =
        data[0].id === secondMemo.id && data[1].id === firstMemo.id;

      expect(response.status).toBe(200);
      expect(data.length).toBe(expectedCount);
      expect(orderCheck).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('GET /api/memos/:id', () => {
  it('should return memo detail when memo exists', async () => {
    const memo = await memoRepository.create({ content: 'detail memo' });

    const request = createGetRequest(
      `http://localhost:3000/api/memos/${memo.id}`
    );

    const response = await detailGet(request, {
      params: Promise.resolve({ id: memo.id }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(memo.id);
    expect(data.content).toBe('detail memo');
    expect(data.createdAt).toBeDefined();
  });

  it('should return 404 when memo does not exist', async () => {
    const request = createGetRequest('http://localhost:3000/api/memos/missing');

    const response = await detailGet(request, {
      params: Promise.resolve({ id: 'missing' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Memo not found');
  });
});
