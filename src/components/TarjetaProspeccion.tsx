"use client";
import { useProspeccion } from '../hooks/useProspeccion';

export const TarjetaProspeccion = ({ tallerId }: { tallerId: string }) => {
  const { currentNode, tree, handleResponse, errorLog } = useProspeccion(tallerId);

  if (errorLog) {
    return (
      <div className="p-8 bg-red-950 border border-red-500 rounded-xl shadow-2xl max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white mb-2">Error de Conexión 🚨</h2>
        <p className="text-red-200 font-mono text-sm">{errorLog}</p>
      </div>
    );
  }

  if (!currentNode) return <div className="text-white p-4">Cargando guion...</div>;

  return (
    <div className="p-8 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl max-w-md mx-auto">
      <h2 className="text-2xl font-medium text-white">{currentNode.texto}</h2>
      <div className="mt-8 flex flex-col gap-3">
        {tree.rutas
          .filter((r: any) => r.id_origen === currentNode.id_nodo)
          .map((ruta: any) => (
            <button 
              key={ruta.id_destino}
              onClick={() => handleResponse(ruta)}
              className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-all active:scale-95"
            >
              {ruta.texto_boton}
            </button>
        ))}
      </div>
    </div>
  );
};
