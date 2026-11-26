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

const InventoryPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { sucursalId, seleccionarSucursal, sucursales, versionStock } = useOrders();
  const [activeTab, setActiveTab] = useState('stock');

  const [inventory, setInventory] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBranchData = useCallback(async (branchId) => {
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
    loadBranchData(sucursalId);
  }, [sucursalId, loadBranchData, versionStock]);

  const lowStockCount = inventory.filter(
    (item) => Number(item.quantity) <= Number(item.minimum_stock)
  ).length;

  const handleLogout = () => {
    logout();
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
          selectedBranch={sucursalId}
          onChangeBranch={seleccionarSucursal}
          branches={sucursales}
        />

        {error && <div className="inv-banner-offline">{error}</div>}

        <main className="inv-content">
          {loading ? (
            <div className="inv-loading">Cargando información de la sucursal...</div>
          ) : (
            <>
              {activeTab === 'stock' && (
                <InventoryStock
                  branchId={sucursalId}
                  inventory={inventory}
                  setInventory={setInventory}
                  onRefresh={() => loadBranchData(sucursalId)}
                />
              )}

              {activeTab === 'purchases' && (
                <InventoryPurchases
                  branchId={sucursalId}
                  inventory={inventory}
                  purchases={purchases}
                  setPurchases={setPurchases}
                  setInventory={setInventory}
                  onRefresh={() => loadBranchData(sucursalId)}
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
