import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HrSidebar from '../../components/hr/HrSidebar.jsx';
import HrTopbar from '../../components/hr/HrTopbar.jsx';
import HrSummary from '../../components/hr/HrSummary.jsx';
import HrEmployees from '../../components/hr/HrEmployees.jsx';
import HrPayroll from '../../components/hr/HrPayroll.jsx';
import HrHiring from '../../components/hr/HrHiring.jsx';
import { EMPLEADOS_INICIALES, SUCURSALES_RRHH } from '../../mocks/HrMocks.js';
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/hr.css';

export default function HrPage() {
  const navigate = useNavigate();
  const { logout, register } = useAuth();
  const [seccion, setSeccion] = useState('resumen');
  const [empleados, setEmpleados] = useState(EMPLEADOS_INICIALES);

  const contratarEmpleado = async (datos) => {
    const empleadoCreado = await register(datos);
    const sucursal = SUCURSALES_RRHH.find((item) => item.id === datos.branchId);

    setEmpleados((actuales) => [
      {
        ...datos,
        ...empleadoCreado,
        branchName: sucursal?.nombre ?? 'Centro Histórico',
      },
      ...actuales,
    ]);

    return {
      usuario: empleadoCreado.fullName ?? datos.fullName,
      username: empleadoCreado.email ?? datos.email,
    };
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="hr-shell">
      <HrSidebar
        seccion={seccion}
        onSeleccionar={setSeccion}
        onLogout={handleLogout}
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

          <div hidden={seccion !== 'contratacion'}>
            <HrHiring
              empleados={empleados}
              onContratar={contratarEmpleado}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
