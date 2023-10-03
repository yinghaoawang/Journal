import Layout from '~/components/layouts/layout';
import MutatePostView from '~/components/post-views/mutate-post-view';

export default function NewJournalPage() {
  return (
    <Layout>
      <MutatePostView type="create" />
    </Layout>
  );
}
