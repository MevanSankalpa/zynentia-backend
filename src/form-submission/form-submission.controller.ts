import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FormSubmissionService } from './form-submission.service';
import { CreateFormSubmissionDto } from './dto/create-form-submission.dto';
import { UpdateFormSubmissionDto } from './dto/update-form-submission.dto';

@UseGuards(JwtAuthGuard)
@Controller('form-submissions')
export class FormSubmissionController {
  constructor(
    private readonly formSubmissionService: FormSubmissionService,
  ) {}

  @Post()
  create(@Request() req, @Body() dto: CreateFormSubmissionDto) {
    return this.formSubmissionService.create(req.user._id.toString(), dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.formSubmissionService.findAllByUser(req.user._id.toString());
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateFormSubmissionDto,
  ) {
    return this.formSubmissionService.update(
      req.user._id.toString(),
      id,
      dto,
    );
  }
}
