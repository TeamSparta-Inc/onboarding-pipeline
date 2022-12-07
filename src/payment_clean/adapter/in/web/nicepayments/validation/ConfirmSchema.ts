import * as Joi from 'joi'

const object = Joi.object.bind(Joi);
const string = Joi.string.bind(Joi);
const number = Joi.number.bind(Joi);

export const confirmSchema = object({
    TID: string().min(30).length(30).required(),
    AuthToken: string().min(40).length(40).required(),
    MID: string().min(10).length(10).required(),
    Amt: number().max(1000000).min(0).required().strict(true),
    EdiDate: string().min(14).length(14).strict(true),
});
