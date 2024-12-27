import { SpacePage } from '@/components/pages/space';

const Page = async ({ params }: { params: Promise<{ space_id: string }> }) => {
  const { space_id } = await params;

  return <SpacePage spaceId={space_id} />;
};

export default Page;
