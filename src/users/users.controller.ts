import { Body, Controller, Put, Param, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { Req } from '@nestjs/common'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, req.user.id, updateUserDto)
  }
}