import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserDocument } from './schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import {
  RequestResetPasswordDto,
  ResetPasswordDto,
} from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ accessToken: string }> {
    const existingUser = await this.userModel
      .findOne({ $or: [{ email: dto.email }, { username: dto.username }] })
      .exec();
    if (existingUser) {
      throw new ConflictException('Username or email already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      username: dto.username,
      email: dto.email,
      password: hashed,
    });

    return this.issueToken(user);
  }

  async signin(dto: SigninDto): Promise<{ accessToken: string }> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueToken(user);
  }

  async requestResetPassword(
    dto: RequestResetPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new NotFoundException('No account found with that email');
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In a real application you would send an email with the token here.
    return { message: 'If an account exists for that email, a password reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userModel
      .findOne({
        resetPasswordToken: dto.token,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password has been reset successfully' };
  }

  private issueToken(user: UserDocument): { accessToken: string } {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
