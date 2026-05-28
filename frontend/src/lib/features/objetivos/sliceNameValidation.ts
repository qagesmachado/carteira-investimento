export type SliceNameRow = { id: number; slice_name: string };

function normalizeSliceName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Verifica nome duplicado entre fatias do objetivo.
 * Na edição, ignora a linha atual (mesmo id ou mesmo nome já gravado).
 */
export function hasDuplicateSliceName(
  allocations: SliceNameRow[],
  sliceName: string,
  editingAllocationId: number | null
): boolean {
  const key = normalizeSliceName(sliceName);
  if (!key) {
    return false;
  }

  const editingId =
    editingAllocationId != null ? Number(editingAllocationId) : null;

  if (editingId != null) {
    const current = allocations.find((row) => Number(row.id) === editingId);
    if (current && normalizeSliceName(current.slice_name) === key) {
      return false;
    }
  }

  return allocations.some((row) => {
    if (editingId != null && Number(row.id) === editingId) {
      return false;
    }
    return normalizeSliceName(row.slice_name) === key;
  });
}
