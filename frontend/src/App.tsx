/**
 * ARCHIVO: App.tsx
 * MISION: Componente raíz de LabChartQC Mini.
 * RESPONSABILIDAD: Orquestar el diseño principal y las rutas.
 */

function App() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header Temporal */}
      <nav className="bg-blue-700 p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🔬</span> LabChartQC Mini
          </h1>
          <span className="text-blue-100 text-sm italic">Modo: Desarrollo</span>
        </div>
      </nav>

      {/* Contenido Principal */}
      <section className="container mx-auto mt-8 p-6">
        <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-800">Panel de Control</h2>
          <p className="mt-2 text-slate-600">
            Bienvenido, Felipe. El esqueleto del Frontend está listo para recibir datos.
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <p className="text-sm text-green-700 font-medium">Estado Backend</p>
              <p className="text-2xl font-bold text-green-900">Conectado</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-700 font-medium">Analitos Activos</p>
              <p className="text-2xl font-bold text-blue-900">0</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-sm text-amber-700 font-medium">Alertas Westgard</p>
              <p className="text-2xl font-bold text-amber-900">0</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App