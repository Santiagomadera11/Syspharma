import { useState, useEffect } from "react";
import {
  Plus,
  Mail,
  User as UserIcon,
  Phone,
  Lock,
  Shield,
} from "lucide-react";
import { Modal } from "../ui/modal";
import { Table } from "../ui/table";
import { InputWithValidation } from "../ui/input-with-validation";
import { ButtonPastel } from "../ui/button-pastel";
import {
  validateEmail,
  validateRequired,
  validatePhone,
  validatePassword,
} from "../../utils/validation";
import { toast } from "sonner";

type Usuario = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "empleado" | "cliente";
  active: boolean;
  password?: string;
};

export function UsuariosView() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "cliente" as Usuario["role"],
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = () => {
    setLoading(true);
    setTimeout(() => {
      const saved = JSON.parse(localStorage.getItem("syspharma_users") || "[]");
      setUsuarios(saved.map(({ password, ...user }: any) => user));
      setLoading(false);
    }, 500);
  };

  const passwordValidation = validatePassword(formData.password);

  const errors = {
    name:
      touched.name && !validateRequired(formData.name)
        ? "Este campo es obligatorio"
        : "",
    email:
      touched.email && !validateRequired(formData.email)
        ? "Este campo es obligatorio"
        : touched.email && !validateEmail(formData.email)
        ? "Ingresa un email válido"
        : "",
    phone:
      touched.phone && formData.phone && !validatePhone(formData.phone)
        ? "Debe tener 10 dígitos"
        : "",
    password:
      !editingUser && touched.password && !passwordValidation.isValid
        ? "Contraseña debe tener 8+ caracteres, mayúscula y número"
        : "",
    confirmPassword:
      !editingUser &&
      touched.confirmPassword &&
      formData.password !== formData.confirmPassword
        ? "Las contraseñas no coinciden"
        : "",
  };

  const isValid = editingUser
    ? validateRequired(formData.name) &&
      validateEmail(formData.email) &&
      (!formData.phone || validatePhone(formData.phone))
    : validateRequired(formData.name) &&
      validateEmail(formData.email) &&
      (!formData.phone || validatePhone(formData.phone)) &&
      passwordValidation.isValid &&
      formData.password === formData.confirmPassword;

  const handleOpenModal = (user?: Usuario) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        password: "",
        confirmPassword: "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "cliente",
        password: "",
        confirmPassword: "",
      });
    }
    setTouched({
      name: false,
      email: false,
      phone: false,
      password: false,
      confirmPassword: false,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (!isValid) {
      toast.error("Por favor completa todos los campos correctamente", {
        style: { background: "#FBCFE8", color: "#9F1239" },
      });
      return;
    }

    const allUsers = JSON.parse(
      localStorage.getItem("syspharma_users") || "[]"
    );

    if (editingUser) {
      // Update
      const updatedUsers = allUsers.map((u: any) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              role: formData.role,
            }
          : u
      );
      localStorage.setItem("syspharma_users", JSON.stringify(updatedUsers));
      toast.success("Usuario actualizado exitosamente", {
        style: { background: "#A7F3D0", color: "#065F46" },
      });
    } else {
      // Create
      // Check if email exists
      if (allUsers.some((u: any) => u.email === formData.email)) {
        toast.error("Este email ya está registrado", {
          style: { background: "#FBCFE8", color: "#9F1239" },
        });
        return;
      }

      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        active: true,
        password: formData.password,
      };
      allUsers.push(newUser);
      localStorage.setItem("syspharma_users", JSON.stringify(allUsers));
      toast.success("Usuario creado exitosamente", {
        style: { background: "#A7F3D0", color: "#065F46" },
      });
    }

    handleCloseModal();
    loadUsuarios();
  };

  const handleDelete = (user: Usuario) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${user.name}?`)) {
      const allUsers = JSON.parse(
        localStorage.getItem("syspharma_users") || "[]"
      );
      const updatedUsers = allUsers.filter((u: any) => u.id !== user.id);
      localStorage.setItem("syspharma_users", JSON.stringify(updatedUsers));
      toast.success("Usuario eliminado exitosamente", {
        style: { background: "#A7F3D0", color: "#065F46" },
      });
      loadUsuarios();
    }
  };

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    {
      key: "phone",
      label: "Teléfono",
      render: (user: Usuario) => user.phone || "-",
    },
    {
      key: "role",
      label: "Rol",
      render: (user: Usuario) => {
        const roleColors = {
          admin: "#93C5FD",
          empleado: "#A7F3D0",
          cliente: "#C4B5FD",
        };
        const roleLabels = {
          admin: "Admin",
          empleado: "Empleado",
          cliente: "Cliente",
        };
        return (
          <span
            className="px-3 py-1 rounded-lg text-sm"
            style={{ backgroundColor: roleColors[user.role], color: "#374151" }}
          >
            {roleLabels[user.role]}
          </span>
        );
      },
    },
    {
      key: "active",
      label: "Estado",
      render: (user: Usuario) => (
        <span
          className="px-3 py-1 rounded-lg text-sm"
          style={{
            backgroundColor: user.active ? "#A7F3D0" : "#FBCFE8",
            color: "#374151",
          }}
        >
          {user.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 style={{ color: "#374151" }}>Usuarios Registrados</h3>
          <p style={{ color: "#9CA3AF" }}>Gestiona los usuarios del sistema</p>
        </div>
        <ButtonPastel variant="green" onClick={() => handleOpenModal()}>
          <Plus style={{ width: "20px", height: "20px" }} />
          Nuevo Usuario
        </ButtonPastel>
      </div>

      <Table
        columns={columns}
        data={usuarios}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputWithValidation
            label="Nombre Completo"
            icon={UserIcon}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={() => setTouched({ ...touched, name: true })}
            error={errors.name}
            success={touched.name && !errors.name && formData.name.length > 0}
            showValidation={touched.name && formData.name.length > 0}
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
            label="Teléfono (opcional)"
            type="tel"
            icon={Phone}
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
            onBlur={() => setTouched({ ...touched, phone: true })}
            error={errors.phone}
            success={
              touched.phone && !errors.phone && formData.phone.length > 0
            }
            showValidation={touched.phone && formData.phone.length > 0}
          />

          <div className="relative">
            <label className="block text-sm mb-2" style={{ color: "#374151" }}>
              Rol
            </label>
            <div className="relative">
              <Shield
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ width: "20px", height: "20px", color: "#93C5FD" }}
              />
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as Usuario["role"],
                  })
                }
                className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border-2 transition-all duration-300 outline-none"
                style={{ borderColor: "#93C5FD", color: "#374151" }}
              >
                <option value="cliente">Cliente</option>
                <option value="empleado">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          {!editingUser && (
            <>
              <InputWithValidation
                label="Contraseña"
                type="password"
                icon={Lock}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                onBlur={() => setTouched({ ...touched, password: true })}
                error={errors.password}
                success={touched.password && passwordValidation.isValid}
                showValidation={
                  touched.password && formData.password.length > 0
                }
              />

              <InputWithValidation
                label="Confirmar Contraseña"
                type="password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                error={errors.confirmPassword}
                success={
                  touched.confirmPassword &&
                  !errors.confirmPassword &&
                  formData.confirmPassword.length > 0
                }
                showValidation={
                  touched.confirmPassword && formData.confirmPassword.length > 0
                }
              />
            </>
          )}

          <div className="flex gap-3 pt-4">
            <ButtonPastel
              variant="green"
              type="submit"
              disabled={!isValid}
              className="flex-1"
            >
              {editingUser ? "Actualizar" : "Crear Usuario"}
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
