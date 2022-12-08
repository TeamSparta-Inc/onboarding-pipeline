import { Body, Controller, Get, Inject, Post, UsePipes } from "@nestjs/common";
import { IConfirm } from "src/payment_clean/application/port/in/ConfirmInterface";
import { JoiValidationPipe } from "src/payment_clean/adapter/in/web/nicepayments/validation/Validate";
import { confirmSchema } from "./validation/ConfirmSchema";
import { ConfirmDto } from "src/payment_clean/types";
import { CONFIRM_USECASE } from "src/payment_clean/Constants";

@Controller('/api/payment')
export class ConfirmController {
    constructor(
        @Inject(CONFIRM_USECASE) private readonly confirmUseCase: IConfirm,
    ) { }
    @Get('/')
    health() {
        return 'hi!';
    }

    @Post('/confirm')
    @UsePipes(new JoiValidationPipe(confirmSchema))
    confirm(@Body() confirmDto: ConfirmDto) {
        // 클린아키텍처상 command는 어차피 컨트롤러에서 호출되므로 차라리 pipe를 활용하는 것이 현명한 것 같다.
        // 컨트롤러는 어차피 어댑터이기 때문에 context bound하기 때문이다.
        const confirmUseCaseParam = { ...confirmDto, amount: confirmDto.Amt };
        return this.confirmUseCase.confirm(confirmUseCaseParam);
    }
}