import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { WalletPage } from '@/pages/WalletPage';
import { ProfilePage } from '@/pages/ProfilePage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/create" element={<CreatePlaceholder />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/watch/:id" element={<WatchPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
}

// Placeholder pages
function CreatePlaceholder() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-xl mb-2">Create Content</p>
        <p className="text-dark-400">Coming soon...</p>
      </div>
    </div>
  );
}

function WatchPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-xl mb-2">Watch Page</p>
        <p className="text-dark-400">Video player will be here</p>
      </div>
    </div>
  );
}

function CategoryPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-xl mb-2">Category</p>
        <p className="text-dark-400">Category content will be here</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-6xl font-bold mb-4">404</p>
        <p className="text-dark-400">Page not found</p>
      </div>
    </div>
  );
}

export default App;
