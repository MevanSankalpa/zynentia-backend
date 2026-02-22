import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormSubmissionController } from './form-submission.controller';
import { FormSubmissionService } from './form-submission.service';
import {
  FormSubmission,
  FormSubmissionSchema,
} from './schemas/form-submission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormSubmission.name, schema: FormSubmissionSchema },
    ]),
  ],
  controllers: [FormSubmissionController],
  providers: [FormSubmissionService],
})
export class FormSubmissionModule {}
