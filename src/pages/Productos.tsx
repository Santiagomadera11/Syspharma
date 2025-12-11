import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useDarkMode } from "../hooks/useDarkMode";
import {
  useProductos,
  useCategorias,
  useProveedores,
} from "../hooks/useEntities";
import { Producto } from "../utils/localStorage";
import {
  onlyNumbers,
  validatePrice,
  validateQuantity,
} from "../utils/validation";

interface ProductosProps {
  user: any;
}

const FORMAS_FARMACEUTICAS = [
  "Tableta",
  "Cápsula",
  "Jarabe",
  "Solución Inyectable",
  "Crema",
  "Gel",
  "Supositorio",
];
const LABORATORIOS = [
  "Pfizer",
  "GSK",
  "Bayer",
  "Novartis",
  "Sanofi",
  "Abbott",
  "Merck",
  "Roche",
];

// Generar código automático
const generarCodigo = (existentes: Producto[]) => {
  const año = new Date().getFullYear();
  const cantidad = existentes.length + 1;
  return `PROD-${año}-${String(cantidad).padStart(4, "0")}`;
};

export default function Productos({ user }: ProductosProps) {
  const {
    isDark,
    bgCard,
    textPrimary,
    textSecondary,
    border,
    inputBg,
    inputBorder,
    modalBg,
    tableHeader,
    tableRow,
  } = useDarkMode();

  // ✅ Usar hooks globales en lugar de estado manual
  const {
    items: productos,
    add: addProducto,
    update: updateProducto,
    remove: removeProducto,
  } = useProductos();
  const { items: categorias } = useCategorias();
  const { items: proveedores } = useProveedores();

  // Categorías activas para los selects
  const categoriasActivas = useMemo(
    () => categorias.filter((c) => c.estado === "Activo"),
    [categorias]
  );

  // Proveedores activos para los selects
  const proveedoresActivos = useMemo(
    () => proveedores.filter((p) => p.estado === "Activo"),
    [proveedores]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [catalogoModalOpen, setCatalogoModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño máximo crudo (no comprimido)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "La imagen no debe superar 5MB (archivo original). Seleccioná una imagen más pequeña."
      );
      return;
    }

    // Comprimir/redimensionar antes de guardar (canvas -> jpeg calidad 0.7)
    const compressImage = (
      file: File,
      maxSize = 800,
      quality = 0.7
    ): Promise<string> => {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          // calcular dimensiones manteniendo ratio
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height *= maxSize / width));
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width *= maxSize / height));
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error("No se pudo obtener contexto de canvas"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          // Convertir a JPEG para compresión, fallback a png si falla
          try {
            const dataUrl = canvas.toDataURL("image/jpeg", quality);
            URL.revokeObjectURL(url);
            resolve(dataUrl);
          } catch (err) {
            try {
              const dataUrl = canvas.toDataURL();
              URL.revokeObjectURL(url);
              resolve(dataUrl);
            } catch (e) {
              URL.revokeObjectURL(url);
              reject(e);
            }
          }
        };
        img.onerror = (err) => {
          URL.revokeObjectURL(url);
          reject(err);
        };
        img.src = url;
      });
    };

    (async () => {
      try {
        const compressed = await compressImage(file, 800, 0.7);
        // Medida de seguridad: si el base64 sigue siendo > 2.5MB, avisar
        const approxSize = Math.round((compressed.length * 3) / 4);
        if (approxSize > 2.5 * 1024 * 1024) {
          toast.warn(
            "Imagen comprimida todavía es grande; se guardará igualmente, pero considera imágenes más pequeñas"
          );
        }
        setFormData({ ...formData, imagen: compressed });
        setImagePreview(compressed);
      } catch (err) {
        console.error(err);
        toast.error("No se pudo procesar la imagen");
      }
    })();
  };

  const [formData, setFormData] = useState({
    codigo: "",
    tipoProducto: "Producto General",
    nombreGenerico: "",
    formaFarmaceutica: "",
    concentracion: "",
    accionTerapeutica: "",
    laboratorio: "",
    requiereReceta: false,
    nombreComercial: "",
    descripcion: "",
    proveedor: "",
    presentacion: "",
    codigoBarras: "",
    lote: "",
    fechaVencimiento: "",
    ubicacionEstante: "",
    stockActual: "",
    stockMinimo: "",
    precioCompra: "",
    precioVenta: "",
    categoria: "",
    imagen: "" as string, // base64 o URL de la imagen
    mostrarEnCatalogo: true,
    estado: "Activo",
  });

  const [errors, setErrors] = useState({
    nombreComercial: "",
    proveedor: "",
    presentacion: "",
    fechaVencimiento: "",
    nombreGenerico: "",
    formaFarmaceutica: "",
    concentracion: "",
    accionTerapeutica: "",
    laboratorio: "",
  });

  const openCreateModal = () => {
    const codigo = generarCodigo(productos);
    setSelectedProducto(null);
    setImagePreview("");
    setFormData({
      codigo,
      tipoProducto: "Producto General",
      nombreGenerico: "",
      formaFarmaceutica: "",
      concentracion: "",
      accionTerapeutica: "",
      laboratorio: "",
      requiereReceta: false,
      nombreComercial: "",
      descripcion: "",
      proveedor: "",
      presentacion: "",
      codigoBarras: "",
      lote: "",
      fechaVencimiento: "",
      ubicacionEstante: "",
      stockActual: "0",
      stockMinimo: "10",
      precioCompra: "0",
      precioVenta: "0",
      categoria: "",
      imagen: "",
      mostrarEnCatalogo: true,
      estado: "Activo",
    });
    setErrors({
      nombreComercial: "",
      proveedor: "",
      presentacion: "",
      fechaVencimiento: "",
      nombreGenerico: "",
      formaFarmaceutica: "",
      concentracion: "",
      accionTerapeutica: "",
      laboratorio: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (producto: Producto) => {
    setSelectedProducto(producto);
    setImagePreview(producto.imagen || "");
    setFormData({
      codigo: producto.codigo,
      tipoProducto: producto.tipoProducto || "Producto General",
      nombreGenerico: producto.nombreGenerico || "",
      formaFarmaceutica: producto.formaFarmaceutica || "",
      concentracion: producto.concentracion || "",
      accionTerapeutica: producto.accionTerapeutica || "",
      laboratorio: producto.laboratorio || "",
      requiereReceta: producto.requiereReceta || false,
      nombreComercial: producto.nombreComercial || "",
      descripcion: producto.descripcion || "",
      proveedor: producto.proveedor || "",
      presentacion: producto.presentacion || "",
      codigoBarras: producto.codigoBarras || "",
      lote: producto.lote || "",
      fechaVencimiento: producto.fechaVencimiento || "",
      ubicacionEstante: producto.ubicacionEstante || "",
      stockActual: String(producto.stock || 0),
      stockMinimo: String(producto.stockMinimo || 10),
      precioCompra: String(producto.precioCompra || 0),
      precioVenta: String(producto.precio || 0),
      categoria: producto.categoria || "",
      imagen: producto.imagen || "",
      mostrarEnCatalogo: producto.mostrarEnCatalogo ?? true,
      estado: producto.estado || "Activo",
    });
    setErrors({
      nombreComercial: "",
      proveedor: "",
      presentacion: "",
      fechaVencimiento: "",
      nombreGenerico: "",
      formaFarmaceutica: "",
      concentracion: "",
      accionTerapeutica: "",
      laboratorio: "",
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {
      nombreComercial: !formData.nombreComercial ? "Requerido" : "",
      proveedor: !formData.proveedor ? "Requerido" : "",
      presentacion: !formData.presentacion ? "Requerido" : "",
      fechaVencimiento: !formData.fechaVencimiento ? "Requerido" : "",
      nombreGenerico:
        formData.tipoProducto === "Producto Farmacéutico" &&
        !formData.nombreGenerico
          ? "Requerido"
          : "",
      formaFarmaceutica:
        formData.tipoProducto === "Producto Farmacéutico" &&
        !formData.formaFarmaceutica
          ? "Requerido"
          : "",
      concentracion:
        formData.tipoProducto === "Producto Farmacéutico" &&
        !formData.concentracion
          ? "Requerido"
          : "",
      accionTerapeutica:
        formData.tipoProducto === "Producto Farmacéutico" &&
        !formData.accionTerapeutica
          ? "Requerido"
          : "",
      laboratorio:
        formData.tipoProducto === "Producto Farmacéutico" &&
        !formData.laboratorio
          ? "Requerido"
          : "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((err) => err !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const productoData: Producto = {
      id: selectedProducto?.id || String(Date.now()),
      codigo: formData.codigo,
      tipoProducto: formData.tipoProducto,
      nombreGenerico: formData.nombreGenerico,
      formaFarmaceutica: formData.formaFarmaceutica,
      concentracion: formData.concentracion,
      accionTerapeutica: formData.accionTerapeutica,
      laboratorio: formData.laboratorio,
      requiereReceta: formData.requiereReceta,
      nombreComercial: formData.nombreComercial,
      descripcion: formData.descripcion,
      proveedor: formData.proveedor,
      presentacion: formData.presentacion,
      codigoBarras: formData.codigoBarras,
      lote: formData.lote,
      fechaVencimiento: formData.fechaVencimiento,
      ubicacionEstante: formData.ubicacionEstante,
      stock: parseInt(formData.stockActual) || 0,
      stockMinimo: parseInt(formData.stockMinimo) || 10,
      precioCompra: parseFloat(formData.precioCompra) || 0,
      precio: parseFloat(formData.precioVenta) || 0,
      categoria: formData.categoria,
      imagen:
        formData.imagen ||
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
      estado: formData.estado || selectedProducto?.estado || "Activo",
      createdAt: selectedProducto?.createdAt || new Date().toISOString(),
      mostrarEnCatalogo: formData.mostrarEnCatalogo ?? true,
    };

    if (selectedProducto) {
      updateProducto(productoData);
      toast.success("Producto actualizado exitosamente", {
        style: { background: "#A7F3D0", color: "#065F46" },
      });
    } else {
      addProducto(productoData);
      toast.success("Producto creado exitosamente", {
        style: { background: "#A7F3D0", color: "#065F46" },
      });
    }

    setLoading(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedProducto) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    removeProducto(selectedProducto.id);
    toast.success("Producto eliminado exitosamente", {
      style: { background: "#A7F3D0", color: "#065F46" },
    });

    setLoading(false);
    setDeleteDialogOpen(false);
    setSelectedProducto(null);
  };

  const abrirCatalogo = () => {
    if (!formData.proveedor) {
      toast.error("Primero selecciona un proveedor");
      return;
    }
    setCatalogoModalOpen(true);
  };

  const importarDesdeCatalogo = (producto: any) => {
    setFormData({
      ...formData,
      nombreComercial: producto.nombreComercial || producto.nombre,
      nombreGenerico: producto.nombreGenerico || "",
      formaFarmaceutica: producto.formaFarmaceutica || "",
      concentracion: producto.concentracion || "",
      accionTerapeutica: producto.accionTerapeutica || "",
      laboratorio: producto.laboratorio || "",
      presentacion: producto.presentacion || "",
      categoria: producto.categoria || "",
    });
    setCatalogoModalOpen(false);
    toast.success("Datos importados del catálogo");
  };

  // Filtrar productos del proveedor seleccionado para el catálogo
  const productosCatalogo = productos.filter(
    (p) => p.proveedor === formData.proveedor
  );

  const filteredProductos = productos.filter((p) => {
    const matchesSearch =
      p.nombreComercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nombreGenerico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria =
      !categoriaFiltro || p.categoria === categoriaFiltro;
    return matchesSearch && matchesCategoria;
  });

  const esFarmaceutico = formData.tipoProducto === "Producto Farmacéutico";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2
            className={`${textPrimary} transition-colors duration-300`}
            style={{ fontSize: "28px", fontWeight: 700 }}
          >
            Gestión de Productos
          </h2>
          <p
            className={`${textSecondary} transition-colors duration-300`}
            style={{ fontSize: "14px" }}
          >
            Administra el inventario de productos
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-[#A7F3D0] hover:bg-[#86EFAC] text-[#374151] rounded-xl h-11 px-6 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filtros */}
      <div
        className={`${bgCard} rounded-xl p-6 border ${border} shadow-sm transition-colors duration-300`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#63E6BE]" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className={`pl-12 h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${
                isDark ? "text-white placeholder-gray-400" : ""
              } focus:border-[#63E6BE]`}
            />
          </div>

          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger
              className={`w-64 h-12 rounded-xl ${inputBorder} ${inputBg}`}
            >
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Todas las categorías</SelectItem>
              {categoriasActivas.map((cat) => (
                <SelectItem key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div
        className={`${bgCard} rounded-2xl ${border} border shadow-sm overflow-hidden transition-colors duration-300`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={tableHeader}>
              <tr>
                <th
                  className="text-left p-4 text-white"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  Código
                </th>
                <th
                  className="text-left p-4 text-white"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  Producto
                </th>
                <th
                  className="text-left p-4 text-white"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  Categoría
                </th>
                <th
                  className="text-left p-4 text-white"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  Stock
                </th>
                <th
                  className="text-left p-4 text-white"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  Precio
                </th>
                <th
                  className="text-right p-4 text-white"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProductos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`text-center p-8 ${textSecondary}`}
                  >
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProductos.map((producto) => (
                  <tr
                    key={producto.id}
                    className={`${border} border-b ${tableRow} transition-all duration-300`}
                  >
                    <td className={`p-4 ${textPrimary} font-mono text-xs`}>
                      {producto.codigo}
                    </td>
                    <td
                      className={`p-4 ${textPrimary}`}
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      {producto.nombreComercial || producto.nombreGenerico}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {producto.categoria || "Sin categoría"}
                      </span>
                    </td>
                    <td className={`p-4 ${textSecondary}`}>
                      <span
                        className={
                          producto.stock < producto.stockMinimo
                            ? "text-red-500 font-bold"
                            : ""
                        }
                      >
                        {producto.stock}
                      </span>
                      {producto.stock < producto.stockMinimo && " ⚠️"}
                    </td>
                    <td
                      className={`p-4 ${textPrimary}`}
                      style={{ fontWeight: 600 }}
                    >
                      ${producto.precio.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => {
                            setSelectedProducto(producto);
                            setDetailModalOpen(true);
                          }}
                          className="h-9 w-9 p-0 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => openEditModal(producto)}
                          className="h-9 w-9 p-0 rounded-lg bg-[#63E6BE] hover:bg-[#5DD5BE] text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedProducto(producto);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-9 w-9 p-0 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar Producto */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className={`${modalBg} rounded-2xl p-6 max-w-3xl max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className={`${textPrimary} text-2xl font-bold`}>
              {selectedProducto ? "Editar Producto" : "Crear Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Código (solo lectura) */}
            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                Código del Producto
              </label>
              <Input
                type="text"
                value={formData.codigo}
                disabled
                className={`h-11 rounded-xl ${inputBorder} ${inputBg} opacity-70 cursor-not-allowed`}
              />
            </div>

            {/* Imagen compacta (no desplaza el resto) */}
            <div className="flex justify-end">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setFormData({ ...formData, imagen: "" });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`h-24 w-24 rounded-lg flex items-center justify-center ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Sin imagen
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="imageInput"
                    className="hidden"
                  />
                  <label
                    htmlFor="imageInput"
                    className="cursor-pointer px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  >
                    📷 Agregar imagen
                  </label>
                  <p
                    className={`text-xs mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Máx 2MB
                  </p>

                  {/* Botón explícito para quitar la imagen */}
                  {imagePreview && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setFormData({ ...formData, imagen: "" });
                        }}
                        className="px-3 py-2 rounded-xl border border-red-400 text-red-600 hover:bg-red-50"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tipo de Producto */}
            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                Tipo de Producto *
              </label>
              <Select
                value={formData.tipoProducto}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipoProducto: value })
                }
              >
                <SelectTrigger
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Producto Farmacéutico">
                    Producto Farmacéutico
                  </SelectItem>
                  <SelectItem value="Producto General">
                    Producto General
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos Farmacéuticos (Condicionales) */}
            {esFarmaceutico && (
              <>
                <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-4 space-y-4 bg-blue-50/50 dark:bg-blue-900/10">
                  <p className={`${textPrimary} font-bold text-sm`}>
                    Información Farmacéutica
                  </p>

                  <div>
                    <label
                      className={`block ${textPrimary} mb-2 font-semibold`}
                      style={{ fontSize: "13px" }}
                    >
                      Nombre Genérico *
                    </label>
                    <Input
                      type="text"
                      value={formData.nombreGenerico}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombreGenerico: e.target.value,
                        })
                      }
                      className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                        isDark ? "text-white" : ""
                      } ${errors.nombreGenerico ? "border-red-500" : ""}`}
                      placeholder="Ej: Ibuprofeno"
                    />
                    {errors.nombreGenerico && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.nombreGenerico}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block ${textPrimary} mb-2 font-semibold`}
                        style={{ fontSize: "13px" }}
                      >
                        Forma Farmacéutica *
                      </label>
                      <Select
                        value={formData.formaFarmaceutica}
                        onValueChange={(value) =>
                          setFormData({ ...formData, formaFarmaceutica: value })
                        }
                      >
                        <SelectTrigger
                          className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                            errors.formaFarmaceutica ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {FORMAS_FARMACEUTICAS.map((forma) => (
                            <SelectItem key={forma} value={forma}>
                              {forma}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.formaFarmaceutica && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.formaFarmaceutica}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block ${textPrimary} mb-2 font-semibold`}
                        style={{ fontSize: "13px" }}
                      >
                        Concentración *
                      </label>
                      <Input
                        type="text"
                        value={formData.concentracion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            concentracion: e.target.value,
                          })
                        }
                        className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                          isDark ? "text-white" : ""
                        } ${errors.concentracion ? "border-red-500" : ""}`}
                        placeholder="Ej: 400mg"
                      />
                      {errors.concentracion && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.concentracion}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block ${textPrimary} mb-2 font-semibold`}
                      style={{ fontSize: "13px" }}
                    >
                      Acción Terapéutica *
                    </label>
                    <Input
                      type="text"
                      value={formData.accionTerapeutica}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accionTerapeutica: e.target.value,
                        })
                      }
                      className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                        isDark ? "text-white" : ""
                      } ${errors.accionTerapeutica ? "border-red-500" : ""}`}
                      placeholder="Ej: Antiinflamatorio no esteroideo"
                    />
                    {errors.accionTerapeutica && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.accionTerapeutica}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block ${textPrimary} mb-2 font-semibold`}
                      style={{ fontSize: "13px" }}
                    >
                      Laboratorio *
                    </label>
                    <Select
                      value={formData.laboratorio}
                      onValueChange={(value) =>
                        setFormData({ ...formData, laboratorio: value })
                      }
                    >
                      <SelectTrigger
                        className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                          errors.laboratorio ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {LABORATORIOS.map((lab) => (
                          <SelectItem key={lab} value={lab}>
                            {lab}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.laboratorio && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.laboratorio}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800">
                    <span className={`${textPrimary} font-semibold text-sm`}>
                      Requiere Receta Médica
                    </span>
                    <Switch
                      checked={formData.requiereReceta}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, requiereReceta: checked })
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {/* Campos Siempre Visibles */}
            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                Nombre Comercial *
              </label>
              <Input
                type="text"
                value={formData.nombreComercial}
                onChange={(e) =>
                  setFormData({ ...formData, nombreComercial: e.target.value })
                }
                className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                  isDark ? "text-white" : ""
                } ${errors.nombreComercial ? "border-red-500" : ""}`}
                placeholder="Nombre con el que se vende"
              />
              {errors.nombreComercial && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.nombreComercial}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                Descripción
              </label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className={`rounded-xl ${inputBorder} ${inputBg} ${
                  isDark ? "text-white" : ""
                }`}
                placeholder="Descripción detallada del producto..."
                rows={3}
              />
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                Proveedor *
              </label>
              <div className="flex gap-2">
                <Select
                  value={formData.proveedor}
                  onValueChange={(value) =>
                    setFormData({ ...formData, proveedor: value })
                  }
                >
                  <SelectTrigger
                    className={`flex-1 h-11 rounded-xl ${inputBorder} ${inputBg} ${
                      errors.proveedor ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedoresActivos.map((prov) => (
                      <SelectItem key={prov.id} value={prov.nombre}>
                        {prov.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={abrirCatalogo}
                  className="h-11 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={!formData.proveedor}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Importar de Catálogo
                </Button>
              </div>
              {errors.proveedor && (
                <p className="text-red-500 text-xs mt-1">{errors.proveedor}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block ${textPrimary} mb-2 font-semibold`}
                  style={{ fontSize: "13px" }}
                >
                  Presentación *
                </label>
                <Input
                  type="text"
                  value={formData.presentacion}
                  onChange={(e) =>
                    setFormData({ ...formData, presentacion: e.target.value })
                  }
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                    isDark ? "text-white" : ""
                  } ${errors.presentacion ? "border-red-500" : ""}`}
                  placeholder="Ej: Caja x 20 tabletas"
                />
                {errors.presentacion && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.presentacion}
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block ${textPrimary} mb-2 font-semibold`}
                  style={{ fontSize: "13px" }}
                >
                  Código de Barras
                </label>
                <Input
                  type="text"
                  value={formData.codigoBarras}
                  onChange={(e) =>
                    setFormData({ ...formData, codigoBarras: e.target.value })
                  }
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                    isDark ? "text-white" : ""
                  }`}
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`${textPrimary} font-semibold`}>
                Mostrar en Catálogo
              </span>
              <Switch
                checked={!!formData.mostrarEnCatalogo}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, mostrarEnCatalogo: checked })
                }
              />
            </div>

            {/* Nota informativa sobre visibilidad en el catálogo */}
            <p className={`text-sm ${textSecondary} mt-2`}>
              El producto sólo aparecerá en el catálogo público si está marcado
              para mostrarse, su estado es "Activo" y tiene stock mayor que 0.
            </p>

            {/* Mensajes de validación/feedback */}
            {formData.mostrarEnCatalogo &&
              (() => {
                const stock = parseInt(formData.stockActual || "0");
                const estadoActual = formData.estado || "Activo";
                if (stock <= 0) {
                  return (
                    <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-2 mt-2">
                      Atención: este producto tiene stock 0 o negativo y no
                      aparecerá en el catálogo hasta que su stock sea mayor a 0.
                    </p>
                  );
                }
                if (estadoActual !== "Activo") {
                  return (
                    <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-2 mt-2">
                      Atención: el producto está marcado como "{estadoActual}" y
                      no aparecerá en el catálogo mientras no esté activo.
                    </p>
                  );
                }
                return null;
              })()}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block ${textPrimary} mb-2 font-semibold`}
                  style={{ fontSize: "13px" }}
                >
                  Lote
                </label>
                <Input
                  type="text"
                  value={formData.lote}
                  onChange={(e) =>
                    setFormData({ ...formData, lote: e.target.value })
                  }
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                    isDark ? "text-white" : ""
                  }`}
                  placeholder="LOT-2025-001"
                />
              </div>

              <div>
                <label
                  className={`block ${textPrimary} mb-2 font-semibold`}
                  style={{ fontSize: "13px" }}
                >
                  Fecha de Vencimiento *
                </label>
                <Input
                  type="date"
                  value={formData.fechaVencimiento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fechaVencimiento: e.target.value,
                    })
                  }
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                    isDark ? "text-white" : ""
                  } ${errors.fechaVencimiento ? "border-red-500" : ""}`}
                />
                {errors.fechaVencimiento && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fechaVencimiento}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                Ubicación en Estante
              </label>
              <Input
                type="text"
                value={formData.ubicacionEstante}
                onChange={(e) =>
                  setFormData({ ...formData, ubicacionEstante: e.target.value })
                }
                className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                  isDark ? "text-white" : ""
                }`}
                placeholder="Ej: A-3-5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block ${textPrimary} mb-2 font-semibold`}
                  style={{ fontSize: "13px" }}
                >
                  Stock Actual
                </label>
                <Input
                  type="text"
                  value={formData.stockActual}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockActual: onlyNumbers(e.target.value),
                    })
                  }
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                    isDark ? "text-white" : ""
                  }`}
                  placeholder="Ej: 100"
                />
              </div>

              <div>
                <label
                  className={`block ${textPrimary} mb-2 font-semibold`}
                  style={{ fontSize: "13px" }}
                >
                  Stock Mínimo
                </label>
                <Input
                  type="text"
                  value={formData.stockMinimo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockMinimo: onlyNumbers(e.target.value),
                    })
                  }
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                    isDark ? "text-white" : ""
                  }`}
                  placeholder="Ej: 10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block ${textPrimary} mb-2 font-semibold`}
                  style={{ fontSize: "13px" }}
                >
                  Precio de Compra
                </label>
                <Input
                  type="text"
                  value={formData.precioCompra}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                      setFormData({ ...formData, precioCompra: value });
                    }
                  }}
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                    isDark ? "text-white" : ""
                  }`}
                  placeholder="Ej: 1250.50"
                />
              </div>

              <div>
                <label
                  className={`block ${textPrimary} mb-2 font-semibold`}
                  style={{ fontSize: "13px" }}
                >
                  Precio de Venta
                </label>
                <Input
                  type="text"
                  value={formData.precioVenta}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                      setFormData({ ...formData, precioVenta: value });
                    }
                  }}
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                    isDark ? "text-white" : ""
                  }`}
                  placeholder="Ej: 2500.00"
                />
              </div>
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                Categoría
              </label>
              <Select
                value={formData.categoria}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoria: value })
                }
              >
                <SelectTrigger
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg}`}
                >
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasActivas.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 h-11 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#3D4756] font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white font-semibold disabled:opacity-50"
              >
                {loading
                  ? "Guardando..."
                  : selectedProducto
                  ? "Actualizar"
                  : "Crear Producto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Catálogo */}
      <Dialog open={catalogoModalOpen} onOpenChange={setCatalogoModalOpen}>
        <DialogContent className={`${modalBg} rounded-2xl p-6 max-w-2xl`}>
          <DialogHeader>
            <DialogTitle className={`${textPrimary} text-xl font-bold`}>
              Catálogo de {formData.proveedor}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
            {productosCatalogo.length === 0 ? (
              <p className={`${textSecondary} text-center py-8`}>
                No hay productos en el catálogo de este proveedor
              </p>
            ) : (
              productosCatalogo.map((prod) => (
                <div
                  key={prod.id}
                  className={`p-4 rounded-xl border ${border} hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer`}
                  onClick={() => importarDesdeCatalogo(prod)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`${textPrimary} font-semibold`}>
                        {prod.nombreComercial || prod.nombreGenerico}
                      </p>
                      <p className={`${textSecondary} text-xs mt-1`}>
                        {prod.codigo}
                      </p>
                      {prod.presentacion && (
                        <p className={`${textSecondary} text-xs`}>
                          {prod.presentacion}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      className="h-8 px-3 rounded-lg bg-[#63E6BE] hover:bg-[#5DD5BE] text-white text-sm"
                    >
                      Importar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Detalle Producto */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className={`${modalBg} rounded-2xl p-6 max-w-2xl`}>
          <DialogHeader>
            <DialogTitle className={`${textPrimary} text-2xl font-bold`}>
              Detalle del Producto
            </DialogTitle>
          </DialogHeader>

          {selectedProducto && (
            <div className="space-y-6 mt-4">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>Código</p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProducto.codigo}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>Categoría</p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProducto.categoria}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>
                    Nombre Comercial
                  </p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProducto.nombreComercial}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>
                    Nombre Genérico
                  </p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProducto.nombreGenerico}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>
                    Forma Farmacéutica
                  </p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProducto.formaFarmaceutica}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>
                    Concentración
                  </p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProducto.concentracion}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>Laboratorio</p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProducto.laboratorio}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>
                    Presentación
                  </p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProducto.presentacion}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>
                    Stock Actual
                  </p>
                  <p className={`${textPrimary} font-semibold text-lg`}>
                    {selectedProducto.stock}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>Precio</p>
                  <p className={`${textPrimary} font-semibold text-lg`}>
                    ₡{selectedProducto.precio.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Imagen y configuración de catálogo */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {selectedProducto.imagen ? (
                    <img
                      src={selectedProducto.imagen}
                      alt={selectedProducto.nombreComercial || "imagen"}
                      className="max-h-36 max-w-36 object-cover rounded-lg border"
                    />
                  ) : (
                    <div
                      className={`w-36 h-36 rounded-lg ${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } flex items-center justify-center`}
                    >
                      <span
                        className={isDark ? "text-gray-400" : "text-gray-500"}
                      >
                        Sin imagen
                      </span>
                    </div>
                  )}

                  <div>
                    <p className={`${textPrimary} font-semibold`}>
                      Mostrar en Catálogo
                    </p>
                    <p className={`${textSecondary} text-sm mb-2`}>
                      Controla si este producto aparece en la vista del cliente
                    </p>
                    <div>
                      <Switch
                        checked={selectedProducto.mostrarEnCatalogo ?? true}
                        onCheckedChange={(v) => {
                          const actualizado = {
                            ...selectedProducto,
                            mostrarEnCatalogo: v,
                          } as Producto;
                          updateProducto(actualizado);
                          setSelectedProducto(actualizado);
                          toast.success(
                            v
                              ? "Producto marcado para catálogo"
                              : "Producto ocultado del catálogo"
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="ml-auto">
                  <Button
                    onClick={() => setDetailModalOpen(false)}
                    className="w-full h-11 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white"
                    style={{ fontWeight: 600 }}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={`${modalBg} rounded-2xl`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`${textPrimary} text-xl font-bold`}>
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className={textSecondary}>
              Esta acción eliminará permanentemente el producto{" "}
              {selectedProducto?.nombreComercial ||
                selectedProducto?.nombreGenerico}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-red-500 hover:bg-red-600"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
