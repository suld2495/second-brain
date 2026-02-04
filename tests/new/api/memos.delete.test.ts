import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as listGet } from '../../../app/api/memos/route';
import { GET as detailGet, DELETE as deleteMemo } from '../../../app/api/memos/[id]/route';
import { memoRepository } from '@/src/infrastructure/persistence/repository';

function createDeleteRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'DELETE' });
}

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

describe('DELETE /api/memos/:id', () => {
  it('should delete memo and return 204', async () => {
    const memo = await memoRepository.create({ content: 'to delete' });
    const request = createDeleteRequest(
      `http://localhost:3000/api/memos/${memo.id}`
    );

    const response = await deleteMemo(request, {
      params: Promise.resolve({ id: memo.id }),
    });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  });

  it('should return 404 when memo does not exist', async () => {
    const request = createDeleteRequest('http://localhost:3000/api/memos/missing');

    const response = await deleteMemo(request, {
      params: Promise.resolve({ id: 'missing' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Memo not found');
  });

  it('should not be able to fetch memo detail after deletion', async () => {
    const memo = await memoRepository.create({ content: 'delete then get' });

    const deleteRequest = createDeleteRequest(
      `http://localhost:3000/api/memos/${memo.id}`
    );

    const deleteResponse = await deleteMemo(deleteRequest, {
      params: Promise.resolve({ id: memo.id }),
    });

    expect(deleteResponse.status).toBe(204);

    const getRequest = createGetRequest(
      `http://localhost:3000/api/memos/${memo.id}`
    );
    const getResponse = await detailGet(getRequest, {
      params: Promise.resolve({ id: memo.id }),
    });
    const data = await getResponse.json();

    expect(getResponse.status).toBe(404);
    expect(data.error).toBe('Memo not found');
  });

  it('should not appear in list after deletion', async () => {
    const memo = await memoRepository.create({ content: 'delete then list' });

    const deleteRequest = createDeleteRequest(
      `http://localhost:3000/api/memos/${memo.id}`
    );

    const deleteResponse = await deleteMemo(deleteRequest, {
      params: Promise.resolve({ id: memo.id }),
    });

    expect(deleteResponse.status).toBe(204);

    const listResponse = await listGet();
    const listData = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listData)).toBe(true);
    expect(listData.some((item: { id: string }) => item.id === memo.id)).toBe(
      false
    );
  });
});
