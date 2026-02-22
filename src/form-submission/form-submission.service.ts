import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FormSubmission,
  FormSubmissionDocument,
} from './schemas/form-submission.schema';
import { CreateFormSubmissionDto } from './dto/create-form-submission.dto';
import { UpdateFormSubmissionDto } from './dto/update-form-submission.dto';

@Injectable()
export class FormSubmissionService {
  constructor(
    @InjectModel(FormSubmission.name)
    private readonly formModel: Model<FormSubmissionDocument>,
  ) {}

  private calculateRemainingAmount(
    total: number,
    paymentSlip: { amount: number }[],
  ): number {
    const paid = paymentSlip.reduce((sum, item) => sum + item.amount, 0);
    return total - paid;
  }

  async create(
    userId: string,
    dto: CreateFormSubmissionDto,
  ): Promise<FormSubmissionDocument> {
    const remainingAmount = this.calculateRemainingAmount(
      dto.total,
      dto.paymentSlip ?? [],
    );

    const submission = await this.formModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      remainingAmount,
    });

    return submission;
  }

  async findAllByUser(userId: string): Promise<FormSubmissionDocument[]> {
    return this.formModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    userId: string,
    submissionId: string,
    dto: UpdateFormSubmissionDto,
  ): Promise<FormSubmissionDocument> {
    const submission = await this.formModel
      .findById(submissionId)
      .exec();

    if (!submission) {
      throw new NotFoundException('Form submission not found');
    }

    if (submission.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to edit this submission',
      );
    }

    const updatedTotal = dto.total ?? submission.total;
    const updatedPaymentSlip = dto.paymentSlip ?? submission.paymentSlip;
    const remainingAmount = this.calculateRemainingAmount(
      updatedTotal,
      updatedPaymentSlip,
    );

    Object.assign(submission, { ...dto, remainingAmount });
    return submission.save();
  }
}
