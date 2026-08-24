export {};

interface PaystackTransaction {
  reference: string;
  [key: string]: unknown;
}

interface ResumeTransactionCallbacks {
  onSuccess?: (transaction: PaystackTransaction) => void;
  onCancel?: () => void;
  onError?: (error: { message?: string }) => void;
}

declare global {
  interface Window {
    PaystackPop?: new () => {
      resumeTransaction: (accessCode: string, callbacks?: ResumeTransactionCallbacks) => void;
    };
  }
}
