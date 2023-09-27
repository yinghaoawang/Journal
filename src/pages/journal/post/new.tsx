import ContentWrapper from '~/components/content-wrapper';
import MutatePostView from '~/components/mutate-post-view';

export default function JournalPage() {
  return (
    <ContentWrapper>
      <MutatePostView type="create" />
    </ContentWrapper>
  );
}
