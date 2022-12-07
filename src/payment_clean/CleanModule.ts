import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { ConfirmController } from './adapter/in/web/nicepayments/ConfirmController';
import { RefundController } from './adapter/in/web/nicepayments/RefundController';
import { HttpModule } from '@nestjs/axios';
import { CD } from './CustomProviders';
import { PaymentRepository } from './adapter/out/persistence/PaymentRepository';
import { REST_ADAPTER } from './Constants';
import { Nicepayments } from './adapter/out/restAPI/Nicepayments';

@Module({
    imports: [HttpModule, ConfigModule.forRoot()],
    controllers: [ConfirmController, RefundController],
    providers: [PaymentRepository, ...CD, {
        inject: [REST_ADAPTER],
        useFactory: async (nicepayments: Nicepayments) => {
            return nicepayments.confirmOrder.bind(nicepayments);
        },
        provide: 'CONFIRM'
    }],
})
export class CleanModule { }