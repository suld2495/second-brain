import { randomUUID } from 'node:crypto';
import type { Memo, CreateMemoInput, MemoRepository } from '@/src/domain/memo';

export class InMemoryMemoRepository implements MemoRepository {
  private readonly memos = new Map<string, Memo>();

  async create(input: CreateMemoInput): Promise<Memo> {
    const now = new Date();
    const memo: Memo = {
      id: randomUUID(),
      content: input.content,
      createdAt: now,
      updatedAt: now,
    };
    this.memos.set(memo.id, memo);
    return memo;
  }

  async findById(id: string): Promise<Memo | null> {
    return this.memos.get(id) ?? null;
  }

  async findAll(): Promise<Memo[]> {
    const memos = Array.from(this.memos.values());
    return memos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(id: string): Promise<boolean> {
    return this.memos.delete(id);
  }
}
