import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import * as argon2 from 'argon2'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, fullname, phone_number, position, photo_url } = registerDto

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new BadRequestException('Email already exists')
    }

    // Hash password
    const hashedPassword = await argon2.hash(password)

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullname,
        phone_number,
        position,
        photo_url,
      },
    })

    // Remove password from response
    const { password: _, ...result } = user
    return result
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    // Find user by email (only non-deleted users)
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deleted_at: null,
      },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Generate JWT with complete user data in payload
    const { password: _, ...userWithoutPassword } = user
    const payload = userWithoutPassword
    const accessToken = this.jwtService.sign(payload)

    return {
      access_token: accessToken,
      user: userWithoutPassword,
    }
  }

  async checkToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    // Remove password from response
    const { password: _, ...result } = user
    return {
      valid: true,
      user: result,
    }
  }
}