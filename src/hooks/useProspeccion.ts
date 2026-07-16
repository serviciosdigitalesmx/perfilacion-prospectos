"use client";
import { useState, useEffect } from 'react';

const PROD_URL = "https://script.google.com/macros/s/AKfycbwC7u_-4-d2x8TJJ8-KLSB45Cv2bvjYbIvPSpwqTqWVsph0z5D7qECVjJKL3F6iUwHG/exec";
const AUTH_TOKEN = "f1x1_2026_secreto";

export const useProspeccion = (tallerId: string) => {
  const [tree, setTree] = useState({ nodos: [], rutas: [] });
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [callSummary, setCallSummary] = useState({ taller_id: tallerId, resultado: '', objecion_principal: '', interes: 0, accion: '' });
  const [errorLog, setErrorLog] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${PROD_URL}?action=getTree&token=${AUTH_TOKEN}`)
      .then(async (res) => {
        const text = await res.text();
        try {
          return { ok: res.ok, data: JSON.parse(text) };
        } catch (err) {
          throw new Error(`Google no regresó JSON. Regresó: ${text.substring(0, 50)}...`);
        }
      })
      .then(({ ok, data }) => {
        if (!ok) throw new Error(`Error HTTP. Detalle: ${JSON.stringify(data)}`);
        if (!data.success) throw new Error(`La API falló internamente: ${JSON.stringify(data)}`);
        
        setTree(data.data);
        const nodoInicial = data.data.nodos.find((n: any) => String(n.id_nodo).trim().toLowerCase() === 'saludo');
        
        if (nodoInicial) {
          setCurrentNode(nodoInicial);
        } else {
          setErrorLog("El JSON llegó bien, pero en tu Google Sheet no hay ningún id_nodo que se llame 'saludo'.");
        }
      })
      .catch(err => {
        setErrorLog(err.message);
      });
  }, []);

  const handleResponse = (rutaSeleccionada: any) => {
    if (rutaSeleccionada.payload_json) setCallSummary(prev => ({ ...prev, ...JSON.parse(rutaSeleccionada.payload_json) }));
    const nextNode = tree.nodos.find((n: any) => n.id_nodo === rutaSeleccionada.id_destino);
    if (nextNode) setCurrentNode(nextNode);
  };

  return { currentNode, tree, handleResponse, errorLog };
};
