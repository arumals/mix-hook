import { validate } from 'class-validator';

export async function validateDto<T>(dto: T) {
  const errors = await validate(dto as unknown as Record<string, unknown>);

  if (errors.length > 0) {
    return errors.reduce((p, c) => {
      const o = { ...p };
      if (!o[c.property as keyof T]) {
        o[c.property as keyof T] =
          (c.constraints && Object.values(c.constraints)[0]) || '';
      }
      return o;
    }, {} as { [key in keyof T]: string });
  }

  return;
}
