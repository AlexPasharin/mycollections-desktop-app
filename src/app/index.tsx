import { createRoot } from 'react-dom/client';

import App from './app';

import api from '../api';

const artists = await api.getArtists();

const root = createRoot(document.body);
root.render(<App artists={artists} />);
