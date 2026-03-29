import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SearchPage } from './pages/SearchPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true,          Component: HomePage     },
      { path: 'discover',     Component: DiscoverPage },
      { path: 'favorites',    Component: FavoritesPage },
      { path: 'search',       Component: SearchPage   },
    ],
  },
]);
