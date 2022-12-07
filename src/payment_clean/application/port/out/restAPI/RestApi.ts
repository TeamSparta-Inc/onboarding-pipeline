import { ConfirmOrderPort, ConfirmOrderPortF } from "./ConfirmOrderPort";
import { RefundOrderPort, RefundOrderPortF } from "./RefundOrderPort";

export interface IRestAPI extends ConfirmOrderPort, RefundOrderPort { }

export interface IRestAPIF {
    confirmOrder: ConfirmOrderPortF;
}