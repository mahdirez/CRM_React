import { useMemo } from 'react'
import {
    apiGetCustomersList,
    normalizeSerajUser,
    type SerajUsersResponse,
} from '@/services/CustomersService'
import useSWR from 'swr'
import { useCustomerListStore } from '../store/customerListStore'
import type { Customer, Filter } from '../types'
import type { TableQueries } from '@/@types/common'

const compareStrings = (a: string, b: string, desc: boolean) =>
    desc ? b.localeCompare(a) : a.localeCompare(b)

const compareNumbers = (a: number, b: number, desc: boolean) =>
    desc ? b - a : a - b

const filterByQuery = (list: Customer[], query?: string) => {
    if (!query) {
        return list
    }
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
        return list
    }
    return list.filter((customer) => {
        return (
            customer.name.toLowerCase().includes(normalizedQuery) ||
            customer.email.toLowerCase().includes(normalizedQuery) ||
            customer.personalInfo.location
                .toLowerCase()
                .includes(normalizedQuery) ||
            customer.role.toLowerCase().includes(normalizedQuery)
        )
    })
}

const filterByPurchasedProduct = (list: Customer[], filter: Filter) => {
    if (!filter.purchasedProducts) {
        return list
    }
    const normalizedFilter = filter.purchasedProducts.toLowerCase()
    return list.filter((customer) =>
        customer.role.toLowerCase().includes(normalizedFilter),
    )
}

const sortCustomers = (
    list: Customer[],
    key?: string,
    order?: string,
): Customer[] => {
    if (!key || !order) {
        return list
    }

    const isDesc = order === 'desc'
    const sorted = [...list]

    switch (key) {
        case 'totalSpending':
            sorted.sort((a, b) =>
                compareNumbers(a.totalSpending, b.totalSpending, isDesc),
            )
            break
        case 'personalInfo.location':
            sorted.sort((a, b) =>
                compareStrings(
                    a.personalInfo.location,
                    b.personalInfo.location,
                    isDesc,
                ),
            )
            break
        case 'name':
            sorted.sort((a, b) => compareStrings(a.name, b.name, isDesc))
            break
        case 'email':
            sorted.sort((a, b) => compareStrings(a.email, b.email, isDesc))
            break
        case 'status':
            sorted.sort((a, b) => compareStrings(a.status, b.status, isDesc))
            break
        default:
            break
    }

    return sorted
}

const paginateCustomers = (
    list: Customer[],
    pageIndex: number,
    pageSize: number,
) => {
    if (!pageSize) {
        return list
    }
    const start = (Math.max(pageIndex, 1) - 1) * pageSize
    return list.slice(start, start + pageSize)
}

export default function useCustomerList() {
    const {
        tableData,
        filterData,
        setTableData,
        selectedCustomer,
        setSelectedCustomer,
        setSelectAllCustomer,
        setFilterData,
    } = useCustomerListStore((state) => state)

    type CustomerListRequestParams = TableQueries & Filter

    const { data, error, isLoading, mutate } = useSWR<SerajUsersResponse>(
        ['/api/customers', { ...tableData, ...filterData }],
        ([, params]) =>
            apiGetCustomersList<SerajUsersResponse, CustomerListRequestParams>(
                params as CustomerListRequestParams,
            ),
        {
            revalidateOnFocus: false,
        },
    )

    const { customerList, customerListTotal } = useMemo(() => {
        const users = Array.isArray(data?.data) ? data?.data : []
        const normalized = (users ?? []).map((user) => normalizeSerajUser(user))
        const filteredByProduct = filterByPurchasedProduct(normalized, filterData)
        const searchQuery =
            typeof tableData.query === 'string' ? tableData.query : ''
        const filteredBySearch = filterByQuery(filteredByProduct, searchQuery)
        const sortKey =
            typeof tableData.sort?.key === 'string'
                ? tableData.sort?.key
                : undefined
        const sortOrder =
            typeof tableData.sort?.order === 'string'
                ? tableData.sort?.order
                : undefined
        const sorted = sortCustomers(
            filteredBySearch,
            sortKey,
            sortOrder,
        )

        const total = sorted.length
        const pageSize = Number(tableData.pageSize) || total || 1
        const pageIndex = Number(tableData.pageIndex) || 1
        const paginated = paginateCustomers(sorted, pageIndex, pageSize)

        return {
            customerList: paginated,
            customerListTotal: total,
        }
    }, [
        data,
        filterData,
        tableData.pageIndex,
        tableData.pageSize,
        tableData.query,
        tableData.sort?.key,
        tableData.sort?.order,
    ])

    return {
        customerList,
        customerListTotal,
        error,
        isLoading,
        tableData,
        filterData,
        mutate,
        setTableData,
        selectedCustomer,
        setSelectedCustomer,
        setSelectAllCustomer,
        setFilterData,
    }
}
