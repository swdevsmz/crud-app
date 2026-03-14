import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

function PlaceholderPage({ title }: { title: string }): JSX.Element {
  return <main className="p-6 text-slate-900">{title}</main>;
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<PlaceholderPage title="Signup page placeholder" />} />
        <Route path="/dashboard" element={<PlaceholderPage title="Dashboard placeholder" />} />
      </Routes>
    </BrowserRouter>
  );
}
