import { PipeTransform, Injectable, ArgumentMetadata, InternalServerErrorException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
    constructor(private readonly schema: ObjectSchema) { }

    transform(value: any, metadata: ArgumentMetadata) {
        const { error } = this.schema.validate(value);
        if (error) {
            error.details.forEach(detail => {
                const prop = detail.path.join('.');
                switch (detail.type) {
                    case ('number.base'): {
                        throw new InternalServerErrorException(`${prop} must be a number value`, prop);
                    }
                    case ('number.max'): {
                        throw new InternalServerErrorException(prop);
                    }
                    case ('number.min'): {
                        throw new InternalServerErrorException(prop);
                    }
                    case ('string.base'): {
                        throw new InternalServerErrorException(`${prop} must be a string value`, prop);
                    }
                    case ('string.length'): {
                        throw new InternalServerErrorException(prop);
                    }
                    case ('any.required'): {
                        throw new InternalServerErrorException(prop);
                    }
                    default: {
                        throw new InternalServerErrorException(JSON.stringify(detail))
                    }
                }
            })
        }
        return value;
    }
}


