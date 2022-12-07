import { OrderId, State } from "src/payment_clean/types";

export interface UpdateOrderPort {
    updateOrder: (orderId: OrderId, updateInfo: { state?: State; updateInfo?: any }) => OrderId
} 