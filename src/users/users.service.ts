import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, userId: string, updateUserDto: UpdateUserDto) {
    // Check if user is updating their own data
    if (id !== userId) {
      throw new ForbiddenException('You can only update your own data')
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    })

    // Remove password from response
    const { password: _, ...result } = updatedUser
    return result
  }
}