import { AdminSidebar } from '@/components/admin/sidebar';
import { AlbumDetailClient } from '@/components/admin/album-detail-client';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminAlbumDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex h-screen art-bg-admin">
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
      <AdminSidebar />
      <main className="flex-1 md:ml-64 overflow-auto relative z-10">
        <AlbumDetailClient albumId={id} />
      </main>
    </div>
  );
}
