import PublicCardClient from "./PublicCardClient";

interface PublicCardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicCardPage({ params }: PublicCardPageProps) {
  const { slug } = await params;
  return <PublicCardClient slug={slug} />;
}
