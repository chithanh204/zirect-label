import { AdminSidebar } from '@/components/admin/sidebar';
import { AlbumDetailClient } from '@/components/admin/album-detail-client';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminAlbumDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 overflow-auto">
        <AlbumDetailClient albumId={id} />
      </main>
    </div>
  );
}
