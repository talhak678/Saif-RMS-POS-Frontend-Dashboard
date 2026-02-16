import { useState } from 'react'
import { Trash } from 'lucide-react'
import { iPermission } from '@/types/auth.types'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button/Button'
import { RoleServiceInstance } from '@/services/role.service'

const DeletePermission = ({ onAction, Permission }: { onAction?: () => void, Permission: iPermission }) => {
    const [modal, setModal] = useState<boolean>(false)
    const [deleting, setDeleting] = useState<boolean>(false)
    const permServ = RoleServiceInstance()

    async function deletePermission() {
        setDeleting(true)
        try {
            const res = await permServ.deletePermission(Permission?.id!)
            if (res.success) {
                toast.success('Permission deleted successfully!')
                onAction?.()
                setModal(false)
            }
            else {
                toast.error(res?.message || 'Failed to delete Permission')
            }
        }
        catch (err) {
            toast.error('Failed to delete Permission')
        }
        finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <Button variant={'ghost'} size={'icon'} onClick={() => setModal(true)}>
                <Trash />
            </Button>
            <Modal isOpen={modal} onClose={() => setModal(false)} >
                <form>

                    <span className="text-sm">
                        Are you sure you want to delete this Permission?
                    </span>
                    <div>
                        <div className="gap-2 flex justify-between items-center bg-muted/30">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={deleting}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={() => deletePermission()}
                                disabled={deleting}
                                loading={deleting}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>

                </form>
            </Modal>
        </>
    )
}

export default DeletePermission