import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { StringAsNumber } from 'fastify/types/utils';

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
