import { PaymentSlipItemDto } from './create-form-submission.dto';

export class UpdateFormSubmissionDto {
  submittedAt?: Date;
  name?: string;
  whatsappNumber?: string;
  partnerName?: string;
  ticketType?: string;
  paymentSlip?: PaymentSlipItemDto[];
  earlyBird?: boolean;
  total?: number;
}
