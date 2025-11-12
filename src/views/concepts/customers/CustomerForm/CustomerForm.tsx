import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/Form'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { FormItem } from '@/components/ui/Form'
import isEmpty from 'lodash/isEmpty'
import type { CommonProps } from '@/@types/common'
import type { CustomerFormSchema } from './types'

type CustomerFormProps = {
    onFormSubmit: (values: CustomerFormSchema) => void
    defaultValues?: CustomerFormSchema
    newCustomer?: boolean
} & CommonProps

const typeOptions = [
    { value: 'user', label: 'کاربر' },
    { value: 'staff', label: 'کارمند' },
]

const genderOptions = [
    { value: 'male', label: 'مرد' },
    { value: 'female', label: 'زن' },
    { value: 'other', label: 'نامشخص' },
]

const statusOptions = [
    { value: 'active', label: 'فعال' },
    { value: 'inactive', label: 'غیرفعال' },
]

const createValidationSchema = (requirePassword: boolean) => {
    const passwordSchema = requirePassword
        ? z.string().min(6, { message: 'کلمه عبور باید حداقل ۶ کاراکتر باشد' })
        : z
              .union([
                  z.string().min(6, {
                      message: 'کلمه عبور باید حداقل ۶ کاراکتر باشد',
                  }),
                  z.literal(''),
              ])
              .optional()

    return z.object({
        firstName: z.string().min(1, { message: 'نام لازم است' }),
        lastName: z.string().min(1, { message: 'نام خانوادگی لازم است' }),
        nationalId: z
            .string()
            .min(1, { message: 'کد ملی لازم است' })
            .max(10, { message: 'کد ملی باید ۱۰ رقم باشد' }),
        phone: z.string().min(1, { message: 'شماره موبایل لازم است' }),
        email: z
            .string()
            .min(1, { message: 'ایمیل لازم است' })
            .email({ message: 'ایمیل نامعتبر است' }),
        password: passwordSchema,
        type: z.string().min(1, { message: 'نوع کاربر لازم است' }),
        gender: z.string().min(1, { message: 'جنسیت لازم است' }),
        status: z.string().min(1, { message: 'وضعیت لازم است' }),
    })
}

const CustomerForm = (props: CustomerFormProps) => {
    const {
        onFormSubmit,
        defaultValues = {},
        newCustomer = false,
        children,
    } = props

    const validationSchema = useMemo(
        () => createValidationSchema(newCustomer),
        [newCustomer],
    )

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<CustomerFormSchema>({
        defaultValues: {
            status: 'active',
            type: 'user',
            gender: 'male',
            password: '',
            ...defaultValues,
        },
        resolver: zodResolver(validationSchema),
    })

    useEffect(() => {
        if (!isEmpty(defaultValues)) {
            reset({
                status: 'active',
                type: 'user',
                gender: 'male',
                password: '',
                ...defaultValues,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(defaultValues)])

    const onSubmit = (values: CustomerFormSchema) => {
        onFormSubmit?.({
            ...values,
            password: values.password ? values.password : undefined,
        })
    }

    return (
        <Form
            className="flex w-full h-full"
            containerClassName="flex flex-col w-full justify-between"
            onSubmit={handleSubmit(onSubmit)}
        >
            <Container>
                <Card>
                    <h4 className="mb-6">اطلاعات کاربر</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormItem
                            label="نام"
                            invalid={Boolean(errors.firstName)}
                            errorMessage={errors.firstName?.message}
                        >
                            <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="نام"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="نام خانوادگی"
                            invalid={Boolean(errors.lastName)}
                            errorMessage={errors.lastName?.message}
                        >
                            <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="نام خانوادگی"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="کد ملی"
                            invalid={Boolean(errors.nationalId)}
                            errorMessage={errors.nationalId?.message}
                        >
                            <Controller
                                name="nationalId"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="کد ملی"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="شماره موبایل"
                            invalid={Boolean(errors.phone)}
                            errorMessage={errors.phone?.message}
                        >
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="شماره موبایل"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="ایمیل"
                            className="md:col-span-2"
                            invalid={Boolean(errors.email)}
                            errorMessage={errors.email?.message}
                        >
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="email"
                                        autoComplete="off"
                                        placeholder="ایمیل"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label={newCustomer ? 'کلمه عبور' : 'کلمه عبور (اختیاری)'}
                            invalid={Boolean(errors.password)}
                            errorMessage={errors.password?.message}
                        >
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="کلمه عبور"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="نوع کاربر"
                            invalid={Boolean(errors.type)}
                            errorMessage={errors.type?.message}
                        >
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={typeOptions}
                                        value={typeOptions.find(
                                            (option) => option.value === field.value,
                                        )}
                                        onChange={(option) =>
                                            field.onChange(option?.value)
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="جنسیت"
                            invalid={Boolean(errors.gender)}
                            errorMessage={errors.gender?.message}
                        >
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={genderOptions}
                                        value={genderOptions.find(
                                            (option) => option.value === field.value,
                                        )}
                                        onChange={(option) =>
                                            field.onChange(option?.value)
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="وضعیت"
                            invalid={Boolean(errors.status)}
                            errorMessage={errors.status?.message}
                        >
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={statusOptions}
                                        value={statusOptions.find(
                                            (option) => option.value === field.value,
                                        )}
                                        onChange={(option) =>
                                            field.onChange(option?.value)
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                </Card>
            </Container>
            <BottomStickyBar>{children}</BottomStickyBar>
        </Form>
    )
}

export default CustomerForm
