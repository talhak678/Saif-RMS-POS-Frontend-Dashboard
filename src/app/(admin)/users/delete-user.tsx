import React, { useState } from 'react'
import { Plus, Trash } from 'lucide-react'
import { AuthServiceInstance } from '@/services/auth.service'
import { iRole, iUser, UserSchema } from '@/types/auth.types'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button/Button'

const DeleteUser = ({ onAction, user }: { onAction?: () => void, user: iUser }) => {
    const [modal, setModal] = useState<boolean>(false)
    const [deleting, setDeleting] = useState<boolean>(false)
    const authServ = AuthServiceInstance()

    async function deleteUser() {
        setDeleting(true)
        try {
            const res = await authServ.deleteUser(user?.id!)
            if (res.success) {
                toast.success('User deleted successfully!')
                onAction?.()
                setModal(false)
            }
            else {
                toast.error(res?.message || 'Failed to delete user')
            }
        }
        catch (err) {
            toast.error('Failed to delete user')
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
                        Are you sure you want to delete this user?
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
                                onClick={() => deleteUser()}
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

export default DeleteUser