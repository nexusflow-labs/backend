import { SetMetadata } from '@nestjs/common';
import { CheckOwnershipOptions } from '../interfaces/authorization.interfaces';
import { CHECK_OWNERSHIP_KEY } from '../constants/permissions.constants';

/**
 * Decorator to validate resource ownership.
 * OWNER and ADMIN roles bypass this check.
 * MEMBER must own the resource to proceed.
 *
 * @example
 * @CheckOwnership({ resourceType: ResourceType.PROJECT })
 * @Put(':id')
 * async update(@Param('id') id: string) {}
 *
 * @example
 * @CheckOwnership({ resourceType: ResourceType.COMMENT, resourceIdParam: 'commentId' })
 * @Delete(':commentId')
 * async delete(@Param('commentId') commentId: string) {}
 */
export const CheckOwnership = (options: CheckOwnershipOptions) =>
  SetMetadata(CHECK_OWNERSHIP_KEY, {
    resourceType: options.resourceType,
    resourceIdParam: options.resourceIdParam ?? 'id',
  });
