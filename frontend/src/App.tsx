/**
 * ARCHIVO: App.tsx
 * MISION: Componente raíz de LabChartQC Mini.
 * RESPONSABILIDAD: Orquestar el diseño principal y las rutas con soporte de autenticación y protección.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorAutenticacion } from './context/ContextoAutenticacion';
import { RutaProtegida } from './components/RutaProtegida';
import { IniciarSesion } from './pages/IniciarSesion';
import { PanelPrincipal } from './pages/PanelPrincipal';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';

// Error Fallback para la aplicación entera
const ComponenteErrorFallido = ({ error, resetErrorBoundary }: any) => (
  <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center text-white p-6">
    <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-red-500/30 text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-red-400">Oops, algo salió mal</h2>
      <p className="text-sm text-slate-400 break-words">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="mt-6 w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold transition-colors"
      >
        Reintentar e ir al Inicio
      </button>
    </div>
  </div>
);

// Instancia global de React Query
const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary FallbackComponent={ComponenteErrorFallido} onReset={() => window.location.href = '/'}>
      <QueryClientProvider client={clienteConsultas}>
        <ProveedorAutenticacion>
          <BrowserRouter>
            <Toaster theme="dark" position="bottom-right" richColors />
            <Routes>
          {/* Ruta Pública: Iniciar Sesión */}
          <Route path="/iniciar-sesion" element={<IniciarSesion />} />

          {/* Ruta Protegida: Panel Principal */}
          <Route
            path="/panel-principal"
            element={
              <RutaProtegida>
                <PanelPrincipal />
              </RutaProtegida>
            }
          />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/panel-principal" replace />} />
            </Routes>
          </BrowserRouter>
        </ProveedorAutenticacion>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;