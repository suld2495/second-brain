import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryMemoRepository } from '../../../src/infrastructure/persistence/InMemoryMemoRepository.js';

describe('InMemoryMemoRepository', () => {
  let repository: InMemoryMemoRepository;

  beforeEach(() => {
    repository = new InMemoryMemoRepository();
  });

  describe('create', () => {
    it('should create a memo with generated id and timestamps', async () => {
      const input = { content: '내일 치과 예약' };

      const memo = await repository.create(input);

      expect(memo.id).toBeDefined();
      expect(memo.content).toBe('내일 치과 예약');
      expect(memo.createdAt).toBeInstanceOf(Date);
      expect(memo.updatedAt).toBeInstanceOf(Date);
      expect(memo.createdAt.getTime()).toBe(memo.updatedAt.getTime());
    });

    it('should generate unique ids for each memo', async () => {
      const memo1 = await repository.create({ content: '메모 1' });
      const memo2 = await repository.create({ content: '메모 2' });

      expect(memo1.id).not.toBe(memo2.id);
    });
  });

  describe('findById', () => {
    it('should return memo when found', async () => {
      const created = await repository.create({ content: '테스트 메모' });

      const found = await repository.findById(created.id);

      expect(found).toEqual(created);
    });

    it('should return null when memo not found', async () => {
      const found = await repository.findById('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no memos exist', async () => {
      const memos = await repository.findAll();

      expect(memos).toEqual([]);
    });

    it('should return all memos sorted by createdAt descending', async () => {
      const memo1 = await repository.create({ content: '첫 번째 메모' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const memo2 = await repository.create({ content: '두 번째 메모' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const memo3 = await repository.create({ content: '세 번째 메모' });

      const memos = await repository.findAll();

      expect(memos).toHaveLength(3);
      expect(memos[0].id).toBe(memo3.id);
      expect(memos[1].id).toBe(memo2.id);
      expect(memos[2].id).toBe(memo1.id);
    });
  });

  describe('delete', () => {
    it('should return true and remove memo when found', async () => {
      const memo = await repository.create({ content: '삭제할 메모' });

      const result = await repository.delete(memo.id);
      const found = await repository.findById(memo.id);

      expect(result).toBe(true);
      expect(found).toBeNull();
    });

    it('should return false when memo not found', async () => {
      const result = await repository.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should not affect other memos when deleting', async () => {
      const memo1 = await repository.create({ content: '메모 1' });
      const memo2 = await repository.create({ content: '메모 2' });

      await repository.delete(memo1.id);
      const remaining = await repository.findAll();

      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(memo2.id);
    });
  });
});
