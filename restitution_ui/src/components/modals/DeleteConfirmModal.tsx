type DeleteConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md p-6 max-w-sm w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Confirmer la suppression
        </h2>
        <p className="mb-6 text-gray-600">
          Êtes-vous sûr de vouloir supprimer cette restitution ? Cette action
          est irréversible.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            {isLoading ? "Suppression..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
