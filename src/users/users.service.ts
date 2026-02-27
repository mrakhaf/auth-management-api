import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { PaginationQueryDto } from './dto/pagination-query.dto'

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

  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = paginationQuery
    const skip = (page - 1) * limit
    const take = limit

    // Build where clause for search and soft delete filter
    const where = search
      ? {
          AND: [
            {
              deleted_at: null,
            },
            {
              OR: [
                {
                  fullname: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            },
          ],
        }
      : {
          deleted_at: null,
        }

    // Get users with pagination
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          fullname: true,
          phone_number: true,
          position: true,
          photo_url: true,
          created_at: true,
          updated_at: true,
          password: false,
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      data: users,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullname: true,
        phone_number: true,
        position: true,
        photo_url: true,
        created_at: true,
        updated_at: true,
        password: false,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async delete(id: string, userId: string) {
    // Check if user exists and is not already deleted
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found or already deleted')
    }

    // Check if the requesting user is HRD or is deleting their own account
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!requestingUser) {
      throw new NotFoundException('Requesting user not found')
    }

    const isHrd = requestingUser.position?.toLowerCase() === 'hrd'
    const isDeletingOwnAccount = id === userId

    if (!isHrd && !isDeletingOwnAccount) {
      throw new ForbiddenException('Only HRD can delete other users\' accounts')
    }

    // Perform soft delete
    await this.prisma.user.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    })

    return { message: 'User deleted successfully' }
  }
}
