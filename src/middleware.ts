import { authMiddleware, clerkClient } from '@clerk/nextjs';

const setUserDefaults = async (userId: string) => {
  const user = await clerkClient.users.getUser(userId);
  if (user?.publicMetadata?.isPublic === undefined) {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        isPublic: true
      }
    });
  }
};

export default authMiddleware({
  publicRoutes: ['/(.*)'],
  afterAuth(auth) {
    const { userId } = auth;
    if (userId == null) return;
    void setUserDefaults(userId);
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
};
