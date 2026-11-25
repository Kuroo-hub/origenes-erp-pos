
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HrSidebar from '../../components/hr/HrSidebar.jsx';
import HrTopbar from '../../components/hr/HrTopbar.jsx';
import HrSummary from '../../components/hr/HrSummary.jsx';
import HrEmployees from '../../components/hr/HrEmployees.jsx';
import HrPayroll from '../../components/hr/HrPayroll.jsx';
import HrHiring from '../../components/hr/HrHiring.jsx';
import {
  EMPLEADOS_INICIALES,
  SUCURSALES_RRHH,
} from '../../mocks/HrMocks.js';
import '../../styles/hr.css';

const generarUsuario = (email, nombre) => {
  const desdeCorreo = email
    .split('@')[0]
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

  return (
    desdeCorreo ||
    nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.|\.$/g, '')
  );
};

const generarContrasena = () =>
  `origenes-${Math.random().toString(36).slice(2, 8)}`;

export default function HrPage() {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState('resumen');
  const [empleados, setEmpleados] = useState(EMPLEADOS_INICIALES);

  const contratarEmpleado = (datos) => {
    const employeeId = Math.max(0, ...empleados.map((item) => item.employeeId)) + 1;
    const sucursal = SUCURSALES_RRHH.find(
      (item) => item.id === datos.branchId
    );
    const username = generarUsuario(datos.email, datos.fullName);
    const temporaryPassword = generarContrasena();

    setEmpleados((actuales) => [
      {
        ...datos,
        employeeId,
        userId: 200 + employeeId,
        branchName: sucursal?.nombre ?? 'Centro Histórico',
        hireDate: new Date().toISOString().slice(0, 10),
        active: true,
        username,
        temporaryPassword,
      },
      ...actuales,
    ]);

    return {
      usuario: datos.fullName,
      username,
      temporaryPassword,
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
