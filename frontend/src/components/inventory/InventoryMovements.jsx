import React, { useState } from 'react';

const MOVEMENT_META = {
  IN: { label: 'Entrada / Compra', badge: 'success', sign: '+' },
  CONSUMPTION: { label: 'Consumo por Venta', badge: 'blue', sign: '-' },
  OUT: { label: 'Salida Operativa', badge: 'warning', sign: '-' },
  ADJUSTMENT: { label: 'Ajuste / Merma', badge: 'danger', sign: '-' },
};

const InventoryMovements = ({ movements }) => {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovements = movements.filter((mov) => {
    const matchesType = typeFilter === 'ALL' || mov.movement_type === typeFilter;
    const matchesText =
      mov.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mov.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesText;
  });

  return (
    <section className="inv-section">
      <div className="inv-toolbar">
        <div className="inv-toolbar__search">
          <input
            type="text"
            className="inv-input"
            placeholder="Buscar por insumo o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="inv-toolbar__filters">
          <select
            className="inv-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filtrar por tipo de movimiento"
          >
            <option value="ALL">Todos los movimientos</option>
            <option value="IN">Entradas / Compras (IN)</option>
            <option value="CONSUMPTION">Consumo por Recetas (CONSUMPTION)</option>
            <option value="ADJUSTMENT">Ajustes / Mermas (ADJUSTMENT)</option>
            <option value="OUT">Salidas Manuales (OUT)</option>
          </select>
        </div>
      </div>

      <div className="inv-table-wrapper">
        <table className="inv-table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Insumo</th>
              <th>Tipo de Movimiento</th>
              <th>Cantidad</th>
              <th>Motivo / Referencia</th>
              <th>Responsable</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.length === 0 ? (
              <tr>
                <td colSpan="6" className="inv-table__empty">
                  No hay movimientos registrados con los criterios seleccionados.
                </td>
              </tr>
            ) : (
              filteredMovements.map((mov) => {
                const meta = MOVEMENT_META[mov.movement_type] || {
                  label: mov.movement_type,
                  badge: 'blue',
                  sign: '',
                };

                return (
                  <tr key={mov.movement_id}>
                    <td>{mov.created_at}</td>
                    <td className="inv-table__name">{mov.ingredient_name}</td>
                    <td>
                      <span className={`inv-status inv-status--${meta.badge}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="inv-table__num">
                      <strong>
                        {meta.sign}
                        {Number(mov.quantity).toLocaleString('es-SV')}
                      </strong>{' '}
                      {mov.unit}
                    </td>
                    <td>{mov.reason}</td>
                    <td>{mov.user_email || 'inventario@origenessv.com'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default InventoryMovements;