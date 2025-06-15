import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { IApiResponse } from '../interface/response';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // If the response is already formatted (like error responses from your handler)
        if (data?.statusCode && data?.message) {
          response.status(data.statusCode);
          return {
            status: data.statusCode >= 200 && data.statusCode < 300,
            path: request?.url,
            statusCode: data.statusCode,
            message: data.message,
            timestamp: new Date().toISOString(),
            response: data,
          };
        }

        // For successful responses
        const result: IApiResponse<T> = {
          status: true,
          path: request?.url,
          statusCode: response.statusCode,
          message: 'Request successful',
          timestamp: new Date().toISOString(),
          response: data,
        };

        return result;
      }),
    );
  }
}
