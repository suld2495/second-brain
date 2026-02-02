import type { Memo, CreateMemoInput } from './Memo';

export interface MemoRepository {
  create(input: CreateMemoInput): Promise<Memo>;
  findById(id: string): Promise<Memo | null>;
  findAll(): Promise<Memo[]>;
  delete(id: string): Promise<boolean>;
}
