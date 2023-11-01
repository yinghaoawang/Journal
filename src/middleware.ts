import { authMiddleware, clerkClient } from '@clerk/nextjs';
import { redirectToSignIn } from '@clerk/nextjs/server';

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
  publicRoutes: ['/', '/feed', '/user/(.*)', '/explore'],
  afterAuth(auth, req) {
    const { userId } = auth;
    if (userId == null) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    void setUserDefaults(userId);
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
};
