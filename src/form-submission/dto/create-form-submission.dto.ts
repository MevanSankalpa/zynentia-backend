export class PaymentSlipItemDto {
  date: Date;
  url: string;
  amount: number;
}

export class CreateFormSubmissionDto {
  submittedAt: Date;
  name: string;
  whatsappNumber: string;
  partnerName: string;
  ticketType: string;
  paymentSlip: PaymentSlipItemDto[];
  earlyBird: boolean;
  total: number;
}
