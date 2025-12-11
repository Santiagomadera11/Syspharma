import { useState, useEffect } from "react";
import { Plus, ShoppingCart, Calendar as CalendarIcon } from "lucide-react";
import { Modal } from "../ui/modal";
import { Table } from "../ui/table";
import { ButtonPastel } from "../ui/button-pastel";
import { toast } from "sonner";

type Compra = {
  id: string;
  fecha: string;
  proveedor: string;
  productos: { id: string; nombre: string; cantidad: number; precio: number }[];
  total: number;
};

export function ComprasView() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompras();
  }, []);

  const loadCompras = () => {
    setLoading(true);
    setTimeout(() => {
      const saved = JSON.parse(
        localStorage.getItem("syspharma_compras") || "[]"
      );
      setCompras(saved);
      setLoading(false);
    }, 500);
  };

  const columns = [
    {
      key: "fecha",
      label: "Fecha",
      render: (c: Compra) => new Date(c.fecha).toLocaleDateString(),
    },
    { key: "proveedor", label: "Proveedor" },
    {
      key: "productos",
      label: "Productos",
      render: (c: Compra) => `${c.productos.length} producto(s)`,
    },
    {
      key: "total",
      label: "Total",
      render: (c: Compra) => `$${c.total.toFixed(2)}`,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 style={{ color: "#374151" }}>Historial de Compras</h3>
          <p style={{ color: "#9CA3AF" }}>Registro de compras a proveedores</p>
        </div>
        <ButtonPastel
          variant="green"
          onClick={() => toast.info("Módulo en desarrollo")}
        >
          <Plus style={{ width: "20px", height: "20px" }} />
          Nueva Compra
        </ButtonPastel>
      </div>

      <Table columns={columns} data={compras} loading={loading} />
    </div>
  );
}
