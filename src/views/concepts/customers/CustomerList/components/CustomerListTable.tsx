import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useCustomerList from '../hooks/useCustomerList'
import { Link, useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil, TbEye, TbTrash } from 'react-icons/tb'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { apiDeleteCustomer } from '@/services/CustomersService'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Customer } from '../types'
import type { TableQueries } from '@/@types/common'

const statusColor: Record<string, string> = {
    فعال: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    'مسدود شده':
        'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    inactive: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

const NameColumn = ({ row }: { row: Customer }) => {
    return (
        <div className="flex items-center">
            <Avatar size={40} shape="circle" src={row.img} />
            <Link
                className={`hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100`}
                to={`/concepts/customers/customer-details/${row.id}`}
            >
                {row.name}
            </Link>
        </div>
    )
}

const ActionColumn = ({
    onEdit,
    onViewDetail,
    onDelete,
}: {
    onEdit: () => void
    onViewDetail: () => void
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
            <Tooltip title="مشاهده کنید">
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onViewDetail}
                >
                    <TbEye />
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

const CustomerListTable = () => {
    const navigate = useNavigate()

    const {
        customerList,
        customerListTotal,
        tableData,
        isLoading,
        setTableData,
        setSelectAllCustomer,
        setSelectedCustomer,
        selectedCustomer,
        mutate,
    } = useCustomerList()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
        null,
    )
    const [isDeleting, setIsDeleting] = useState(false)

    const handleEdit = (customer: Customer) => {
        navigate(`/concepts/customers/customer-edit/${customer.id}`)
    }

    const handleViewDetails = (customer: Customer) => {
        navigate(`/concepts/customers/customer-details/${customer.id}`)
    }

    const handleAskDelete = (customer: Customer) => {
        setCustomerToDelete(customer)
        setDeleteDialogOpen(true)
    }

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false)
        setCustomerToDelete(null)
    }

    const handleConfirmDelete = async () => {
        if (!customerToDelete) {
            return
        }

        try {
            setIsDeleting(true)
            await apiDeleteCustomer(customerToDelete.id)
            toast.push(
                <Notification type="success">
                    کاربر با موفقیت حذف شد.
                </Notification>,
                { placement: 'top-center' },
            )
            await mutate()
        } catch (error) {
            toast.push(
                <Notification type="danger" title="حذف کاربر با خطا مواجه شد">
                    لطفاً دوباره تلاش کنید.
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsDeleting(false)
            handleCancelDelete()
        }
    }

    const columns: ColumnDef<Customer>[] = useMemo(
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
                header: 'ایمیل',
                accessorKey: 'email',
            },
            {
                header: 'شماره موبایل',
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
                        onViewDetail={() =>
                            handleViewDetails(props.row.original)
                        }
                        onDelete={() => handleAskDelete(props.row.original)}
                    />
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    const handleSetTableData = (data: TableQueries) => {
        setTableData(data)
        if (selectedCustomer.length > 0) {
            setSelectAllCustomer([])
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

    const handleRowSelect = (checked: boolean, row: Customer) => {
        setSelectedCustomer(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<Customer>[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllCustomer(originalRows)
        } else {
            setSelectAllCustomer([])
        }
    }

    return (
        <>
            <DataTable
                selectable
                columns={columns}
                data={customerList}
                noData={!isLoading && customerList.length === 0}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isLoading}
                pagingData={{
                    total: customerListTotal,
                    pageIndex: tableData.pageIndex as number,
                    pageSize: tableData.pageSize as number,
                }}
                checkboxChecked={(row) =>
                    selectedCustomer.some((selected) => selected.id === row.id)
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
                title="حذف کاربر"
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
                    آیا از حذف کاربر{' '}
                    <span className="font-semibold">
                        {customerToDelete?.name ?? ''}
                    </span>{' '}
                    مطمئن هستید؟
                </p>
            </ConfirmDialog>
        </>
    )
}

export default CustomerListTable
