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
  publicRoutes: ['/'],
  afterAuth(auth, req) {
    const { userId, isPublicRoute } = auth;
    if (userId != null) {
      void setUserDefaults(userId);
    }

    if (!isPublicRoute && userId == null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
};
