import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { StringAsNumber } from 'fastify/types/utils';
import { ZodIssue } from 'zod';

export const mapZodIssuesToErrorMessages = (issues: ZodIssue[]) => {
  return issues.reduce((errors, issue) => {
    const fieldName = issue.path.join(',');
    return { ...errors, [fieldName]: issue.message };
  }, {} as Record<string, string>);
};

const PrismaKnownErrorMap = {
  P2025: { message: 'Record Not Found' },
} as const;

export const mapPrismaErrortoErrorMessage = (
  error: PrismaClientKnownRequestError
) => {
  if (!(PrismaKnownErrorMap as Record<string, any>)[error.code]) {
    throw error;
  }

  return PrismaKnownErrorMap[error.code as keyof typeof PrismaKnownErrorMap];
};
