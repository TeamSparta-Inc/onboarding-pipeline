import { Observable } from "rxjs";
import { OrderId } from "src/payment_clean/types";

export interface ConfirmOrderPort {
    confirmOrder: (confrimParam: { amount: number }, orderId: OrderId) => Observable<any>
}

export type ConfirmOrderPortF = (confrimParam: { amount: number }, orderId: OrderId) => Observable<any>
