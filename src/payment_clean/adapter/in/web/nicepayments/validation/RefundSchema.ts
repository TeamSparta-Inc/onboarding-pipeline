import * as Joi from 'joi'

const object = Joi.object.bind(Joi);
const string = Joi.string.bind(Joi);
const number = Joi.number.bind(Joi);

export const refundSchema = object({
    TID: string().min(30).length(30).required(),
    MID: string().min(10).length(10).required(),
    Moid: string().min(64).max(64).required(),
    CancelAmt: number().max(1000000).min(0).required().strict(true),
    CancelMsg: string().max(100).required(),
    PartialCancelCode: number().allow(0, 1).strict(),
    EdiDate: string().min(14).length(14).strict(true),
});
