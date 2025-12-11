import { useState, useEffect } from "react";
import { Plus, Building, Mail, Phone, FileText } from "lucide-react";
import { Modal } from "../ui/modal";
import { Table } from "../ui/table";
import { InputWithValidation } from "../ui/input-with-validation";
import { ButtonPastel } from "../ui/button-pastel";
import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateNIT,
} from "../../utils/validation";
import { toast } from "sonner";

type Proveedor = {
  id: string;
  nombre: string;
  nit: string;
  email: string;
  telefono: string;
  direccion?: string;
};

export function ProveedoresView() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(
    null
  );
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    email: "",
    telefono: "",
    direccion: "",
  });
  const [touched, setTouched] = useState({
    nombre: false,
    nit: false,
    email: false,
    telefono: false,
  });

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = () => {
    setLoading(true);
    setTimeout(() => {
      const saved = JSON.parse(
        localStorage.getItem("syspharma_proveedores") || "[]"
      );
      setProveedores(saved);
      setLoading(false);
    }, 500);
  };

  const errors = {
    nombre:
      touched.nombre && !validateRequired(formData.nombre)
        ? "Este campo es obligatorio"
        : "",
    nit:
      touched.nit && !validateRequired(formData.nit)
        ? "Este campo es obligatorio"
        : touched.nit && !validateNIT(formData.nit)
        ? "NIT inválido (9-10 dígitos)"
        : "",
    email:
      touched.email && !validateRequired(formData.email)
        ? "Este campo es obligatorio"
        : touched.email && !validateEmail(formData.email)
        ? "Email inválido"
        : "",
    telefono:
      touched.telefono && !validateRequired(formData.telefono)
        ? "Este campo es obligatorio"
        : touched.telefono && !validatePhone(formData.telefono)
        ? "Debe tener 10 dígitos"
        : "",
  };

  const isValid =
    validateRequired(formData.nombre) &&
    validateNIT(formData.nit) &&
    validateEmail(formData.email) &&
    validatePhone(formData.telefono);

  const handleOpenModal = (proveedor?: Proveedor) => {
    if (proveedor) {
      setEditingProveedor(proveedor);
      setFormData(proveedor);
    } else {
      setEditingProveedor(null);
      setFormData({
        nombre: "",
        nit: "",
        email: "",
        telefono: "",
        direccion: "",
      });
    }
    setTouched({
      nombre: false,
      nit: false,
      email: false,
      telefono: false,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      nombre: true,
      nit: true,
      email: true,
      telefono: true,
    });

    if (!isValid) {
      toast.error("Por favor completa todos los campos correctamente", {
        style: { background: "#FBCFE8", color: "#9F1239" },
      });
      return;
    }

    const allProveedores = JSON.parse(
      localStorage.getItem("syspharma_proveedores") || "[]"
    );

    if (editingProveedor) {
      const updated = allProveedores.map((p: Proveedor) =>
        p.id === editingProveedor.id ? { ...p, ...formData } : p
      );
      localStorage.setItem("syspharma_proveedores", JSON.stringify(updated));
      toast.success("Proveedor actualizado exitosamente", {
        style: { background: "#A7F3D0", color: "#065F46" },
      });
    } else {
      if (allProveedores.some((p: Proveedor) => p.nit === formData.nit)) {
        toast.error("Este NIT ya está registrado", {
          style: { background: "#FBCFE8", color: "#9F1239" },
        });
        return;
      }

      const newProveedor: Proveedor = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
      };
      allProveedores.push(newProveedor);
      localStorage.setItem(
        "syspharma_proveedores",
        JSON.stringify(allProveedores)
      );
      toast.success("Proveedor creado exitosamente", {
        style: { background: "#A7F3D0", color: "#065F46" },
      });
    }

    setModalOpen(false);
    loadProveedores();
  };

  const handleDelete = (proveedor: Proveedor) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${proveedor.nombre}?`)) {
      const all = JSON.parse(
        localStorage.getItem("syspharma_proveedores") || "[]"
      );
      const updated = all.filter((p: Proveedor) => p.id !== proveedor.id);
      localStorage.setItem("syspharma_proveedores", JSON.stringify(updated));
      toast.success("Proveedor eliminado exitosamente", {
        style: { background: "#A7F3D0", color: "#065F46" },
      });
      loadProveedores();
    }
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "nit", label: "NIT" },
    { key: "email", label: "Email" },
    { key: "telefono", label: "Teléfono" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 style={{ color: "#374151" }}>Proveedores</h3>
          <p style={{ color: "#9CA3AF" }}>Gestiona los proveedores</p>
        </div>
        <ButtonPastel variant="green" onClick={() => handleOpenModal()}>
          <Plus style={{ width: "20px", height: "20px" }} />
          Nuevo Proveedor
        </ButtonPastel>
      </div>

      <Table
        columns={columns}
        data={proveedores}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputWithValidation
            label="Nombre de la Empresa"
            icon={Building}
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            onBlur={() => setTouched({ ...touched, nombre: true })}
            error={errors.nombre}
            success={
              touched.nombre && !errors.nombre && formData.nombre.length > 0
            }
            showValidation={touched.nombre && formData.nombre.length > 0}
          />

          <InputWithValidation
            label="NIT"
            icon={FileText}
            value={formData.nit}
            onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
            onBlur={() => setTouched({ ...touched, nit: true })}
            error={errors.nit}
            success={touched.nit && !errors.nit && formData.nit.length > 0}
            showValidation={touched.nit && formData.nit.length > 0}
          />

          <InputWithValidation
            label="Correo Electrónico"
            type="email"
            icon={Mail}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            onBlur={() => setTouched({ ...touched, email: true })}
            error={errors.email}
            success={
              touched.email && !errors.email && formData.email.length > 0
            }
            showValidation={touched.email && formData.email.length > 0}
          />

          <InputWithValidation
            label="Teléfono"
            type="tel"
            icon={Phone}
            value={formData.telefono}
            onChange={(e) =>
              setFormData({
                ...formData,
                telefono: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
            onBlur={() => setTouched({ ...touched, telefono: true })}
            error={errors.telefono}
            success={
              touched.telefono &&
              !errors.telefono &&
              formData.telefono.length > 0
            }
            showValidation={touched.telefono && formData.telefono.length > 0}
          />

          <div className="relative">
            <label className="block text-sm mb-2" style={{ color: "#374151" }}>
              Dirección (opcional)
            </label>
            <textarea
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className="w-full px-4 py-3 bg-white rounded-2xl border-2 transition-all duration-300 outline-none"
              style={{ borderColor: "#93C5FD", color: "#374151" }}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <ButtonPastel
              variant="green"
              type="submit"
              disabled={!isValid}
              className="flex-1"
            >
              {editingProveedor ? "Actualizar" : "Crear"}
            </ButtonPastel>
            <ButtonPastel
              variant="pink"
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </ButtonPastel>
          </div>
        </form>
      </Modal>
    </div>
  );
}
