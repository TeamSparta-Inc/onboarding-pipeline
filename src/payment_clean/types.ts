type CharSets = 'euc-kr' | 'utf-8';
type EdiTypes = 'JSON' | 'KV';
type ProductName = { productName: string };

export type PayMethods = 'CARD' | 'BANK' | 'VBANK' | 'CELLPHONE' | 'UNKNOWN';
export type OrderId = number;
export type State = 'ready' | 'done' | 'cancel_ready' | 'cancel_done' | 'refund_ready' | 'refund_done';
export type ConfirmSuccessCodes = '3001' | '4000' | '4100' | 'A000' | '7001';
export type ConfirmQueryParam = {
    TID: string;
    AuthToken: string;
    MID: string;
    Amt: number;
    EdiDate: string;
    SignData: string;
    CharSet?: CharSets;
    EdiType?: EdiTypes;
    MallReserved?: string;
};
export type CancelQueryParam = {
    TID: string;
    AuthToken: string;
    MID: string;
    Amt?: number;
    EdiDate: string; //YYYYMMDDHHMMSS
    NetCancel: 1;
    SignData: string;
    CharSet?: CharSets;
    EdiType?: EdiTypes;
    MallReserved?: string;
};
export type RefundQueryParam = {
    TID: string;
    MID: string;
    Moid: string;// 별도 계약 필요. 중복 취소 방지를 위함
    CancelAmt: number;
    CancelMsg: string;
    PartialCancelCode: '0' | '1';
    EdiDate: Date;//YYYMMDDHHMMSS
    SignData: string;
    CharSet?: CharSets;
    EdiType?: EdiTypes;
    MallReserved?: string;
    RefundAcctNo?: string;
    RefundBankCd?: string;
    RefundAcctNm?: string;
};

export type ConfirmResponse = {
    ResultCode: '3001' | '4000' | '4100' | 'A000' | '7001' | string;
    ResultMsg: string // euc-kr로만 인코딩됨
    Amt: string; // 0001000
    MID: string;
    Moid: string;
    Signature: string;
    GoodsName: string;
    TID: string;
    AuthDate: Date; // YYMMDDHHMMSS
    PayMethod: PayMethods;
    MallReserved: string;
    BuyerEmail?: string;
    BuyerTel?: string;
    BuyerName?: string;
    AuthCode?: string;
};
export type CardConfirmResponse = ConfirmResponse & {
    CardCode: string;
    CardName: string;
    CardNo: string;
    CardQuota: string;
    CardInterest: string;
    AcquCardCode: string;
    AcquCardName: string;
    CardCl: '0' | '1';// 
    CcPartCl: '0' | '1';//
    CardType: '01' | '02' | '03';//
    ClickpayCl?: '6' | '8' | '15' | '16' | '20' | '21';
    CouponAmt?: number;
    CouponMinAmt?: number;
    PointAppAmt?: string;
    MultiCl?: '0' | '1';
    MultiCardAcquAmt?: number;
    MultiPointAmt?: number;
    MultiCouponAmt?: number;
    RcptType?: '1' | '2';
    RcptTID?: string;
    RcptAuthCode?: string
};
export type VBankConfirmResponse = ConfirmResponse & {
    VbankBankCode: string;
    VbankBankName: string;
    VbankNum: string;
    VbankExpDate: Date// yyyyMMdd
    VbankExpTime: string// HHmmss
};
export type BankConfirmResponse = ConfirmResponse & {
    BankCode: string;
    BankName: string;
    RcptType: '0' | '1' | '2';
    RcptTID?: string;
    RcptAuthCode?: string;
};
export type CancelResponse = {
    ResultCode: string; // 상세내용은 결과코드 탭 참조
    ResultMsg: string;
    CancelAmt: string;
    MID: string;
    Moid: string;
    Signature?: string;
    PayMethod?: PayMethods;
    TID?: string;
    CancelDate?: Date;//YYYMMDD
    CancelTime?: string;//HHmmss
    CancelNum?: string;
    RemainAmt?: string;
    MallReserved?: string;
};
export type RefundResponse = {
    ResultCode: string;
    ResultMsg: string;
    CancelAmt: string;
    MID: string;
    Moid: string;
    Signature: string;
    PayMethod: PayMethods;
    TID: string;
    CancelDate: string;
    CancelTime: string;//HHmmss
    CancelNum: string;
    RemainAmt: string;
    MallReserved: string;
};
export type ConfirmInfo = {
    paymethod: PayMethods
    confirmData: ConfirmResponse
}
export type RefundInfo = {
    refundData: RefundResponse
}
export type Order = {
    state: State;
    amount: number;
    productName: string;
    confirmInfo?: ConfirmInfo
};
export type ConfirmDto = Omit<ConfirmQueryParam, 'SignData'> & ProductName;
export type RefundDto = Omit<RefundQueryParam, 'SignData'> & ProductName & { orderId: OrderId };
export type CancelInfo = Omit<CancelQueryParam, 'SignData' | 'NetCancel'> & ProductName;