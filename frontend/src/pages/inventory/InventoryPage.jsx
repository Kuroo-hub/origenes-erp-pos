import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import InventorySidebar from '../../components/inventory/InventorySidebar';
import InventoryTopbar from '../../components/inventory/InventoryTopbar';
import InventoryStock from '../../components/inventory/InventoryStock';
import InventoryPurchases from '../../components/inventory/InventoryPurchases';
import InventoryMovements from '../../components/inventory/InventoryMovements';
import {
  getBranchInventory,
  getBranchPurchases,
  getInventoryMovements,
} from '../../services/inventoryApi';
import { useOrders } from '../../context/OrderContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/inventory.css';

const extraerLista = (respuesta) =>
  Array.isArray(respuesta) ? respuesta : respuesta?.data ?? [];

const SUCURSALES_OFICIALES = [
  { id: 1, branch_id: 1, name: 'San Salvador' },
  { id: 2, branch_id: 2, name: 'Santa Ana' },
  { id: 3, branch_id: 3, name: 'San Miguel' },
];

const InventoryPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { sucursalId, seleccionarSucursal, sucursales = [], versionStock } = useOrders();
  const [activeTab, setActiveTab] = useState('stock');
  const [localBranchId, setLocalBranchId] = useState(null);

  const listaSucursales =
    Array.isArray(sucursales) && sucursales.length > 0
      ? sucursales
      : SUCURSALES_OFICIALES;

  const branchActual = Number(
    localBranchId ??
      sucursalId ??
      listaSucursales[0]?.branch_id ??
      listaSucursales[0]?.id ??
      1
  );

  const handleChangeBranch = (nuevoId) => {
    const idNumerico = Number(nuevoId);
    setLocalBranchId(idNumerico);
    if (typeof seleccionarSucursal === 'function') {
      seleccionarSucursal(idNumerico);
    }
  };

  const [inventory, setInventory] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBranchData = useCallback(async (branchId) => {
    if (!branchId) return;

    setLoading(true);
    setError(null);

    try {
      const [invRes, purRes, movRes] = await Promise.all([
        getBranchInventory(branchId),
        getBranchPurchases(branchId),
        getInventoryMovements(branchId),
      ]);

      setInventory(extraerLista(invRes));
      setPurchases(extraerLista(purRes));
      setMovements(extraerLista(movRes));
    } catch (err) {
      setError(err?.message ?? 'No se pudo cargar la información de la sucursal.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranchData(branchActual);
  }, [branchActual, loadBranchData, versionStock]);

  const lowStockCount = inventory.filter(
    (item) => Number(item.quantity) <= Number(item.minimum_stock)
  ).length;

  const handleLogout = async () => {
    if (typeof logout === 'function') {
      await logout();
    }
    navigate('/login');
  };

  return (
    <div className="inv-layout">
      <InventorySidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        alertCount={lowStockCount}
        isOffline={Boolean(error)}
        onLogout={handleLogout}
      />

      <div className="inv-main">
        <InventoryTopbar
          activeTab={activeTab}
          selectedBranch={branchActual}
          onChangeBranch={handleChangeBranch}
          branches={listaSucursales}
        />

        {error && (
          <div className="inv-banner-offline">
            {error}
          </div>
        )}

        <main className="inv-content">
          {loading ? (
            <div className="inv-loading">Cargando información de la sucursal...</div>
          ) : (
            <>
              {activeTab === 'stock' && (
                <InventoryStock
                  branchId={branchActual}
                  inventory={inventory}
                  setInventory={setInventory}
                  onRefresh={() => loadBranchData(branchActual)}
                />
              )}

              {activeTab === 'purchases' && (
                <InventoryPurchases
                  branchId={branchActual}
                  inventory={inventory}
                  purchases={purchases}
                  setPurchases={setPurchases}
                  setInventory={setInventory}
                  onRefresh={() => loadBranchData(branchActual)}
                />
              )}

              {activeTab === 'movements' && (
                <InventoryMovements movements={movements} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default InventoryPage;