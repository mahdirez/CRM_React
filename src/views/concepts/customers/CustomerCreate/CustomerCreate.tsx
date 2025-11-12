import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import CustomerForm from '../CustomerForm'
import { TbTrash } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import {
    apiCreateCustomer,
    type CreateCustomerPayload,
} from '@/services/CustomersService'
import type { CustomerFormSchema } from '../CustomerForm'

const CustomerCreate = () => {
    const navigate = useNavigate()
    const [discardConfirmationOpen, setDiscardConfirmationOpen] =
        useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFormSubmit = async (values: CustomerFormSchema) => {
        const payload: CreateCustomerPayload = {
            first_name: values.firstName,
            last_name: values.lastName,
            national_id: values.nationalId,
            phone: values.phone,
            email: values.email,
            password: values.password ?? '',
            type: values.type,
            gender: values.gender,
            status: values.status,
        }

        try {
            setIsSubmitting(true)
            await apiCreateCustomer(payload)
            toast.push(
                <Notification type="success">
                    کاربر با موفقیت ایجاد شد!
                </Notification>,
                { placement: 'top-center' },
            )
            navigate('/concepts/customers/customer-list')
        } catch (error) {
            toast.push(
                <Notification type="danger" title="ایجاد کاربر ناموفق بود">
                    لطفاً مجدداً تلاش کنید.
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirmDiscard = () => {
        setDiscardConfirmationOpen(true)
        toast.push(
            <Notification type="success">تغییرات کنار گذاشته شد!</Notification>,
            { placement: 'top-center' },
        )
        navigate('/concepts/customers/customer-list')
    }

    const handleDiscard = () => {
        setDiscardConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDiscardConfirmationOpen(false)
    }

    return (
        <>
            <CustomerForm
                newCustomer
                defaultValues={{
                    firstName: '',
                    lastName: '',
                    nationalId: '',
                    phone: '',
                    email: '',
                    password: '',
                    type: 'user',
                    gender: 'male',
                    status: 'active',
                }}
                onFormSubmit={handleFormSubmit}
            >
                <Container>
                    <div className="flex items-center justify-between px-8">
                        <span />
                        <div className="flex items-center">
                            <Button
                                className="ltr:mr-3 rtl:ml-3"
                                type="button"
                                customColorClass={() =>
                                    'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                }
                                icon={<TbTrash />}
                                onClick={handleDiscard}
                                disabled={isSubmitting}
                            >
                                لغو
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                loading={isSubmitting}
                            >
                                ایجاد کنید
                            </Button>
                        </div>
                    </div>
                </Container>
            </CustomerForm>
            <ConfirmDialog
                isOpen={discardConfirmationOpen}
                type="danger"
                title="تغییرات را کنار بگذارید"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDiscard}
            >
                <p>آیا مطمئنید که می‌خواهید این تغییرات را کنار بگذارید؟</p>
            </ConfirmDialog>
        </>
    )
}

export default CustomerCreate
