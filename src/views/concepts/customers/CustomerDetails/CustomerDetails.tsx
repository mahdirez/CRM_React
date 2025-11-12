import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Loading from '@/components/shared/Loading'
import ProfileSection from './ProfileSection'
import BillingSection from './BillingSection'
import ActivitySection from './ActivitySection'
import {
    apiGetCustomer,
    normalizeSerajUser,
    type SerajUsersResponse,
    type SerajUser,
} from '@/services/CustomersService'
import useSWR from 'swr'
import { useParams } from 'react-router-dom'
import type { Customer } from '../CustomerList/types'

const { TabNav, TabList, TabContent } = Tabs

const CustomerDetails = () => {
    const { id } = useParams()

    const { data, isLoading } = useSWR<SerajUsersResponse>(
        ['/api/customers', { id: id as string }],
        ([, params]) =>
            apiGetCustomer<SerajUsersResponse, { id: string }>(
                params as { id: string },
            ),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            evalidateOnFocus: false,
        },
    )

    const customerData: Customer | undefined = (() => {
        const payload = data?.data
        if (!payload) {
            return undefined
        }
        if (Array.isArray(payload)) {
            const found = payload.find(
                (item) => item.id.toString() === (id as string),
            )
            return found ? normalizeSerajUser(found) : undefined
        }
        return normalizeSerajUser(payload as SerajUser)
    })()

    return (
        <Loading loading={isLoading}>
            {customerData && (
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="min-w-[330px] 2xl:min-w-[400px]">
                        <ProfileSection data={customerData} />
                    </div>
                    <Card className="w-full">
                        <Tabs defaultValue="billing">
                            <TabList>
                                <TabNav value="billing">صورتحساب</TabNav>
                                <TabNav value="activity">فعالیت</TabNav>
                            </TabList>
                            <div className="p-4">
                                <TabContent value="billing">
                                    <BillingSection data={customerData} />
                                </TabContent>
                                <TabContent value="activity">
                                    <ActivitySection
                                        customerName={customerData.name}
                                        id={id as string}
                                    />
                                </TabContent>
                            </div>
                        </Tabs>
                    </Card>
                </div>
            )}
            {!customerData && !isLoading && (
                <div className="flex items-center justify-center">
                    کاربری پیدا نشد.
                </div>
            )}
        </Loading>
    )
}

export default CustomerDetails
