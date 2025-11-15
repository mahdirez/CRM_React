import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import useProductList from '../hooks/useProductList'
import { Link, useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil, TbTrash } from 'react-icons/tb'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { apiDeleteProduct } from '@/services/ProductService'
import {
    apiGetCustomersList,
    normalizeSerajUser,
    type SerajUsersResponse,
} from '@/services/CustomersService'
import useSWR from 'swr'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Product } from '../types'
import type { TableQueries } from '@/@types/common'

const statusColor: Record<string, string> = {
    فعال: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    'مسدود شده':
        'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    inactive: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

const NameColumn = ({ row }: { row: Product }) => {
    return (
        <div className="flex items-center">
            <Avatar size={40} shape="circle" src={row.img} />
            <Link
                className={`hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100`}
                to={`/concepts/products/product-edit/${row.id}`}
            >
                {row.name}
            </Link>
        </div>
    )
}

const ActionColumn = ({
    onEdit,
    onDelete,
}: {
    onEdit: () => void
    onDelete: () => void
}) => {
    return (
        <div className="flex items-center gap-3">
            <Tooltip title="ویرایش کنید">
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onEdit}
                >
                    <TbPencil />
                </div>
            </Tooltip>
            <Tooltip title="حذف کنید">
                <div
                    className="text-xl cursor-pointer select-none font-semibold text-error"
                    role="button"
                    onClick={onDelete}
                >
                    <TbTrash />
                </div>
            </Tooltip>
        </div>
    )
}

const ProductListTable = () => {
    const navigate = useNavigate()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<Product | null>(
        null,
    )
    const [isDeleting, setIsDeleting] = useState(false)

    const handleEdit = (product: Product) => {
        navigate(`/concepts/products/product-edit/${product.id}`)
    }

    const handleAskDelete = (product: Product) => {
        setProductToDelete(product)
        setDeleteDialogOpen(true)
    }

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false)
        setProductToDelete(null)
    }

    const handleConfirmDelete = async () => {
        if (!productToDelete) {
            return
        }

        try {
            setIsDeleting(true)
            await apiDeleteProduct(productToDelete.id)
            toast.push(
                <Notification type="success">
                    محصول با موفقیت حذف شد.
                </Notification>,
                { placement: 'top-center' },
            )
            await mutate()
        } catch (error) {
            toast.push(
                <Notification type="danger" title="حذف محصول با خطا مواجه شد">
                    لطفاً دوباره تلاش کنید.
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsDeleting(false)
            handleCancelDelete()
        }
    }

    const {
        productList,
        productListTotal,
        tableData,
        isLoading,
        setTableData,
        setSelectAllProduct,
        setSelectedProduct,
        selectedProduct,
        mutate,
    } = useProductList()

    const { data: customersData } = useSWR<SerajUsersResponse>(
        ['/api/customers-for-products'],
        () => apiGetCustomersList<SerajUsersResponse, Record<string, unknown>>({}),
        {
            revalidateOnFocus: false,
        },
    )

    const customerNameMap = useMemo(() => {
        const map = new Map<number, string>()
        if (customersData?.data) {
            const users = Array.isArray(customersData.data)
                ? customersData.data
                : [customersData.data]
            users.forEach((user) => {
                const customer = normalizeSerajUser(user)
                map.set(parseInt(customer.id), customer.name)
            })
        }
        return map
    }, [customersData])

    const columns: ColumnDef<Product>[] = useMemo(
        () => [
            {
                header: 'نام',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return <NameColumn row={row} />
                },
            },
            {
                header: 'Parent',
                accessorKey: 'userId',
                cell: (props) => {
                    const row = props.row.original
                    const parentName =
                        row.userId && customerNameMap.has(row.userId)
                            ? customerNameMap.get(row.userId)
                            : '-'
                    return <span>{parentName}</span>
                },
            },
            {
                header: 'کد ملی',
                accessorKey: 'personalInfo.location',
            },
            {
                header: 'وضعیت',
                accessorKey: 'status',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            <Tag className={statusColor[row.status] ?? ''}>
                                <span className="capitalize">{row.status}</span>
                            </Tag>
                        </div>
                    )
                },
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() => handleEdit(props.row.original)}
                        onDelete={() => handleAskDelete(props.row.original)}
                    />
                ),
            },
        ],
        [customerNameMap],
    )

    const handleSetTableData = (data: TableQueries) => {
        setTableData(data)
        if (selectedProduct.length > 0) {
            setSelectAllProduct([])
        }
    }

    const handlePaginationChange = (page: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageIndex = page
        handleSetTableData(newTableData)
    }

    const handleSelectChange = (value: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageSize = Number(value)
        newTableData.pageIndex = 1
        handleSetTableData(newTableData)
    }

    const handleSort = (sort: OnSortParam) => {
        const newTableData = cloneDeep(tableData)
        newTableData.sort = sort
        handleSetTableData(newTableData)
    }

    const handleRowSelect = (checked: boolean, row: Product) => {
        setSelectedProduct(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<Product>[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllProduct(originalRows)
        } else {
            setSelectAllProduct([])
        }
    }

    return (
        <>
            <DataTable
                selectable
                columns={columns}
                data={productList}
                noData={!isLoading && productList.length === 0}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isLoading}
                pagingData={{
                    total: productListTotal,
                    pageIndex: tableData.pageIndex as number,
                    pageSize: tableData.pageSize as number,
                }}
                checkboxChecked={(row) =>
                    selectedProduct.some((selected) => selected.id === row.id)
                }
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                type="danger"
                title="حذف محصول"
                onClose={handleCancelDelete}
                onRequestClose={handleCancelDelete}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                confirmButtonProps={{
                    loading: isDeleting,
                    disabled: isDeleting,
                }}
                cancelButtonProps={{
                    disabled: isDeleting,
                }}
            >
                <p>
                    آیا از حذف محصول{' '}
                    <span className="font-semibold">
                        {productToDelete?.name ?? ''}
                    </span>{' '}
                    مطمئن هستید؟
                </p>
            </ConfirmDialog>
        </>
    )
}


export default ProductListTable
