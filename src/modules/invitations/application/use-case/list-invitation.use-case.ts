import { Injectable } from '@nestjs/common';
import { IInvitationRepository } from '../../domain/repositories/invitation.repository';
import { Invitation } from '../../domain/entities/invitation.entity';

@Injectable()
export class ListInvitationsUseCase {
  constructor(private readonly invitationRepository: IInvitationRepository) {}

  async execute(workspaceId: string): Promise<Invitation[]> {
    return this.invitationRepository.listByWorkspace(workspaceId);
  }
}
