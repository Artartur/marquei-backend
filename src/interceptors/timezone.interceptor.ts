import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const UTC_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
const OFFSET_MS = -3 * 60 * 60 * 1000;

function shiftToUtcMinus3(value: unknown): unknown {
  if (typeof value === 'string' && UTC_DATE_REGEX.test(value)) {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    const shifted = new Date(date.getTime() + OFFSET_MS);
    return shifted.toISOString().replace('Z', '-03:00');
  }

  if (Array.isArray(value)) return value.map(shiftToUtcMinus3);

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, shiftToUtcMinus3(v)]),
    );
  }

  return value;
}

@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map(shiftToUtcMinus3));
  }
}
