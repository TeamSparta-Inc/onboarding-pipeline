import { Body, Controller, Inject, Post, UsePipes } from "@nestjs/common";
import { RefundDto } from "src/payment_clean/types";
import { IRefund } from "src/payment_clean/application/port/in/RefundInterface";
import { JoiValidationPipe } from "src/payment_clean/adapter/in/web/nicepayments/validation/Validate";
import { refundSchema } from "./validation/RefundSchema";
import { REFUND_USECASE } from "src/payment_clean/Constants";

@Controller('/api/payment')
export class RefundController {
    constructor(
        @Inject(REFUND_USECASE) private readonly refundUseCase: IRefund
    ) { }

    @Post('/refund')
    @UsePipes(new JoiValidationPipe(refundSchema))
    refund(@Body() refundDto: RefundDto) {
        const refundUseCaseParam = { ...refundDto, refundAmount: refundDto.CancelAmt };

        return this.refundUseCase.refund(refundUseCaseParam);
    }
}