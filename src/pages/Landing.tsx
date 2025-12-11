import { Link } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";
import { Button } from "../components/ui/button";
import {
  Heart,
  Clock,
  UserCheck,
  ShoppingCart,
  Tag,
  Users,
  Star,
  ChevronsRight,
} from "lucide-react";
// Using an external photo for the hero

export default function Landing() {
  const { isDark, bgCard, textPrimary, textSecondary, border } = useDarkMode();

  return (
    <div
      className={`${
        isDark ? "bg-[#071025]" : "bg-white"
      } min-h-screen text-white`}
    >
      {/* Header */}
      <header className={`w-full ${bgCard} border-b ${border}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between py-5 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f1724] to-[#0b1220] flex items-center justify-center">
              <Users className="text-white w-6 h-6" />
            </div>
            <div>
              <h3
                className={`${textPrimary} font-bold`}
                style={{ letterSpacing: "-0.02em" }}
              >
                SysPharma
              </h3>
              <p className={`${textSecondary} text-xs`}>Montería, Córdoba</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className={`${textSecondary} text-sm hidden sm:inline`}>
              Abierto: 6:00 AM a 10:00 PM
            </p>
            <Link to="/login">
              <Button
                className={`rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-gray-100"
                } text-sm px-4 py-2`}
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/register">
              <Button className="rounded-lg bg-[#14B8A6] text-white text-sm px-4 py-2">
                Crear Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1
              className={`${textPrimary} text-3xl md:text-4xl font-extrabold mb-4`}
            >
              ¡Bienvenido a SysPharma! Tu Farmacia de Confianza en Montería,
              Córdoba.
            </h1>
            <p className={`${textSecondary} text-lg mb-6`}>
              Consulta nuestro catálogo, pide tus productos en línea y recógelos
              en nuestra farmacia, ¡sin filas!
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register">
                <Button className="bg-[#14B8A6] text-white rounded-2xl px-6 py-3 font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Regístrate y Pide Ahora para Recoger
                </Button>
              </Link>

              <Link
                to="/catalogo-cliente"
                className="self-start sm:self-center"
              >
                <Button
                  className={`${
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  } text-sm rounded-2xl px-5 py-3`}
                >
                  Explorar Catálogo
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`${bgCard} p-4 rounded-xl border ${border}`}>
                <div className="flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-[#14B8A6]" />
                  <div>
                    <p className={`${textPrimary} font-semibold`}>
                      Asesoría Farmacéutica
                    </p>
                    <p className={`${textSecondary} text-sm`}>
                      Atención confiable por profesionales.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${bgCard} p-4 rounded-xl border ${border}`}>
                <div className="flex items-center gap-3">
                  <ChevronsRight className="w-6 h-6 text-[#14B8A6]" />
                  <div>
                    <p className={`${textPrimary} font-semibold`}>
                      Pide Online y Recoge en Minutos
                    </p>
                    <p className={`${textSecondary} text-sm`}>
                      Rápido, seguro y sin esperas.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${bgCard} p-4 rounded-xl border ${border}`}>
                <div className="flex items-center gap-3">
                  <Tag className="w-6 h-6 text-[#14B8A6]" />
                  <div>
                    <p className={`${textPrimary} font-semibold`}>
                      Productos Certificados
                    </p>
                    <p className={`${textSecondary} text-sm`}>
                      Calidad y mejores precios locales.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-first md:order-last">
            <div
              className={`${bgCard} rounded-2xl p-6 border ${border} shadow-lg flex flex-col items-center`}
            >
              <img
                src="https://source.unsplash.com/1200x800/?pharmacy"
                alt="Foto de una farmacia local"
                loading="lazy"
                className="w-full h-64 object-cover rounded-xl"
                style={{ maxHeight: 320 }}
              />
              <p className={`${textSecondary} mt-3 text-sm`}>
                Visítanos en el centro de Montería o solicita tu pedido online.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-16">
          <h3 className={`${textPrimary} text-2xl font-bold mb-6`}>
            Cómo Funciona
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div
              className={`${bgCard} p-6 rounded-xl border ${border} text-center`}
            >
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[#0f1724] flex items-center justify-center">
                <UserCheck className="text-[#14B8A6] w-6 h-6" />
              </div>
              <h4 className={`${textPrimary} font-semibold mb-1`}>
                Busca o Consulta
              </h4>
              <p className={`${textSecondary} text-sm`}>
                Encuentra productos o habla con un farmacéutico.
              </p>
            </div>

            <div
              className={`${bgCard} p-6 rounded-xl border ${border} text-center`}
            >
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[#0f1724] flex items-center justify-center">
                <ChevronsRight className="text-[#14B8A6] w-6 h-6" />
              </div>
              <h4 className={`${textPrimary} font-semibold mb-1`}>
                Paga Online o en Tienda
              </h4>
              <p className={`${textSecondary} text-sm`}>
                Métodos seguros y múltiples opciones de pago.
              </p>
            </div>

            <div
              className={`${bgCard} p-6 rounded-xl border ${border} text-center`}
            >
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[#0f1724] flex items-center justify-center">
                <Heart className="text-[#14B8A6] w-6 h-6" />
              </div>
              <h4 className={`${textPrimary} font-semibold mb-1`}>
                Recoge tu Pedido
              </h4>
              <p className={`${textSecondary} text-sm`}>
                Acércate y recibe tu pedido sin filas.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials / payment logos */}
        <section className="mt-16">
          <h3 className={`${textPrimary} text-2xl font-bold mb-6`}>
            Confianza de Nuestros Clientes
          </h3>
          <div className="flex gap-4 overflow-x-auto py-4">
            <div
              className={`${bgCard} p-4 rounded-xl border ${border} min-w-[280px]`}
            >
              <p className={`${textPrimary} font-semibold`}>
                "Servicio rápido y atención excelente"
              </p>
              <p className={`${textSecondary} text-sm`}>- Ana M., Montería</p>
            </div>
            <div
              className={`${bgCard} p-4 rounded-xl border ${border} min-w-[280px]`}
            >
              <p className={`${textPrimary} font-semibold`}>
                "Puedo pedir y recoger en minutos"
              </p>
              <p className={`${textSecondary} text-sm`}>
                - Carlos R., Montería
              </p>
            </div>
            <div
              className={`${bgCard} p-4 rounded-xl border ${border} min-w-[280px]`}
            >
              <p className={`${textPrimary} font-semibold`}>
                "Precios justos y productos certificados"
              </p>
              <p className={`${textSecondary} text-sm`}>- María P., Montería</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t pt-8 pb-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className={`${textPrimary} font-bold`}>SysPharma</h4>
              <p className={`${textSecondary} text-sm`}>
                Calle Principal #12-34, Montería, Córdoba
              </p>
              <p className={`${textSecondary} text-sm mt-2`}>
                Tel: (4) 123 4567
              </p>
              <p className={`${textSecondary} text-sm`}>
                Horario: 6:00 AM - 10:00 PM
              </p>
            </div>

            <div>
              <h5 className={`${textPrimary} font-semibold`}>Enlaces</h5>
              <ul className="mt-2 space-y-2 text-sm">
                <li>
                  <Link to="/register" className={`${textSecondary}`}>
                    Crear Cuenta
                  </Link>
                </li>
                <li>
                  <Link to="/login" className={`${textSecondary}`}>
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <a href="#" className={`${textSecondary}`}>
                    Términos y Condiciones
                  </a>
                </li>
                <li>
                  <a href="#" className={`${textSecondary}`}>
                    Política de Privacidad
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className={`${textPrimary} font-semibold`}>
                Métodos de Pago
              </h5>
              <div className="flex gap-3 mt-3">
                <div className={`${bgCard} p-3 rounded-lg border ${border}`}>
                  <p className={`${textSecondary} text-sm`}>Visa</p>
                </div>
                <div className={`${bgCard} p-3 rounded-lg border ${border}`}>
                  <p className={`${textSecondary} text-sm`}>Mastercard</p>
                </div>
                <div className={`${bgCard} p-3 rounded-lg border ${border}`}>
                  <p className={`${textSecondary} text-sm`}>Efectivo</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
