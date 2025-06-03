import { ApiQuery } from '@nestjs/swagger';

export function MailPaginationQuery() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    ApiQuery({ name: 'page', required: false, type: Number, default: 1 })(
      target,
      key,
      descriptor,
    );
    ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })(
      target,
      key,
      descriptor,
    );
    ApiQuery({ name: 'order', required: false, type: String, default: 'desc' })(
      target,
      key,
      descriptor,
    );
    ApiQuery({ name: 'search', required: false, type: String, default: '' })(
      target,
      key,
      descriptor,
    );
    ApiQuery({
      name: 'startDate',
      required: false,
      type: String,
      format: 'date',
      default: null,
    })(target, key, descriptor);
    ApiQuery({
      name: 'endDate',
      required: false,
      type: String,
      format: 'date',
      default: null,
    })(target, key, descriptor);
  };
}
