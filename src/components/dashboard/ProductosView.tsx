import { useState, useEffect } from "react";
import { Plus, Package, DollarSign, Hash, Box } from "lucide-react";
import { Modal } from "../ui/modal";
import { Table } from "../ui/table";
import { InputWithValidation } from "../ui/input-with-validation";
import { ButtonPastel } from "../ui/button-pastel";
import {
  validateRequired,
  validatePositiveNumber,
  validateNonNegativeNumber,
} from "../../utils/validation";
import { toast } from "sonner";

type Producto = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen?: string;
  mostrarEnCatalogo?: boolean;
};

export function ProductosView() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [mostrarEnCatalogo, setMostrarEnCatalogo] = useState<boolean>(true);
  const [touched, setTouched] = useState({
    codigo: false,
    nombre: false,
    precio: false,
    stock: false,
    categoria: false,
  });

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = () => {
    setLoading(true);
    setTimeout(() => {
      const saved = JSON.parse(
        localStorage.getItem("syspharma_productos") || "[]"
      );
      setProductos(saved);
      setLoading(false);
    }, 500);
  };

  const errors = {
    codigo:
      touched.codigo && !validateRequired(formData.codigo)
        ? "Este campo es obligatorio"
        : "",
    nombre:
      touched.nombre && !validateRequired(formData.nombre)
        ? "Este campo es obligatorio"
        : "",
    precio:
      touched.precio && !validateRequired(formData.precio)
        ? "Este campo es obligatorio"
        : touched.precio && !validatePositiveNumber(Number(formData.precio))
        ? "Debe ser mayor a 0"
        : "",
    stock:
      touched.stock && !validateRequired(formData.stock)
        ? "Este campo es obligatorio"
        : touched.stock && !validateNonNegativeNumber(Number(formData.stock))
        ? "Debe ser mayor o igual a 0"
        : "",
    categoria:
      touched.categoria && !validateRequired(formData.categoria)
        ? "Este campo es obligatorio"
        : "",
  };

  const isValid =
    validateRequired(formData.codigo) &&
    validateRequired(formData.nombre) &&
    validatePositiveNumber(Number(formData.precio)) &&
    validateNonNegativeNumber(Number(formData.stock)) &&
    validateRequired(formData.categoria);

  const handleOpenModal = (product?: Producto) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        codigo: product.codigo,
        nombre: product.nombre,
        descripcion: product.descripcion || "",
        precio: product.precio.toString(),
        stock: product.stock.toString(),
        categoria: product.categoria,
      });
      setImagePreview(product.imagen || "");
      setMostrarEnCatalogo(product.mostrarEnCatalogo ?? true);
    } else {
      setEditingProduct(null);
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoria: "",
      });
      setImagePreview("");
      setMostrarEnCatalogo(true);
    }
    setTouched({
      codigo: false,
      nombre: false,
      precio: false,
      stock: false,
      categoria: false,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      codigo: true,
      nombre: true,
      precio: true,
      stock: true,
      categoria: true,
    });

    if (!isValid) {
      toast.error("Por favor completa todos los campos correctamente", {
        style: { background: "#FBCFE8", color: "#9F1239" },
      });
      return;
    }

    const allProducts = JSON.parse(
      localStorage.getItem("syspharma_productos") || "[]"
    );

    if (editingProduct) {
      const updatedProducts = allProducts.map((p: Producto) =>
        p.id === editingProduct.id
          ? {
              ...p,
              codigo: formData.codigo,
              nombre: formData.nombre,
              descripcion: formData.descripcion,
              precio: Number(formData.precio),
              stock: Number(formData.stock),
              categoria: formData.categoria,
              imagen: imagePreview,
              mostrarEnCatalogo: mostrarEnCatalogo,
            }
          : p
      );
      localStorage.setItem(
        "syspharma_productos",
        JSON.stringify(updatedProducts)
      );
      toast.success("Producto actualizado exitosamente", {
        style: { background: "#A7F3D0", color: "#065F46" },
      });
    } else {
      // Check if codigo exists
      if (allProducts.some((p: Producto) => p.codigo === formData.codigo)) {
        toast.error("Este código ya existe", {
          style: { background: "#FBCFE8", color: "#9F1239" },
        });
        return;
      }

      const newProduct: Producto = {
        id: Math.random().toString(36).substr(2, 9),
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: Number(formData.precio),
        stock: Number(formData.stock),
        categoria: formData.categoria,
        imagen: imagePreview,
        mostrarEnCatalogo: mostrarEnCatalogo,
      };
      allProducts.push(newProduct);
      localStorage.setItem("syspharma_productos", JSON.stringify(allProducts));
      toast.success("Producto creado exitosamente", {
        style: { background: "#A7F3D0", color: "#065F46" },
      });
    }

    handleCloseModal();
    loadProductos();
  };

  const handleDelete = (product: Producto) => {
    if (window.confirm(`¿Estás seguro de eliminar ${product.nombre}?`)) {
      const allProducts = JSON.parse(
        localStorage.getItem("syspharma_productos") || "[]"
      );
      const updatedProducts = allProducts.filter(
        (p: Producto) => p.id !== product.id
      );
      localStorage.setItem(
        "syspharma_productos",
        JSON.stringify(updatedProducts)
      );
      toast.success("Producto eliminado exitosamente", {
        style: { background: "#A7F3D0", color: "#065F46" },
      });
      loadProductos();
    }
  };

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "nombre", label: "Nombre" },
    { key: "categoria", label: "Categoría" },
    {
      key: "precio",
      label: "Precio",
      render: (product: Producto) => `$${product.precio.toFixed(2)}`,
    },
    {
      key: "stock",
      label: "Stock",
      render: (product: Producto) => (
        <span
          className="px-3 py-1 rounded-lg text-sm"
          style={{
            backgroundColor:
              product.stock > 10
                ? "#A7F3D0"
                : product.stock > 0
                ? "#FDE047"
                : "#FBCFE8",
            color: "#374151",
          }}
        >
          {product.stock}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 style={{ color: "#374151" }}>Productos</h3>
          <p style={{ color: "#9CA3AF" }}>
            Gestiona el inventario de productos
          </p>
        </div>
        <ButtonPastel variant="green" onClick={() => handleOpenModal()}>
          <Plus style={{ width: "20px", height: "20px" }} />
          Nuevo Producto
        </ButtonPastel>
      </div>

      <Table
        columns={columns}
        data={productos}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        loading={loading}
      />
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                  Sin imagen
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">
                Imagen del producto (URL o base64)
              </label>
              <input
                type="text"
                value={imagePreview}
                onChange={(e) => setImagePreview(e.target.value)}
                placeholder="Pegar URL o base64"
                className="w-full px-3 py-2 rounded-lg border"
              />
              <p className="text-xs text-gray-500 mt-1">
                La vista previa se muestra en tamaño reducido.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputWithValidation
              label="Código de Producto"
              icon={Hash}
              value={formData.codigo}
              onChange={(e) =>
                setFormData({ ...formData, codigo: e.target.value })
              }
              onBlur={() => setTouched({ ...touched, codigo: true })}
              error={errors.codigo}
              success={
                touched.codigo && !errors.codigo && formData.codigo.length > 0
              }
              showValidation={touched.codigo && formData.codigo.length > 0}
            />

            <InputWithValidation
              label="Nombre del Producto"
              icon={Package}
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
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={mostrarEnCatalogo}
                onChange={(e) => setMostrarEnCatalogo(e.target.checked)}
              />
              <span className="ml-2">Mostrar en catálogo cliente</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <ButtonPastel
              variant="green"
              type="submit"
              disabled={!isValid}
              className="flex-1"
            >
              {editingProduct ? "Actualizar" : "Crear Producto"}
            </ButtonPastel>
            <ButtonPastel
              variant="pink"
              type="button"
              onClick={handleCloseModal}
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
