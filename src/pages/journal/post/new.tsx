import Layout from '~/components/layout';
import MutatePostView from '~/components/mutate-post-view';

export default function JournalPage() {
  return (
    <Layout>
      <MutatePostView type="create" />
    </Layout>
  );
}
