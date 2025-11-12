import ApiService from './ApiService'
import type { Customer } from '@/views/concepts/customers/CustomerList/types'

export const SERAJ_USERS_URL = 'http://portal.serajedu.ir/api/admin/users'

export type SerajUser = {
    id: number
    first_name: string
    last_name: string
    national_id: string | null
    phone: string | null
    phone_verified_at: string | null
    email: string
    email_verified_at: string | null
    type: string | null
    avatar: string | null
    birth_date: string | null
    gender: string | null
    status: string | null
    telegram_username: string | null
    bale_username: string | null
    jaryan_username: string | null
    deleted_at: string | null
    created_at: string
    updated_at: string
}

export type SerajUsersResponse = {
    status: boolean
    message: string
    data: SerajUser[] | SerajUser
}

export type CreateCustomerPayload = {
    first_name: string
    last_name: string
    national_id: string
    phone: string
    email: string
    password: string
    type: string
    gender: string
    status: string
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>

export async function apiGetCustomersList<
    T = SerajUsersResponse,
    U extends Record<string, unknown> = Record<string, unknown>,
>(_params: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: SERAJ_USERS_URL,
        method: 'get',
    })
}

export async function apiGetCustomer<
    T = SerajUsersResponse,
    U extends Record<string, unknown> = Record<string, unknown>,
>({ id, ...params }: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `${SERAJ_USERS_URL}/${id}`,
        method: 'get',
        params,
    })
}

export async function apiGetCustomerLog<T, U extends Record<string, unknown>>({
    ...params
}: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/customer/log`,
        method: 'get',
        params,
    })
}

export async function apiCreateCustomer(payload: CreateCustomerPayload) {
    return ApiService.fetchDataWithAxios<SerajUsersResponse>({
        url: SERAJ_USERS_URL,
        method: 'post',
        data: payload,
    })
}

export async function apiUpdateCustomer(
    id: string | number,
    payload: UpdateCustomerPayload,
) {
    return ApiService.fetchDataWithAxios<SerajUsersResponse>({
        url: `${SERAJ_USERS_URL}/${id}`,
        method: 'put',
        data: payload,
    })
}

export async function apiDeleteCustomer(id: string | number) {
    return ApiService.fetchDataWithAxios<SerajUsersResponse>({
        url: `${SERAJ_USERS_URL}/${id}`,
        method: 'delete',
    })
}

export const normalizeSerajUser = (user: SerajUser): Customer => {
    const firstName = (user.first_name ?? '').trim()
    const lastName = (user.last_name ?? '').trim()
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
    const statusValue = (user.status ?? '').toLowerCase()
    const status =
        statusValue === 'active'
            ? 'active'
            : statusValue === 'inactive'
              ? 'inactive'
              : user.status ?? ''
    const phone = user.phone ?? ''

    return {
        id: user.id.toString(),
        name: fullName || `کاربر ${user.id}`,
        firstName: firstName || fullName || `کاربر ${user.id}`,
        lastName,
        email: user.email,
        img:
            user.avatar ??
            `https://i.pravatar.cc/150?img=${(user.id % 70) + 1}`,
        role: user.type ?? '',
        userType: user.type ?? '',
        nationalId: user.national_id ?? '',
        gender: user.gender ?? '',
        lastOnline: Math.floor(
            new Date(user.updated_at ?? Date.now()).getTime() / 1000,
        ),
        status,
        personalInfo: {
            location: phone,
            title: user.type ?? '',
            birthday: '',
            phoneNumber: phone,
            dialCode: '',
            address: '',
            postcode: '',
            city: '',
            country: user.gender ?? '',
            facebook: '',
            twitter: '',
            pinterest: '',
            linkedIn: '',
        },
        orderHistory: [],
        paymentMethod: [],
        subscription: [],
        totalSpending: user.id * 120,
    }
}
