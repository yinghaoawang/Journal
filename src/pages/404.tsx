import Image from 'next/image';
import Layout from '~/components/layouts/layout';

export default function Custom404Page() {
  return (
    <Layout>
      <div className="flex flex-col items-center gap-2 py-8">
        <h2 className="mb-4 text-3xl font-bold">
          <span className="text-red-600">404.</span> This is an error.
        </h2>
        <Image
          className="mb-8"
          src="/robot-error.png"
          width={300}
          height={400}
          alt="Error robot"
        />
        <p>The page you are looking for can&apos;t be found</p>
        <p>Try checking your URL</p>
      </div>
    </Layout>
  );
}
