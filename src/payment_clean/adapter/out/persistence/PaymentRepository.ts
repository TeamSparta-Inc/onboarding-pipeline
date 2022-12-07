import { BadRequestException, Injectable } from "@nestjs/common";
import { OrderId } from "src/payment_clean/types";
import { IPersistence } from "src/payment_clean/application/port/out/persistence/Persistence";
import { Order } from "src/payment_clean/domain/Order";

@Injectable()
export class PaymentRepository implements IPersistence {
    private readonly orders: Map<number, Order> = new Map();
    private readonly store: Map<string, number> = new Map([['milk', 1], ['ham', 0]]);
    private readonly emtpyIndex: number[] = [];
    private orderId = 0;

    saveOrder = (order) => {
        // 빈 인덱스부터 채워넣기
        const orderId = this.emtpyIndex.pop() ?? ++this.orderId;
        this.orders.set(orderId, order);

        return orderId;
    }

    loadOrder = (orderId) => {
        return this.orders.get(orderId) ?? null
    }

    updateOrder = (orderId, updateInfo) => {
        const targetOrder = this.orders.get(orderId);
        const stock = this.store.get(targetOrder.productName);

        if (updateInfo.state === 'done') {
            if (!stock) {
                throw new BadRequestException('can\'t set order. out of stock')
            }
            this.store.set(targetOrder.productName, stock - 1);
        }
        updateInfo.state && (targetOrder.state = updateInfo.state);
        updateInfo.state === 'refund_done' && this.store.set(targetOrder.productName, stock + 1);
        updateInfo.updateInfo && (targetOrder.paymentInfo = updateInfo.updateInfo);

        return orderId;
    }

    deleteOrder(orderId: OrderId) {
        if (!this.orders.get(orderId)) return false;
        this.orders.delete(orderId);
        this.emtpyIndex.push(orderId);

        return true;
    }
}