import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { iPermission } from '@/types/auth.types'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import Input from '@/components/form/input/InputField'
import { RoleServiceInstance } from '@/services/role.service'
import { Button } from '@/components/ui/button/Button'

const AddPermission = ({ onAction }: { onAction?: () => void }) => {
    const [PermissionForm, setPermissionForm] = useState<iPermission>({ action: '' })
    const [modal, setModal] = useState<boolean>(false)
    const [savingPermission, setSavingPermission] = useState<boolean>(false)
    const permServ = RoleServiceInstance()

    async function savePermission(e: any) {
        e.preventDefault()
        setSavingPermission(true)
        try {
            const res = await permServ.addPermission(PermissionForm)
            if (res.success) {
                toast.success('Permission added successfully!')
                onAction?.()
                clearState()
            }
            else {
                toast.error(res?.message || 'Failed to add Permission')
            }
        }
        catch (err) {
            toast.error('Failed to add Permission')
        }
        finally {
            setSavingPermission(false)
        }
    }

    function clearState() {
        setPermissionForm({ action: '' })
        setSavingPermission(false)
        setModal(false)
    }

    return (
        <>
            <Button variant={'ghost'} size={'icon'} onClick={() => setModal(true)}>
                <Plus /> Add Permission
            </Button>
            <Modal isOpen={modal} onClose={() => setModal(false)} >
                <form onSubmit={savePermission}>
                    <div className='my-2'>

                        <Input required name='action' value={PermissionForm.action} onChange={(e) => setPermissionForm({ ...PermissionForm, [e.target.name]: e.target.value })} placeholder='Enter action' label='Action' disabled={savingPermission} />

                    </div>
                    <div>
                        <div className="gap-2 flex justify-between items-center bg-muted/30">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={savingPermission}
                                onClick={() => clearState()}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={savingPermission}
                                loading={savingPermission}
                            >
                                Create
                            </Button>
                        </div>
                    </div>

                </form>
            </Modal>
        </>
    )
}

export default AddPermission