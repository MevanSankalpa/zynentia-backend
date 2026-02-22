import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FormSubmissionDocument = FormSubmission & Document;

export class PaymentSlipItem {
  date: Date;
  url: string;
  amount: number;
}

@Schema({ timestamps: true })
export class FormSubmission {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  submittedAt: Date;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  whatsappNumber: string;

  @Prop({ required: true })
  partnerName: string;

  @Prop({ required: true })
  ticketType: string;

  @Prop({
    type: [
      {
        date: { type: Date, required: true },
        url: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    default: [],
  })
  paymentSlip: PaymentSlipItem[];

  @Prop({ required: true, default: false })
  earlyBird: boolean;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  remainingAmount: number;
}

export const FormSubmissionSchema = SchemaFactory.createForClass(FormSubmission);
