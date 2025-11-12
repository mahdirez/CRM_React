import { mock } from '../MockAdapter'
import { customerActivityLog } from '../data/logData'

mock.onGet(new RegExp(`/api/customer/log`)).reply(() => {
    return [200, customerActivityLog]
})
