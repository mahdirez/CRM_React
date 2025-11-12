import type { Control, FieldErrors } from 'react-hook-form'

export type CustomerFormSchema = {
    firstName: string
    lastName: string
    nationalId: string
    phone: string
    email: string
    password?: string
    type: string
    gender: string
    status: string
}

export type FormSectionBaseProps = {
    control: Control<CustomerFormSchema>
    errors: FieldErrors<CustomerFormSchema>
}
