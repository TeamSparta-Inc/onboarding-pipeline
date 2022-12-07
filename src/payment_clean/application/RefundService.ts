import { BadRequestException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { OrderId } from "src/payment_clean/types";
import { Order } from "../domain/Order";
import { IRefund } from "./port/in/RefundInterface";
import { LoadOrderPort } from "./port/out/persistence/LoadOrderPort";
import { RefundOrderPort } from "./port/out/restAPI/RefundOrderPort";
import { UpdateOrderPort } from "./port/out/persistence/UpdateOrderPort";
import { map, Observable } from "rxjs";
import { PERSISTENCY_ADAPTER, REST_ADAPTER } from "../Constants";

@Injectable()
export class RefundService implements IRefund {
    constructor(
        @Inject(PERSISTENCY_ADAPTER) private readonly loadOrderPort: LoadOrderPort,
        @Inject(PERSISTENCY_ADAPTER) private readonly updateOrderPort: UpdateOrderPort,
        @Inject(REST_ADAPTER) private readonly refundOrderPort: RefundOrderPort
    ) { }

    private isOrderStateRefundReady(order: Order) {
        if (order.state !== 'refund_ready') {
            throw new InternalServerErrorException('order state must refund_ready to refund');
        }
    }

    refund(refundParam: { orderId: OrderId, refundAmount: number }): Observable<OrderId> {
        const { orderId, refundAmount } = refundParam;
        this.updateOrderPort.updateOrder(orderId, { state: 'refund_ready' });

        const order = this.loadOrderPort.loadOrder(orderId);
        this.isOrderStateRefundReady(order);

        if (order.isRefundable(refundAmount)) {
            const refundedOrderId = this.refundOrderPort.refundOrder(refundParam).pipe(
                map(refundInfo => {
                    const refundedOrderId = this.updateOrderPort.updateOrder(orderId, { state: 'refund_done', updateInfo: refundInfo });
                    return refundedOrderId;
                })
            )

            return refundedOrderId;
        }

        throw new BadRequestException('Order not refundable');
    }
}