import type { MemoRepository } from '@/src/domain/memo';
import { memoNotFound, noContent } from '@/src/http/responses';

interface DeleteMemoHandlerInput {
  id: string;
  repo: MemoRepository;
}

export async function deleteMemoHandler(
  input: DeleteMemoHandlerInput
): Promise<Response> {
  const deleted = await input.repo.delete(input.id);

  if (!deleted) {
    return memoNotFound();
  }

  return noContent();
}
