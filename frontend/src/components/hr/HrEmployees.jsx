
import { useMemo, useState } from 'react';
import HrEmployeeDetail from './HrEmployeeDetail.jsx';
import {
  SUCURSALES_RRHH,
  etiquetaRolRRHH,
} from '../../mocks/HrMocks.js';

export default function HrEmployees({ empleados = [] }) {
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('todos');
  const [sucursal, setSucursal] = useState('todas');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  const sucursales = SUCURSALES_RRHH.map((item) => [item.id, item.nombre]);

  const empleadosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return empleados.filter((empleado) => {
      const coincideBusqueda =
        (empleado.fullName ?? '').toLowerCase().includes(termino) ||
        (empleado.email ?? '').toLowerCase().includes(termino) ||
        etiquetaRolRRHH(empleado.role).toLowerCase().includes(termino);

      const coincideEstado =
        estado === 'todos' ||
        (estado === 'activos' && empleado.active) ||
        (estado === 'inactivos' && !empleado.active);

      const coincideSucursal =
        sucursal === 'todas' ||
        String(empleado.branchId) === sucursal;

      return coincideBusqueda && coincideEstado && coincideSucursal;
    });
  }, [empleados, busqueda, estado, sucursal]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setEstado('todos');
    setSucursal('todas');
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(value) || 0);

  const formatDate = (value) =>
    new Date(`${value}T00:00:00`).toLocaleDateString('es-SV', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <section className="hr-employees">
      <div className="hr-section-header">
        <div>
          <h1>Empleados</h1>
          <p>Consulta el personal registrado en Orígenes SV.</p>
        </div>

        <div className="hr-employees__total">
          <strong>{empleados.length}</strong>
          <span>Empleados registrados</span>
        </div>
      </div>

      <section className="hr-employees__panel">
        <div className="hr-employees__toolbar">
          <div className="hr-employees__search">
            <i className="bi bi-search" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por nombre, correo o cargo..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              aria-label="Buscar empleados"
            />
          </div>

          <select
            value={estado}
            onChange={(event) => setEstado(event.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>

          <select
            value={sucursal}
            onChange={(event) => setSucursal(event.target.value)}
            aria-label="Filtrar por sucursal"
          >
            <option value="todas">Todas las sucursales</option>
            {sucursales.map(([id, nombre]) => (
              <option key={id} value={String(id)}>
                {nombre}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="hr-employees__clear"
            onClick={limpiarFiltros}
          >
            <i className="bi bi-arrow-counterclockwise" />
            Limpiar
          </button>
        </div>

        <div className="hr-employees__results">
          Mostrando <strong>{empleadosFiltrados.length}</strong> de{' '}
          <strong>{empleados.length}</strong> empleados
        </div>

        <div className="hr-employees__table-wrapper">
          <table className="hr-employees__table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Cargo</th>
                <th>Cuenta</th>
                <th>Sucursal</th>
                <th>Fecha de ingreso</th>
                <th>Salario mensual</th>
                <th>Estado</th>
                <th>Detalle</th>
              </tr>
            </thead>

            <tbody>
              {empleadosFiltrados.length > 0 ? (
                empleadosFiltrados.map((empleado) => (
                  <tr key={empleado.employeeId}>
                    <td>
                      <div className="hr-employee-cell">
                        <strong>{empleado.fullName}</strong>
                        <small>{empleado.email}</small>
                      </div>
                    </td>

                    <td>{etiquetaRolRRHH(empleado.role)}</td>
                    <td>
                      <div className="hr-employee-cell">
                        <strong>{empleado.username ?? '—'}</strong>
                        <small>{etiquetaRolRRHH(empleado.role)}</small>
                      </div>
                    </td>
                    <td>{empleado.branchName}</td>
                    <td>{formatDate(empleado.hireDate)}</td>
                    <td>{formatCurrency(empleado.baseSalary)}</td>

                    <td>
                      <span
                        className={`hr-status ${
                          empleado.active
                            ? 'hr-status--active'
                            : 'hr-status--inactive'
                        }`}
                      >
                        {empleado.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td>
                      <button
  type="button"
  className="cashier-orders__detail-button"
  onClick={() => setEmpleadoSeleccionado(empleado)}
  aria-label={`Ver detalle de ${empleado.fullName}`}
>
  Ver detalle
</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="hr-employees__empty">
                    <i className="bi bi-search" />
                    <strong>No se encontraron empleados</strong>
                    <span>Prueba modificando los filtros de búsqueda.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {empleadoSeleccionado && (
        <HrEmployeeDetail
          empleado={empleadoSeleccionado}
          onCerrar={() => setEmpleadoSeleccionado(null)}
        />
      )}
    </section>
  );
}
