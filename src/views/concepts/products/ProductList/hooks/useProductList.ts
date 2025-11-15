import { useMemo } from 'react'
import {
    apiGetProductsList,
    normalizeSerajStudent,
    type SerajStudentsResponse,
} from '@/services/ProductService'
import useSWR from 'swr'
import { useProductListStore } from '../store/productListStore'
import type { Product, Filter } from '../types'
import type { TableQueries } from '@/@types/common'

const compareStrings = (a: string, b: string, desc: boolean) =>
    desc ? b.localeCompare(a) : a.localeCompare(b)

const compareNumbers = (a: number, b: number, desc: boolean) =>
    desc ? b - a : a - b

const filterByQuery = (list: Product[], query?: string) => {
    if (!query) {
        return list
    }
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
        return list
    }
    return list.filter((product) => {
        return (
            product.name.toLowerCase().includes(normalizedQuery) ||
            product.email.toLowerCase().includes(normalizedQuery) ||
            (product.nationalId ?? '').toLowerCase().includes(normalizedQuery) ||
            product.personalInfo.location.toLowerCase().includes(normalizedQuery)
        )
    })
}

const filterByProductStatus = (list: Product[], filter: Filter) => {
    if (!filter.productStatus) {
        return list
    }
    const normalizedFilter = filter.productStatus.toLowerCase()
    if (normalizedFilter === 'all') {
        return list
    }
    return list.filter((product) => {
        if (normalizedFilter === 'active') {
            return product.status === 'active'
        }
        if (normalizedFilter === 'inactive') {
            return product.status === 'inactive'
        }
        return true
    })
}

const sortProducts = (
    list: Product[],
    key?: string,
    order?: string,
): Product[] => {
    if (!key || !order) {
        return list
    }

    const isDesc = order === 'desc'
    const sorted = [...list]

    switch (key) {
        case 'price':
            sorted.sort((a, b) =>
                compareNumbers(a.price, b.price, isDesc),
            )
            break
        case 'stock':
            sorted.sort((a, b) =>
                compareNumbers(a.stock, b.stock, isDesc),
            )
            break
        case 'name':
            sorted.sort((a, b) => compareStrings(a.name, b.name, isDesc))
            break
        case 'email':
            sorted.sort((a, b) => compareStrings(a.email, b.email, isDesc))
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
        default:
            break
    }

    return sorted
}

const paginateProducts = (
    list: Product[],
    pageIndex: number,
    pageSize: number,
) => {
    if (!pageSize) {
        return list
    }
    const start = (Math.max(pageIndex, 1) - 1) * pageSize
    return list.slice(start, start + pageSize)
}

export default function useProductList() {
    const {
        tableData,
        filterData,
        setTableData,
        selectedProduct,
        setSelectedProduct,
        setSelectAllProduct,
        setFilterData,
    } = useProductListStore((state) => state)

    type ProductListRequestParams = TableQueries & Filter

    const { data, error, isLoading, mutate } = useSWR<SerajStudentsResponse>(
        ['/api/products', { ...tableData, ...filterData }],
        ([, params]) =>
            apiGetProductsList<SerajStudentsResponse, ProductListRequestParams>(
                params as ProductListRequestParams,
            ),
        {
            revalidateOnFocus: false,
        },
    )

    const { productList, productListTotal } = useMemo(() => {
        const students = Array.isArray(data?.data) ? data?.data : []
        const normalized = (students ?? []).map((student) =>
            normalizeSerajStudent(student),
        )
        const filteredByStatus = filterByProductStatus(normalized, filterData)
        const searchQuery =
            typeof tableData.query === 'string' ? tableData.query : ''
        const filteredBySearch = filterByQuery(filteredByStatus, searchQuery)
        const sortKey =
            typeof tableData.sort?.key === 'string'
                ? tableData.sort?.key
                : undefined
        const sortOrder =
            typeof tableData.sort?.order === 'string'
                ? tableData.sort?.order
                : undefined
        const sorted = sortProducts(filteredBySearch, sortKey, sortOrder)

        const total = sorted.length
        const pageSize = Number(tableData.pageSize) || total || 1
        const pageIndex = Number(tableData.pageIndex) || 1
        const paginated = paginateProducts(sorted, pageIndex, pageSize)

        return {
            productList: paginated,
            productListTotal: total,
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
        productList,
        productListTotal,
        error,
        isLoading,
        tableData,
        filterData,
        mutate,
        setTableData,
        selectedProduct,
        setSelectedProduct,
        setSelectAllProduct,
        setFilterData,
    }
}
