import { createRoot } from 'react-dom/client';
import HomeComponent from './components/HomeComponent';

const root = createRoot(document.body);
root.render(
    <HomeComponent parameters={[]} />
);