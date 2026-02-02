export interface Memo {
  readonly id: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateMemoInput {
  content: string;
}
