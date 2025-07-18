
import React from 'react';

export const Instructions: React.FC = () => {
  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md text-slate-700">
      <h3 className="text-md font-semibold text-slate-800 mb-2">Propósito del Formulario:</h3>
      <p className="text-sm mb-4">
        Este formulario busca documentar de forma completa cada aspecto del servicio para tener una base sólida y detallada que permita demostrar, en caso de repetición, la intencionalidad del coordinador de asignar servicios que evidentemente resultarán en un exceso de jornada laboral, poniendo en riesgo la seguridad del trabajador y afectando negativamente su vida personal.
      </p>
      <h3 className="text-md font-semibold text-slate-800">Instrucciones de Uso:</h3>
      <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
        <li>
            Rellenar este formulario cada vez que se te asigne un servicio en los últimos minutos de tu jornada laboral sabiendo que excederá la jornada por la distancia y complejidad del servicio.
        </li>
        <li>
            Documenta el tiempo estimado y real de cada etapa del servicio: desde el origen hasta la base, incluyendo el tiempo estimado para cada parte (desplazamiento, espera, dificultad del servicio). Esto incluye los posibles retrasos debidos a tráfico o complicaciones imprevistas.
        </li>
        <li>
            Guarda una copia del formulario para tu propio registro, especialmente si el servicio ha tenido un impacto negativo en tu vida personal o ha generado riesgos adicionales (como correr en la carretera o llegar tarde a tus responsabilidades fuera del trabajo).
        </li>
        <li>
            Si este comportamiento se repite, este formulario te servirá como base para notificar el incidente a Inspección de Trabajo y para tomar medidas legales si se considera necesario.
        </li>
      </ol>
    </div>
  );
};
