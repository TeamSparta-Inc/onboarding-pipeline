import { State } from "src/payment_clean/types";

export class Order {
    state: State;
    amount: number;
    productName: string;
    paymentInfo: any;
    constructor(
        state: State,
        amount: number,
        productName: string,
    ) {
        this.state = state;
        this.amount = amount;
        this.productName = productName;
    }

    setPaymentInfo(paymentInfo: any) {
        this.paymentInfo = paymentInfo;
    }

    // 비즈니스 규칙
    isRefundable(refundingAmount: number) {
        if (this.state !== 'done') return false;
        return this.amount >= refundingAmount;
    }
}