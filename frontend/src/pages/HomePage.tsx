import { useState } from 'react';
import { Feed } from '@/components/feed/Feed';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export function HomePage() {
  const [, setCommentItemId] = useState<string | null>(null);

  return (
    <div className="relative">
      <Header transparent showCategories />

      <Feed
        onCommentOpen={(itemId) => setCommentItemId(itemId)}
        onCreatorClick={(creatorId) => {
          // Navigate to creator profile
          console.log('Creator clicked:', creatorId);
        }}
      />

      <BottomNav />

      {/* Comments modal would go here */}
    </div>
  );
}
