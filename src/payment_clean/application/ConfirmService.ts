import { OrderId } from "src/payment_clean/types";
import { Order } from "../domain/Order";
import { IConfirm } from "./port/in/ConfirmInterface";
import { ConfirmOrderPort, ConfirmOrderPortF } from "./port/out/restAPI/ConfirmOrderPort";
import { SaveOrderPort } from "./port/out/persistence/SaveOrderPort";
import { UpdateOrderPort } from "./port/out/persistence/UpdateOrderPort";
import { map, Observable } from "rxjs";
import { Inject, Injectable } from "@nestjs/common";
import { PERSISTENCY_ADAPTER, REST_ADAPTER } from "../Constants";

@Injectable()
export class ConfirmService implements IConfirm {
    constructor(
        @Inject(PERSISTENCY_ADAPTER) private readonly saveOrderPort: SaveOrderPort,
        @Inject(PERSISTENCY_ADAPTER) private readonly updateOrderPort: UpdateOrderPort,
        @Inject(REST_ADAPTER) private readonly confirmOrderPort: ConfirmOrderPort,
        @Inject('CONFIRM') private readonly confirmOrder: ConfirmOrderPortF,
    ) { }

    confirm(confirmParam: { amount: number, productName: string }): Observable<OrderId> {
        const { amount, productName } = confirmParam;
        const newOrderId = this.saveOrderPort.saveOrder(new Order('ready', amount, productName));

        const confirmedOrderId = this.confirmOrder(confirmParam, newOrderId).pipe(
            map(confimInfo => {
                const confirmedOrderId = this.updateOrderPort.updateOrder(newOrderId, { state: 'done', updateInfo: confimInfo });

                return confirmedOrderId;
            })
        )

        return confirmedOrderId;
    }
}