import { PaymentRepository } from './adapter/out/persistence/PaymentRepository'
import { Nicepayments } from './adapter/out/restAPI/Nicepayments'
import { ConfirmService } from './application/ConfirmService';
import { RefundService } from './application/RefundService';
import { CONFIRM_USECASE, PERSISTENCY_ADAPTER, REFUND_USECASE, REST_ADAPTER } from './Constants';

export const CD = [
    {
        provide: REST_ADAPTER,
        useClass: Nicepayments
    },
    {
        provide: PERSISTENCY_ADAPTER,
        useClass: PaymentRepository
    },
    {
        provide: CONFIRM_USECASE,
        useClass: ConfirmService
    },
    {
        provide: REFUND_USECASE,
        useClass: RefundService
    }
]

