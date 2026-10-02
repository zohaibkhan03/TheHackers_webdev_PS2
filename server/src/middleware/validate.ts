// ─── src/middleware/validate.ts ───────────────────────────────────────────────
// Zod schema validation middleware factory.

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';

/** Validate req.body against a Zod schema */
export function validate<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(result.error); // Forwarded to errorHandler → ZodError branch
    }
    req.body = result.data as z.infer<T>;
    next();
  };
}

/** Validate req.query against a Zod schema */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(result.error);
    }
    (req as any).validatedQuery = result.data;
    next();
  };
}

/** Validate req.params against a Zod schema */
export function validateParams<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(result.error);
    }
    req.params = result.data;
    next();
  };
}
