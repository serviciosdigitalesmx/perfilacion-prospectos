import { useState, useEffect } from 'react';
const PROD_URL = "https://script.google.com/macros/s/AKfycbwC7u_-4-d2x8TJJ8-KLSB45Cv2bvjYbIvPSpwqTqWVsph0z5D7qECVjJKL3F6iUwHG/exec";
const AUTH_TOKEN = "f1x1_2026_secreto";

export const useProspeccion = (tallerId: string) => {
  const [tree, setTree] = useState({ nodos: [], rutas: [] });
  const [currentNode, setCurrentNode] = useState(null);
  const [callSummary, setCallSummary] = useState({ taller_id: tallerId, resultado: '', objecion_principal: '', interes: 0, accion: '' });

  useEffect(() => {
    fetch(`${PROD_URL}?action=getTree&token=${AUTH_TOKEN}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTree(data.data);
          setCurrentNode(data.data.nodos.find((n: any) => n.id_nodo === 'saludo'));
        }
      });
  }, []);

  const handleResponse = (rutaSeleccionada: any) => {
    if (rutaSeleccionada.payload_json) setCallSummary(prev => ({ ...prev, ...JSON.parse(rutaSeleccionada.payload_json) }));
    const nextNode = tree.nodos.find((n: any) => n.id_nodo === rutaSeleccionada.id_destino);
    if (nextNode) setCurrentNode(nextNode);
  };

  return { currentNode, tree, handleResponse };
};
