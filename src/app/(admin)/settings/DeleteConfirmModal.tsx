export default function DeleteConfirmModal({
  onConfirm,
  onCancel,
  loading,
}: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-lg font-semibold dark:text-gray-200">
          Delete Setting?
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded dark:border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
