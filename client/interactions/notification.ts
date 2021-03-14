import { Notification } from '../models';
import { log } from '../helpers/functions';

export default class NotificationService {
  forUser: string;
  constructor(forUser: string) {
    this.forUser = forUser;
  }

  like = async ({ fromUser, post }: { fromUser: string; post: string }) => {
    try {
      await Notification.create({
        variant: 'like',
        forUser: this.forUser,
        actionProviderType: 'user',
        actionProviderId: fromUser,
        relatedItemType: 'post',
        relatedItemId: post,
        message: '{actionProviderUser.firstName} liked your post',
      });
    } catch (err) {
      log('error', err.message);
    }
  };

  comment = async ({
    fromUser,
    post,
    comment,
  }: {
    fromUser: string;
    post: string;
    comment: string;
  }) => {
    try {
      await Notification.create({
        variant: 'comment',
        forUser: this.forUser,
        actionProviderType: 'user',
        actionProviderId: fromUser,
        relatedItemType: 'post',
        relatedItemId: post,
        message: `{actionProvider.firstName} commented on your post: ${comment}`,
      });
    } catch (err) {
      log('error', err.message);
    }
  };

  communityInvite = async ({
    fromUser,
    community,
  }: {
    fromUser: string;
    community: string;
  }) => {};
  connectionAccept = async ({ fromUser }: { fromUser: string }) => {};
  communityAccept = async ({ community }: { community: string }) => {};
  rootshare = async ({}: {}) => {};

  markAsSeen = async ({ _ids }: { _ids: string[] }) => {
    try {
      await Notification.markAsSeen({ _ids });
    } catch (err) {
      log('error', err);
    }
  };
}
