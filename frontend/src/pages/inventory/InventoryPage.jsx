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
import { INITIAL_INVENTORY_MOCK, INITIAL_PURCHASES_MOCK, INITIAL_MOVEMENTS_MOCK } from '../../mocks/InventoryMocks';
import '../../styles/inventory.css';

const InventoryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stock');
  const [selectedBranch, setSelectedBranch] = useState(1);

  const [inventory, setInventory] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingOfflineData, setUsingOfflineData] = useState(false);

  const loadBranchData = useCallback(async (branchId) => {
    setLoading(true);
    try {
      const [invRes, purRes, movRes] = await Promise.all([
        getBranchInventory(branchId),
        getBranchPurchases(branchId),
        getInventoryMovements(branchId),
      ]);

      setInventory(Array.isArray(invRes) ? invRes : invRes.data || []);
      setPurchases(Array.isArray(purRes) ? purRes : purRes.data || []);
      setMovements(Array.isArray(movRes) ? movRes : movRes.data || []);
      setUsingOfflineData(false);
    } catch {
      // Fallback automático con los datos reales de data.sql si el backend aún no está levantado
      setInventory(INITIAL_INVENTORY_MOCK.filter((item) => item.branch_id === branchId));
      setPurchases(INITIAL_PURCHASES_MOCK.filter((item) => item.branch_id === branchId));
      setMovements(INITIAL_MOVEMENTS_MOCK.filter((item) => item.branch_id === branchId));
      setUsingOfflineData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranchData(selectedBranch);
  }, [selectedBranch, loadBranchData]);

  // Contador global de alertas de stock mínimo para mostrar en el badge del Sidebar
  const lowStockCount = inventory.filter(
    (item) => Number(item.quantity) <= Number(item.minimum_stock)
  ).length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="inv-layout">
      <InventorySidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        alertCount={lowStockCount}
        onLogout={handleLogout}
      />

      <div className="inv-main">
        <InventoryTopbar
          activeTab={activeTab}
          selectedBranch={selectedBranch}
          onChangeBranch={setSelectedBranch}
        />

        {usingOfflineData && (
          <div className="inv-banner-offline">
            Modo demostración local activo (usando datos semilla de PostgreSQL). Cuando el API Gateway responda en el puerto 3000, se sincronizará automáticamente.
          </div>
        )}

        <main className="inv-content">
          {loading ? (
            <div className="inv-loading">Cargando información de la sucursal...</div>
          ) : (
            <>
              {activeTab === 'stock' && (
                <InventoryStock
                  branchId={selectedBranch}
                  inventory={inventory}
                  setInventory={setInventory}
                  onRefresh={() => loadBranchData(selectedBranch)}
                />
              )}

              {activeTab === 'purchases' && (
                <InventoryPurchases
                  branchId={selectedBranch}
                  inventory={inventory}
                  purchases={purchases}
                  setPurchases={setPurchases}
                  setInventory={setInventory}
                  onRefresh={() => loadBranchData(selectedBranch)}
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