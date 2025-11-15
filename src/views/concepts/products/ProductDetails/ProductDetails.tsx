import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Loading from '@/components/shared/Loading'
import ProfileSection from './ProfileSection'
import BillingSection from './BillingSection'
import ActivitySection from './ActivitySection'
import {
    apiGetProduct,
    normalizeSerajStudent,
    type SerajStudentsResponse,
    type SerajStudent,
} from '@/services/ProductService'
import useSWR from 'swr'
import { useParams } from 'react-router-dom'
import type { Product } from '../ProductList/types'

const { TabNav, TabList, TabContent } = Tabs

const ProductDetails = () => {
    const { id } = useParams()

    const { data, isLoading } = useSWR<SerajStudentsResponse>(
        ['/api/products', { id: id as string }],
        ([, params]) =>
            apiGetProduct<SerajStudentsResponse, { id: string }>(
                params as { id: string },
            ),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        },
    )

    const productData: Product | undefined = (() => {
        const payload = data?.data
        if (!payload) {
            return undefined
        }
        if (Array.isArray(payload)) {
            const found = payload.find(
                (item) => item.id.toString() === (id as string),
            )
            return found ? normalizeSerajStudent(found) : undefined
        }
        return normalizeSerajStudent(payload as SerajStudent)
    })()

    return (
        <Loading loading={isLoading}>
            {productData && (
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="min-w-[330px] 2xl:min-w-[400px]">
                        <ProfileSection data={productData} />
                    </div>
                    <Card className="w-full">
                        <Tabs defaultValue="billing">
                            <TabList>
                                <TabNav value="billing">صورتحساب</TabNav>
                                <TabNav value="activity">فعالیت</TabNav>
                            </TabList>
                            <div className="p-4">
                                <TabContent value="billing">
                                    <BillingSection data={productData} />
                                </TabContent>
                                <TabContent value="activity">
                                    <ActivitySection
                                        productName={productData.name}
                                        id={id as string}
                                    />
                                </TabContent>
                            </div>
                        </Tabs>
                    </Card>
                </div>
            )}
            {!productData && !isLoading && (
                <div className="flex items-center justify-center">
                    دانش‌آموزی پیدا نشد.
                </div>
            )}
        </Loading>
    )
}

export default ProductDetails

