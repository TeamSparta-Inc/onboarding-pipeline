import { Observable } from "rxjs";
import { OrderId } from "src/payment_clean/types";

export interface IConfirm {
    confirm(confirmParam: { amount: number, productName: string }): Observable<OrderId>
}