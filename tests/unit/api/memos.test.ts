import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../../../app/api/memos/route';
import { NextRequest } from 'next/server';

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/memos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/memos', () => {
  it('should create a memo with valid content', async () => {
    const request = createRequest({ content: '내일 치과 예약' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.content).toBe('내일 치과 예약');
    expect(data.createdAt).toBeDefined();
  });

  it('should return 400 when content is missing', async () => {
    const request = createRequest({});

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('content is required');
  });

  it('should return 400 when content is empty string', async () => {
    const request = createRequest({ content: '' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('content is required');
  });

  it('should return 400 when content is whitespace only', async () => {
    const request = createRequest({ content: '   ' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('content is required');
  });

  it('should return 400 when body is not an object', async () => {
    const request = createRequest('invalid');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('content is required');
  });
});
