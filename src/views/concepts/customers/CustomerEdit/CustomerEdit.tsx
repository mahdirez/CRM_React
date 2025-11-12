import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    apiGetCustomer,
    apiUpdateCustomer,
    normalizeSerajUser,
    type SerajUsersResponse,
    type SerajUser,
    type UpdateCustomerPayload,
} from '@/services/CustomersService'
import CustomerForm from '../CustomerForm'
import type { Customer } from '../CustomerList/types'
import NoUserFound from '@/assets/svg/NoUserFound'
import { TbTrash, TbArrowNarrowLeft } from 'react-icons/tb'
import { useParams, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import type { CustomerFormSchema } from '../CustomerForm'
import sleep from '@/utils/sleep'

const CustomerEdit = () => {
    const { id } = useParams()

    const navigate = useNavigate()

    const { data, isLoading } = useSWR<SerajUsersResponse>(
        [`/api/customers${id}`, { id: id as string }],
        ([, params]) =>
            apiGetCustomer<SerajUsersResponse, { id: string }>(
                params as { id: string },
            ),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        },
    )

    const customerData: Customer | undefined = (() => {
        const payload = data?.data
        if (!payload) {
            return undefined
        }
        if (Array.isArray(payload)) {
            const found = payload.find(
                (item) => item.id.toString() === (id as string),
            )
            return found ? normalizeSerajUser(found) : undefined
        }
        return normalizeSerajUser(payload as SerajUser)
    })()

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [isSubmiting, setIsSubmiting] = useState(false)

    const handleFormSubmit = async (values: CustomerFormSchema) => {
        if (!customerData) {
            return
        }

        const payload: UpdateCustomerPayload = {
            first_name: values.firstName,
            last_name: values.lastName,
            national_id: values.nationalId,
            phone: values.phone,
            email: values.email,
            type: values.type,
            gender: values.gender,
            status: values.status,
        }

        if (values.password) {
            payload.password = values.password
        }

        try {
            setIsSubmiting(true)
            await apiUpdateCustomer(customerData.id, payload)
            toast.push(
                <Notification type="success">تغییرات ذخیره شد!</Notification>,
                {
                    placement: 'top-center',
                },
            )
            navigate('/concepts/customers/customer-list')
        } catch (error) {
            toast.push(
                <Notification type="danger" title="خطا در ذخیره تغییرات">
                    لطفاً دوباره تلاش کنید.
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
        } finally {
            setIsSubmiting(false)
        }
    }

    const getDefaultValues = (): CustomerFormSchema | undefined => {
        if (!customerData) {
            return undefined
        }

        const {
            firstName,
            lastName,
            email,
            personalInfo,
            nationalId,
            userType,
            gender,
            status,
        } = customerData

        const normalizedGender = (gender || personalInfo.country || 'male')
            .toLowerCase()
            .replace(' ', '')
        const normalizedStatus = status || 'active'

        return {
            firstName,
            lastName,
            email,
            nationalId: nationalId ?? '',
            phone: personalInfo.phoneNumber,
            password: '',
            type: userType || customerData.role || 'user',
            gender: normalizedGender,
            status: normalizedStatus,
        }
    }

    const handleConfirmDelete = () => {
        setDeleteConfirmationOpen(true)
        toast.push(
            <Notification type="success">مشتری حذف شد!</Notification>,
            { placement: 'top-center' },
        )
        navigate('/concepts/customers/customer-list')
    }

    const handleDelete = () => {
        setDeleteConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDeleteConfirmationOpen(false)
    }

    const handleBack = () => {
        history.back()
    }

    return (
        <>
            {!isLoading && !customerData && (
                <div className="h-full flex flex-col items-center justify-center">
                    <NoUserFound height={280} width={280} />
                    <h3 className="mt-8">کاربری پیدا نشد!</h3>
                </div>
            )}
            {!isLoading && customerData && (
                <>
                    <CustomerForm
                        defaultValues={getDefaultValues()}
                        newCustomer={false}
                        onFormSubmit={handleFormSubmit}
                    >
                        <Container>
                            <div className="flex items-center justify-between px-8">
                                <Button
                                    className="ltr:mr-3 rtl:ml-3"
                                    type="button"
                                    variant="plain"
                                    icon={<TbArrowNarrowLeft />}
                                    onClick={handleBack}
                                >
                                    برگشت
                                </Button>
                                <div className="flex items-center">
                                    <Button
                                        className="ltr:mr-3 rtl:ml-3"
                                        type="button"
                                        customColorClass={() =>
                                            'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                        }
                                        icon={<TbTrash />}
                                        onClick={handleDelete}
                                    >
                                        حذف کنید
                                    </Button>
                                    <Button
                                        variant="solid"
                                        type="submit"
                                        loading={isSubmiting}
                                    >
                                        ذخیره کنید
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </CustomerForm>
                    <ConfirmDialog
                        isOpen={deleteConfirmationOpen}
                        type="danger"
                        title="مشتریان را حذف کنید"
                        onClose={handleCancel}
                        onRequestClose={handleCancel}
                        onCancel={handleCancel}
                        onConfirm={handleConfirmDelete}
                    >
                        <p>
                            آیا مطمئنید که می خواهید این مشتری را حذف کنید؟ این
                            عمل را نمی توان واگرد کرد.{' '}
                        </p>
                    </ConfirmDialog>
                </>
            )}
        </>
    )
}

export default CustomerEdit
