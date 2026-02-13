import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { BaseServiceInstance } from '@/services/base.service'
import { AuthServiceInstance } from '@/services/auth.service'
import { iUser, UserSchema } from '@/types/auth.types'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import Button from '@/components/ui/button/Button'
import Alert from '@/components/ui/alert/Alert'
import Input from '@/components/form/input/InputField'
import Select from '@/components/form/Select'

const AddUser = ({ onAction }: { onAction?: () => void }) => {
    const [UserForm, setUserForm] = useState<iUser>({ name: '', email: '', password: '', roleId: '', restaurantId: '' })
    const [modal, setModal] = useState<boolean>(false)
    const [savingUser, setSavingUser] = useState<boolean>(false)
    const [showAlert, setShowAlert] = useState<boolean>(false)
    const [errors, setErrors] = useState<Partial<Record<keyof iUser, any>>>()
    const baseServ = BaseServiceInstance()
    const authServ = AuthServiceInstance()

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
    }

    return (
        <>
            <Button>
                <Plus /> Add User
            </Button>
            <Modal isOpen={modal} onClose={() => setModal(false)} >
                <form onSubmit={saveUser}>
                    {
                        showAlert &&
                        <Alert variant='error' title='Validation Error' message={errors!} />
                    }

                    <div className='grid grid-cols-1 my-2 gap-4'>

                        <Input required name='fullName' value={UserForm.name} onChange={(e) => setUserForm({ ...UserForm, [e.target.name]: e.target.value })} placeholder='Enter full name' label='Full Name' disabled={savingUser} />

                        <Input required name='email' value={UserForm.email} onChange={(e) => setUserForm({ ...UserForm, [e.target.name]: e.target.value })} placeholder='Enter email address' label='Email' type='email' disabled={savingUser} />

                        <Input required name='password' value={UserForm.password} onChange={(e) => setUserForm({ ...UserForm, [e.target.name]: e.target.value })} placeholder='Enter password' label='Password' type='password' disabled={savingUser} />

                        <Select
                            disabled
                            defaultValue={UserForm.roleId}
                            options={ }
                            placeholder="Select Status"
                            required
                            onChange={(v) => handleInput({ target: { name: "status", value: Number(v) } })}
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
                                {usersIndex.userToEdit ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>

                </form>
            </Modal>
        </>
    )
}

export default AddUser