import { OrderId } from "src/payment_clean/types";
import { Order } from "src/payment_clean/domain/Order";

export interface LoadOrderPort {
    loadOrder: (orderId: OrderId) => Order;
}
