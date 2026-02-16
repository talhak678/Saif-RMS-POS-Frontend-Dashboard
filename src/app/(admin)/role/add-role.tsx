import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { iPermission, iRole } from '@/types/auth.types'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import Input from '@/components/form/input/InputField'
import { RoleServiceInstance } from '@/services/role.service'
import { Button } from '@/components/ui/button/Button'
import Loader from '@/components/ui/spinner'
import Checkbox from '@/components/form/input/Checkbox'

const AddRole = ({ onAction }: { onAction?: () => void }) => {
    const [RoleForm, setRoleForm] = useState<iRole>({ name: '', permissions: [] })
    const [permissions, setPermissions] = useState<iPermission[]>([])
    const [permLoading, setPermLoading] = useState<boolean>(true)
    const [modal, setModal] = useState<boolean>(false)
    const [savingRole, setSavingRole] = useState<boolean>(false)
    const permServ = RoleServiceInstance()

    const fetchPermissions = async () => {
        try {
            const res = await permServ.getPermissions();
            if (res?.success) {
                setPermissions(res?.data || []);
            }
            else {
                toast.error(res?.message || 'Failed to fetch permissions')
            }
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        } finally {
            setPermLoading(false);
        }
    };

    async function saveRole(e: any) {
        e.preventDefault()
        setSavingRole(true)
        try {
            const res = await permServ.addRole(RoleForm)
            if (res.success) {
                toast.success('Role added successfully!')
                onAction?.()
                clearState()
            }
            else {
                toast.error(res?.message || 'Failed to add Role')
            }
        }
        catch (err) {
            toast.error('Failed to add Role')
        }
        finally {
            setSavingRole(false)
        }
    }

    function clearState() {
        setRoleForm({ name: '', permissions: [] })
        setSavingRole(false)
        setModal(false)
    }

    const handlePermissionChange = (perm: iPermission) => {
        setRoleForm((prev) => {
            const exists = prev.permissions.some((p) => p.id === perm.id)

            if (exists) {
                // Remove permission
                return {
                    ...prev,
                    permissions: prev.permissions.filter((p) => p.id !== perm.id)
                }
            } else {
                // Add permission
                return {
                    ...prev,
                    permissions: [...prev.permissions, perm]
                }
            }
        })
    }

    useEffect(() => {
        if (modal) {
            fetchPermissions()
        }
    }, [modal])

    return (
        <>
            <Button variant={'ghost'} size={'icon'} onClick={() => setModal(true)}>
                <Plus /> Add Role
            </Button>
            <Modal isOpen={modal} onClose={() => setModal(false)} >
                <form onSubmit={saveRole}>
                    <div className='my-2'>

                        <Input required name='name' value={RoleForm.name} onChange={(e) => setRoleForm({ ...RoleForm, [e.target.name]: e.target.value })} placeholder='Enter name' label='Name' disabled={savingRole} />

                        <div className="mt-2">
                            {
                                permLoading ?
                                    <div className='flex items-center justify-center h-40 gap-4'>
                                        <Loader /> loading permissions...
                                    </div>
                                    :
                                    permissions.length <= 0
                                        ?
                                        <div className='flex text-muted items-center justify-center h-40 gap-4'>
                                            No permission found
                                        </div>
                                        :
                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                            {permissions.map((perm) => (
                                                <Checkbox
                                                    key={perm.id}
                                                    label={perm.action}
                                                    checked={RoleForm.permissions.some((p) => p.id === perm.id)}
                                                    onChange={() => handlePermissionChange(perm)}
                                                />
                                            ))}
                                        </div>

                            }
                        </div>

                    </div>
                    <div>
                        <div className="gap-2 flex justify-between items-center bg-muted/30">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={savingRole}
                                onClick={() => clearState()}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={savingRole}
                                loading={savingRole}
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

export default AddRole