import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HrSidebar from '../../components/hr/HrSidebar.jsx';
import HrTopbar from '../../components/hr/HrTopbar.jsx';
import HrSummary from '../../components/hr/HrSummary.jsx';
import HrEmployees from '../../components/hr/HrEmployees.jsx';
import HrPayroll from '../../components/hr/HrPayroll.jsx';
import HrHiring from '../../components/hr/HrHiring.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { listEmployees } from '../../services/hrApi.js';
import { getBranches } from '../../services/catalogApi.js';
import { ROLES_RRHH } from '../../utils/rrhh.js';
import '../../styles/hr.css';

export default function HrPage() {
  const navigate = useNavigate();
  const { logout, register, user } = useAuth();
  const [seccion, setSeccion] = useState('resumen');
  const [empleados, setEmpleados] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const puedeContratar = user?.role === 'ADMINISTRATOR' || user?.role === 'HR';
  const rolesPermitidos =
    user?.role === 'ADMINISTRATOR'
      ? ROLES_RRHH
      : ROLES_RRHH.filter((rol) =>
          ['EMPLOYEE', 'MANAGER', 'HR', 'INVENTORY_MANAGER'].includes(rol.id)
        );

  useEffect(() => {
    let activo = true;

    setLoading(true);
    setError('');

    let empleadosCargados = false;
    let sucursalesCargadas = false;

    const finalizarCarga = () => {
      if (activo && empleadosCargados && sucursalesCargadas) {
        setLoading(false);
      }
    };

    listEmployees()
      .then((response) => {
        if (!activo) return;
        setEmpleados(response ?? []);
      })
      .catch((caughtError) => {
        if (activo) {
          setError(
            caughtError.message ?? 'No se pudo cargar la lista de empleados.'
          );
        }
      })
      .finally(() => {
        empleadosCargados = true;
        finalizarCarga();
      });

    getBranches()
      .then((response) => {
        if (!activo) return;
        const filas = Array.isArray(response) ? response : response?.data ?? [];
        setSucursales(filas);
      })
      .catch((caughtError) => {
        if (activo) {
          setError((actual) =>
            actual || caughtError.message || 'No se pudieron cargar las sucursales.'
          );
        }
      })
      .finally(() => {
        sucursalesCargadas = true;
        finalizarCarga();
      });

    return () => {
      activo = false;
    };
  }, []);

  const contratarEmpleado = async (datos) => {
    const empleadoCreado = await register(datos);
    const response = await listEmployees();

    setEmpleados(response ?? []);

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
        puedeContratar={puedeContratar}
      />

      <div className="hr-workspace">
        <HrTopbar seccion={seccion} />

        <main className="hr-main">
          {loading && (
            <div className="hr-payroll__empty" role="status">
              Cargando empleados...
            </div>
          )}

          {error && (
            <div className="hr-payroll__error" role="alert">
              <i className="bi bi-exclamation-circle" />
              {error}
            </div>
          )}

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
            {puedeContratar ? (
               <HrHiring
                 empleados={empleados}
                 sucursales={sucursales}
                 roles={rolesPermitidos}
                 onContratar={contratarEmpleado}
                 puedeContratar={puedeContratar}
               />
            ) : (
              <div className="hr-payroll__empty">
                La contratación requiere permisos de administrador.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
