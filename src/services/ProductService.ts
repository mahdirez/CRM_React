import ApiService from './ApiService'
import type { Product } from '@/views/concepts/products/ProductList/types'

export const SERAJ_STUDENTS_URL = 'http://portal.serajedu.ir/api/admin/students'

export type SerajStudent = {
    id: number
    user_id: number
    level_id: number
    first_name: string
    last_name: string
    national_id: string | null
    birth_date: string | null
    deleted_at: string | null
    created_at: string
    updated_at: string
}

export type SerajStudentsResponse = {
    status: boolean
    message: string
    data: SerajStudent[] | SerajStudent
}

export type CreateProductPayload = {
    user_id: number
    level_id: number
    first_name: string
    last_name: string
    national_id: string
    birth_date?: string | null
}

export type UpdateProductPayload = Partial<CreateProductPayload>

export async function apiGetProductsList<
    T = SerajStudentsResponse,
    U extends Record<string, unknown> = Record<string, unknown>,
>(_params: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: SERAJ_STUDENTS_URL,
        method: 'get',
    })
}

export async function apiGetProduct<
    T = SerajStudentsResponse,
    U extends Record<string, unknown> = Record<string, unknown>,
>({ id, ...params }: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `${SERAJ_STUDENTS_URL}/${id}`,
        method: 'get',
        params,
    })
}

export async function apiCreateProduct(payload: CreateProductPayload) {
    return ApiService.fetchDataWithAxios<SerajStudentsResponse>({
        url: SERAJ_STUDENTS_URL,
        method: 'post',
        data: payload,
    })
}

export async function apiUpdateProduct(
    id: string | number,
    payload: UpdateProductPayload,
) {
    return ApiService.fetchDataWithAxios<SerajStudentsResponse>({
        url: `${SERAJ_STUDENTS_URL}/${id}`,
        method: 'put',
        data: payload,
    })
}

export async function apiDeleteProduct(id: string | number) {
    return ApiService.fetchDataWithAxios<SerajStudentsResponse>({
        url: `${SERAJ_STUDENTS_URL}/${id}`,
        method: 'delete',
    })
}

export const normalizeSerajStudent = (student: SerajStudent): Product => {
    const firstName = (student.first_name ?? '').trim()
    const lastName = (student.last_name ?? '').trim()
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
    const status = student.deleted_at === null ? 'active' : 'inactive'

    return {
        id: student.id.toString(),
        name: fullName || `محصول ${student.id}`,
        firstName: firstName || fullName || `محصول ${student.id}`,
        lastName,
        email: `${student.national_id || student.id}@student.local`,
        img: `https://i.pravatar.cc/150?img=${(student.id % 70) + 1}`,
        role: `level_${student.level_id}`,
        userType: `level_${student.level_id}`,
        nationalId: student.national_id ?? '',
        gender: '',
        userId: student.user_id,
        lastOnline: Math.floor(
            new Date(student.updated_at ?? Date.now()).getTime() / 1000,
        ),
        status,
        personalInfo: {
            location: student.national_id ?? '',
            title: `Level ${student.level_id}`,
            birthday: student.birth_date ?? '',
            phoneNumber: student.national_id ?? '',
            dialCode: '',
            address: '',
            postcode: '',
            city: '',
            country: '',
            facebook: '',
            twitter: '',
            pinterest: '',
            linkedIn: '',
        },
        orderHistory: [],
        paymentMethod: [],
        subscription: [],
        totalSpending: student.id * 120,
    }
}
