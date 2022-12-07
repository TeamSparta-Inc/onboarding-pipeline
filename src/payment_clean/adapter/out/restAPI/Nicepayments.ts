import { HttpService } from "@nestjs/axios";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { map } from "rxjs";
import { CancelQueryParam, CancelResponse, ConfirmDto, ConfirmInfo, ConfirmQueryParam, ConfirmResponse, OrderId, PayMethods, RefundDto, RefundQueryParam, RefundResponse } from "src/payment_clean/types";
import { IRestAPI } from "src/payment_clean/application/port/out/restAPI/RestApi";
import { EventEmitter } from "node:events";
import { PaymentRepository } from "../persistence/PaymentRepository";
import crypto from 'node:crypto'

@Injectable()
export class Nicepayments implements IRestAPI {
    private readonly MerchantKey = this.configService.get('MERCHANT_KEY');
    private readonly confirmUrl = this.configService.get('NICEPAYMENTS_CONFIRM_URL');
    private readonly refundUrl = this.configService.get('NICEPAYMENTS_REFUND_URL');
    private readonly cancelUrl = this.configService.get('NICEPAYMENTS_CANCEL_URL');
    private readonly canceler = new EventEmitter();


    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly paymentRepository: PaymentRepository,
    ) {
        this.httpService.axiosRef.interceptors.request.use((config) => {
            config.timeout = 12000;

            return config;
        });
        this.httpService.axiosRef.interceptors.response.use(
            (response) => response,
            (err) => {
                if (err.code === 'ECONNABORTED') {
                    this.canceler.emit('NET_CANCEL');
                    throw new InternalServerErrorException('connection time-out')
                }

                if (err.reponse?.status === 408) {
                    this.canceler.emit('NET_CANCEL');
                    throw new InternalServerErrorException('read time-out')
                }

                throw new InternalServerErrorException('Axios returning Error: ', err.toString())
            }

        )
    }

    private createSignature(signatureBase: string) {
        return crypto
            .createHash('sha256')
            .update(signatureBase)
            .digest('hex');
    }

    private compareSignature(paymentParam: ConfirmQueryParam | RefundQueryParam | CancelQueryParam, receivedSignature: string) {
        if (this.isConfirmDto(paymentParam)) {
            const { EdiDate, MID, Amt } = paymentParam;
            const signatureBase = EdiDate + MID + Amt + this.MerchantKey;

            return this.createSignature(signatureBase) !== receivedSignature;
        }
        if (this.isRefundDto(paymentParam)) {
            const { MID, CancelAmt, EdiDate } = paymentParam;
            const signatureBase = MID + CancelAmt + EdiDate + this.MerchantKey;

            return this.createSignature(signatureBase) !== receivedSignature;
        }

        throw new BadRequestException('invalid payment param type')
    }

    private isConfirmed(resultCode: string) {
        return ['3001', '4000', '4100', 'A000', '7001'].includes(resultCode);
    }

    private isConfirmDto = (confirmParam): confirmParam is ConfirmDto => {
        if (confirmParam.productName) return true;
        return false;
    }

    private isRefundDto = (refundParam): refundParam is RefundDto => {
        if (refundParam.CancelAmt) return true;
        return false;
    }

    private getPayMethod(confirmResponse: ConfirmResponse): PayMethods {
        if (confirmResponse['CardCode']) return 'CARD';
        if (confirmResponse['VbankBankCode']) return 'VBANK';
        if (confirmResponse['BankCode']) return 'BANK';
        return 'UNKNOWN';
    }

    private mapConfirmQueryParam = (confirmDto: ConfirmDto): ConfirmQueryParam => {
        const { EdiDate, MID, Amt, AuthToken, TID, CharSet, EdiType, MallReserved } = confirmDto;
        const signatureBase = EdiDate + MID + Amt + this.MerchantKey;
        const confirmQueryParam: ConfirmQueryParam = {
            SignData: this.createSignature(signatureBase),
            MID,
            Amt,
            AuthToken,
            TID,
            EdiDate,
            ...(CharSet && { CharSet }),
            ...(EdiType && { EdiType }),
            ...(MallReserved && { MallReserved })
        }

        return confirmQueryParam;
    }

    private mapRefundQueryParam = (refundDto: RefundDto): RefundQueryParam => {
        const { MID, CancelAmt, EdiDate, TID, Moid, CancelMsg, PartialCancelCode, CharSet, EdiType, MallReserved, RefundAcctNm, RefundAcctNo, RefundBankCd } = refundDto;
        const signatureBase = MID + CancelAmt + EdiDate + this.MerchantKey;
        const refundQueryParam: RefundQueryParam = {
            SignData: this.createSignature(signatureBase),
            TID,
            MID,
            Moid,
            CancelAmt,
            CancelMsg,
            PartialCancelCode,
            EdiDate,
            ...(CharSet && { CharSet }),
            ...(EdiType && { EdiType }),
            ...(MallReserved && { MallReserved }),
            ...(RefundAcctNo && { RefundAcctNo }),
            ...(RefundBankCd && { RefundBankCd }),
            ...(RefundAcctNm && { RefundAcctNm })
        }

        return refundQueryParam;
    }

    private netCancel(cancelQueryParam: CancelQueryParam, orderId: OrderId): void {
        this.paymentRepository.updateOrder(orderId, { state: 'cancel_ready' });

        const order = this.paymentRepository.loadOrder(orderId);
        if (order.state !== 'cancel_ready') {
            throw new InternalServerErrorException('order must be in cancel ready state to cancel');
        }

        new Promise<OrderId>((resolve) => {
            this.httpService.post<CancelResponse>(this.cancelUrl, cancelQueryParam).pipe(
                map(({ data: cancelResponse }) => {
                    this.compareSignature(cancelQueryParam, cancelResponse.Signature)
                    if (cancelResponse.ResultCode !== '2001') {
                        throw new InternalServerErrorException('bad cancel result code');
                    }

                    this.paymentRepository.updateOrder(orderId, { state: 'cancel_done' });

                    resolve(orderId);
                })
            )
        })
    }

    confirmOrder = (confirmParam, orderId) => {
        if (this.isConfirmDto(confirmParam)) {
            const confirmQueryParam = this.mapConfirmQueryParam(confirmParam);

            this.canceler.once('NET_CANCEL', () => {
                this.netCancel({ NetCancel: 1, ...confirmQueryParam }, orderId)
            });

            const confirmInfo = this.httpService.post<ConfirmResponse>(this.confirmUrl, confirmQueryParam).pipe(
                map(({ data: confirmResponse }) => {
                    const forged = this.compareSignature(confirmQueryParam, confirmResponse.Signature);
                    if (forged) {
                        this.canceler.emit('NET_CANCEL');
                        throw new InternalServerErrorException('forgery: confirm')
                    }
                    if (this.isConfirmed(confirmResponse.ResultCode)) {
                        throw new InternalServerErrorException('bad confirm result code');
                    }

                    const confirmInfo: ConfirmInfo = {
                        paymethod: this.getPayMethod(confirmResponse),
                        confirmData: confirmResponse
                    };

                    return confirmInfo;
                })
            )

            return confirmInfo;
        }

        throw new BadRequestException('Bad confirm parameters');
    }

    refundOrder = (refundParam) => {
        if (this.isRefundDto(refundParam)) {
            const refundQueryParam = this.mapRefundQueryParam(refundParam);

            const refundInfo = this.httpService.post<RefundResponse>(this.refundUrl, refundQueryParam).pipe(
                map(({ data: refundResponse }) => {
                    const forged = this.compareSignature(refundQueryParam, refundResponse.Signature);
                    if (forged) {
                        throw new InternalServerErrorException('forgery: refund');
                    }

                    if (refundResponse.ResultCode !== '2211') {
                        throw new InternalServerErrorException('bad refund result code');
                    }

                    return refundInfo;
                })
            )
        }

        throw new BadRequestException('Bad refund parameters');
    }
}