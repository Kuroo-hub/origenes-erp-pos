
import { useState } from 'react';
import HrSidebar from '../../components/hr/HrSidebar.jsx';
import HrTopbar from '../../components/hr/HrTopbar.jsx';
import HrSummary from '../../components/hr/HrSummary.jsx';
import HrEmployees from '../../components/hr/HrEmployees.jsx';
import HrPayroll from '../../components/hr/HrPayroll.jsx';
import { EMPLEADOS_INICIALES } from '../../mocks/HrMocks.js';
import '../../styles/hr.css';

export default function HrPage() {
  const [seccion, setSeccion] = useState('resumen');
  const [empleados] = useState(EMPLEADOS_INICIALES);

  return (
    <div className="hr-shell">
      <HrSidebar
        seccion={seccion}
        onSeleccionar={setSeccion}
      />

      <div className="hr-workspace">
        <HrTopbar seccion={seccion} />

        <main className="hr-main">
          <div hidden={seccion !== 'resumen'}>
            <HrSummary empleados={empleados} />
          </div>

          <div hidden={seccion !== 'empleados'}>
            <HrEmployees empleados={empleados} />
          </div>

          <div hidden={seccion !== 'planillas'}>
            <HrPayroll empleados={empleados} />
          </div>
        </main>
      </div>
    </div>
  );
}
