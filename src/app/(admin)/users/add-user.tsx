import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { BaseServiceInstance } from '@/services/base.service'
import { AuthServiceInstance } from '@/services/auth.service'
import { iRole, iUser, UserSchema } from '@/types/auth.types'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import Alert from '@/components/ui/alert/Alert'
import Input from '@/components/form/input/InputField'
import Select from '@/components/form/Select'
import { RoleServiceInstance } from '@/services/role.service'
import { Button } from '@/components/ui/button/Button'

const AddUser = ({ onAction }: { onAction?: () => void }) => {
    const [UserForm, setUserForm] = useState<iUser>({ name: '', email: '', password: '', roleId: '', restaurantId: '' })
    const [roles, setRoles] = useState<iRole[]>([])
    const [modal, setModal] = useState<boolean>(false)
    const [savingUser, setSavingUser] = useState<boolean>(false)
    const [loadingRoles, setLoadingRoles] = useState<boolean>(true)
    const [showAlert, setShowAlert] = useState<boolean>(false)
    const [errors, setErrors] = useState<Partial<Record<keyof iUser, any>>>()
    const baseServ = BaseServiceInstance()
    const authServ = AuthServiceInstance()
    const roleServ = RoleServiceInstance()

    const fetchRoles = async () => {
        try {
            const res = await roleServ.getRoles();
            if (res?.success) {
                setRoles(res?.data || []);
            }
            else {
                toast.error(res?.message || 'Failed to fetch roles')
            }
        } catch (error) {
            console.error("Failed to fetch roles", error);
        } finally {
            setLoadingRoles(false);
        }
    };

    async function saveUser(e: any) {
        e.preventDefault()
        setSavingUser(true)
        const validation = baseServ.zodValidate(UserSchema, UserForm)
        if (!validation.success) {
            setShowAlert(true)
            setErrors(validation.data)
            setSavingUser(false)
            return
        }
        try {
            setSavingUser(true)

            const res = await authServ.addUser(UserForm)
            if (res.success) {
                toast.success('User added successfully!')
                onAction?.()
                clearState()
            }
            else {
                toast.error(res?.message || 'Failed to add user')
            }
        }
        catch (err) {
            toast.error('Failed to add user')
        }
        finally {
            setSavingUser(false)
        }
    }

    function clearState() {
        setErrors({})
        setShowAlert(false)
        setUserForm({ name: '', email: '', password: '', roleId: '', restaurantId: '' })
        setSavingUser(false)
        setModal(false)
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    return (
        <>
            <Button variant={'ghost'} size={'icon'} onClick={() => setModal(true)}>
                <Plus /> Add User
            </Button>
            <Modal isOpen={modal} onClose={() => setModal(false)} >
                <form onSubmit={saveUser}>
                    {
                        showAlert &&
                        <Alert variant='error' title='Validation Error' message={JSON.stringify(errors!)} />
                    }

                    <div className='grid grid-cols-1 my-2 gap-4'>

                        <Input required name='fullName' value={UserForm.name} onChange={(e) => setUserForm({ ...UserForm, [e.target.name]: e.target.value })} placeholder='Enter full name' label='Full Name' disabled={savingUser} />

                        <Input required name='email' value={UserForm.email} onChange={(e) => setUserForm({ ...UserForm, [e.target.name]: e.target.value })} placeholder='Enter email address' label='Email' type='email' disabled={savingUser} />

                        <Input required name='password' value={UserForm.password} onChange={(e) => setUserForm({ ...UserForm, [e.target.name]: e.target.value })} placeholder='Enter password' label='Password' type='password' disabled={savingUser} />

                        <Select
                            disabled={loadingRoles || savingUser}
                            defaultValue={UserForm.roleId}
                            options={
                                roles.map((role) => ({
                                    label: role.name,
                                    value: role.id!
                                }))
                            }
                            placeholder="Select role"
                            required
                            onChange={(v) => setUserForm({ ...UserForm, roleId: v })}
                        />

                    </div>
                    <div>
                        <div className="gap-2 flex justify-between items-center bg-muted/30">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={savingUser}
                                onClick={() => clearState()}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={savingUser}
                                loading={savingUser}
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

export default AddUser