import { Request } from 'express';
import { Users } from '../../users/users.entity';

export interface RequestWithUser extends Request {
  user: Users & { role?: string }; 
}