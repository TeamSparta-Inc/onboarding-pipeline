import { Observable } from "rxjs";

export interface RefundOrderPort {
    refundOrder: (refundParam: { refundAmount: number }) => Observable<any>;
}
export type RefundOrderPortF = (refundParam: { refundAmount: number }) => Observable<any>