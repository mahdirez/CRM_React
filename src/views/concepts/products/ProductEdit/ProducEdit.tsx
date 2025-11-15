import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ProductForm from '../ProductForm'
import NoProductFound from '@/assets/svg/NoProductFound'
import {
    apiGetProduct,
    apiUpdateProduct,
    apiDeleteProduct,
    normalizeSerajStudent,
    type SerajStudentsResponse,
    type SerajStudent,
    type UpdateProductPayload,
} from '@/services/ProductService'
import { TbTrash, TbArrowNarrowLeft } from 'react-icons/tb'
import { useParams, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import type { Product, ProductFormSchema } from '../ProductForm/types'
import type { Product as ProductListType } from '../ProductList/types'

const ProducEdit = () => {
    const { id } = useParams()

    const navigate = useNavigate()

    const { data, isLoading } = useSWR<SerajStudentsResponse>(
        [`/api/products/${id}`, { id: id as string }],
        ([, params]) =>
            apiGetProduct<SerajStudentsResponse, { id: string }>(
                params as { id: string },
            ),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        },
    )

    const productData: ProductListType | undefined = (() => {
        const payload = data?.data
        if (!payload) {
            return undefined
        }
        if (Array.isArray(payload)) {
            const found = payload.find(
                (item) => item.id.toString() === (id as string),
            )
            return found ? normalizeSerajStudent(found) : undefined
        }
        return normalizeSerajStudent(payload as SerajStudent)
    })()

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)

    const [isSubmitting, setIsSubmitting] = useState(false)

    const getDefaultValues = (): ProductFormSchema | undefined => {
        if (!productData) {
            return undefined
        }

        const { name, nationalId, role } = productData

        return {
            name,
            productCode: nationalId ?? '',
            description: '',
            taxRate: 0,
            price: '',
            bulkDiscountPrice: '',
            costPerItem: '',
            imgList: productData.img ? [{ id: '1', name: 'image', img: productData.img }] : [],
            category: role.replace('level_', '') || '',
            tags: [],
            brand: '',
        }
    }

    const handleFormSubmit = async (values: ProductFormSchema) => {
        if (!productData) {
            return
        }

        const originalValues = getDefaultValues()
        if (!originalValues) {
            return
        }

        // Map ProductFormSchema to UpdateProductPayload
        const nameParts = (values.name || '').trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        const payload: Partial<UpdateProductPayload> = {}

        if (values.name !== originalValues.name) {
            payload.first_name = firstName
            payload.last_name = lastName
        }
        if (values.productCode !== originalValues.productCode) {
            payload.national_id = values.productCode
        }
        if (values.category !== originalValues.category) {
            payload.level_id = parseInt(values.category) || 1
        }

        if (Object.keys(payload).length === 0) {
            toast.push(
                <Notification type="info">هیچ تغییری اعمال نشده است</Notification>,
                {
                    placement: 'top-center',
                },
            )
            return
        }

        try {
            setIsSubmitting(true)
            await apiUpdateProduct(
                productData.id,
                payload as UpdateProductPayload,
            )
            toast.push(
                <Notification type="success">تغییرات ذخیره شد!</Notification>,
                {
                    placement: 'top-center',
                },
            )
            navigate('/concepts/products/product-list')
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
            setIsSubmitting(false)
        }
    }

    const handleDelete = () => {
        setDeleteConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDeleteConfirmationOpen(false)
    }

    const handleBack = () => {
        navigate('/concepts/products/product-list')
    }

    const handleConfirmDelete = async () => {
        if (!productData) {
            return
        }

        try {
            setIsSubmitting(true)
            await apiDeleteProduct(productData.id)
            toast.push(
                <Notification type="success">محصول حذف شد!</Notification>,
                { placement: 'top-center' },
            )
            navigate('/concepts/products/product-list')
        } catch (error) {
            toast.push(
                <Notification type="danger" title="خطا در حذف محصول">
                    لطفاً دوباره تلاش کنید.
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSubmitting(false)
            setDeleteConfirmationOpen(false)
        }
    }

    return (
        <>
            {!isLoading && !productData && (
                <div className="h-full flex flex-col items-center justify-center">
                    <NoProductFound height={280} width={280} />
                    <h3 className="mt-8">محصولی پیدا نشد!</h3>
                </div>
            )}
            {!isLoading && productData && (
                <>
                    <ProductForm
                        defaultValues={getDefaultValues()}
                        newProduct={false}
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
                                    بازگشت
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
                                        disabled={isSubmitting}
                                    >
                                        حذف
                                    </Button>
                                    <Button
                                        variant="solid"
                                        type="submit"
                                        loading={isSubmitting}
                                    >
                                        ذخیره
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </ProductForm>
                    <ConfirmDialog
                        isOpen={deleteConfirmationOpen}
                        type="danger"
                        title="حذف محصول"
                        onClose={handleCancel}
                        onRequestClose={handleCancel}
                        onCancel={handleCancel}
                        onConfirm={handleConfirmDelete}
                    >
                        <p>
                            آیا از حذف این محصول مطمئن هستید؟ این عمل قابل بازگشت نیست.
                        </p>
                    </ConfirmDialog>
                </>
            )}
        </>
    )
}

export default ProducEdit
