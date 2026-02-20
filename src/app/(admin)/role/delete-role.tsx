import { Trash2, X } from 'lucide-react'
import { iRole } from '@/types/auth.types'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { RoleServiceInstance } from '@/services/role.service'
import { useState } from 'react'

const DeleteRole = ({ onAction, Role }: { onAction?: () => void; Role: iRole }) => {
    const [modal, setModal] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const roleServ = RoleServiceInstance();

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeleting(true);
        try {
            const res = await roleServ.deleteRole(Role?.id!);
            if (res.success) {
                toast.success("Role deleted successfully!");
                onAction?.();
                setModal(false);
            } else {
                toast.error(res?.message || "Failed to delete Role");
            }
        } catch (err) {
            toast.error("Failed to delete Role");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setModal(true)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Delete Role"
            >
                <Trash2 size={18} />
            </button>

            <Modal
                isOpen={modal}
                onClose={() => setModal(false)}
                className="max-w-sm p-0 overflow-hidden bg-transparent shadow-none border-none"
            >
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-50 dark:border-red-900/20">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Remove Role?
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 px-2">
                            Are you sure you want to delete <span className="font-bold text-gray-800 dark:text-gray-200">{Role.name}</span>?
                            This action cannot be undone and may affect users assigned to this role.
                        </p>
                    </div>

                    <form onSubmit={handleDelete} className="px-6 py-5 bg-gray-50/80 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700/50 flex flex-col gap-2">
                        <button
                            type="submit"
                            disabled={deleting}
                            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {deleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Deleting...
                                </>
                            ) : "Yes, Delete Role"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setModal(false)}
                            disabled={deleting}
                            className="w-full py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all rounded-xl"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default DeleteRole;
