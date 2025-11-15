import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ProductForm from '../ProductForm'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbTrash } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import {
    apiCreateProduct,
    type CreateProductPayload,
} from '@/services/ProductService'
import type { ProductFormSchema } from '../ProductForm/types'

const ProductCreate = () => {
    const navigate = useNavigate()
    const [discardConfirmationOpen, setDiscardConfirmationOpen] =
        useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFormSubmit = async (values: ProductFormSchema) => {
        // Map ProductFormSchema to CreateProductPayload
        const nameParts = (values.name || '').trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        const payload: CreateProductPayload = {
            user_id: 1, // باید از یک منبع مناسب دریافت شود
            level_id: 1, // باید از یک منبع مناسب دریافت شود
            first_name: firstName,
            last_name: lastName,
            national_id: values.productCode || '',
            birth_date: null,
        }

        try {
            setIsSubmitting(true)
            await apiCreateProduct(payload)
            toast.push(
                <Notification type="success">
                    محصول با موفقیت ایجاد شد!
                </Notification>,
                { placement: 'top-center' },
            )
            navigate('/concepts/products/product-list')
        } catch (error) {
            toast.push(
                <Notification type="danger" title="ایجاد محصول ناموفق بود">
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
            <Notification type="success">محصول دور ریخته شد!</Notification>,
            { placement: 'top-center' },
        )
        navigate('/concepts/products/product-list')
    }

    const handleDiscard = () => {
        setDiscardConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDiscardConfirmationOpen(false)
    }

    return (
        <>
            <ProductForm
                newProduct
                defaultValues={{
                    name: '',
                    description: '',
                    productCode: '',
                    taxRate: 0,
                    price: '',
                    bulkDiscountPrice: '',
                    costPerItem: '',
                    imgList: [],
                    category: '',
                    tags: [],
                    brand: '',
                }}
                onFormSubmit={handleFormSubmit}
            >
                <Container>
                    <div className="flex items-center justify-between px-8">
                        <span></span>
                        <div className="flex items-center">
                            <Button
                                className="ltr:mr-3 rtl:ml-3"
                                type="button"
                                customColorClass={() =>
                                    'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                }
                                icon={<TbTrash />}
                                onClick={handleDiscard}
                            >
                                دور انداختن
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
            </ProductForm>
            <ConfirmDialog
                isOpen={discardConfirmationOpen}
                type="danger"
                title="تغییرات را کنار بگذارید"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDiscard}
            >
                <p>
                آیا مطمئنید که می خواهید این را کنار بگذارید؟ این اقدام نمی تواند
                لغو شود.{' '}
                </p>
            </ConfirmDialog>
        </>
    )
}

export default ProductCreate
