import { Observable } from "rxjs";
import { OrderId } from "src/payment_clean/types";

export interface IRefund {
    refund(refundParam: { orderId: OrderId, refundAmount: number }): Observable<OrderId>
}