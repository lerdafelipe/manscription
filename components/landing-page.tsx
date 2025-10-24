import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Bell, Shield, TrendingDown, CreditCard, Calendar } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="border-b border-emerald-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Manscripcion</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">Empezar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              Toma el control de tus suscripciones
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
              No vuelvas a perder el control de tus{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-600">
                Suscripciones
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed text-pretty">
              Maneja todas tus suscripciones en un solo lugar. Rastrea gastos, recibe recordatorios de pago y toma el control de
              tus gastos recurrentes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white text-lg px-8">
                  Empieza Gratis
                </Button>
              </Link>
              <Link href="#benefits">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8 bg-transparent"
                >
                  Ver cómo funciona
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 border-2 border-white flex items-center justify-center text-white font-semibold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">10,000+ Usuarios</div>
                <div className="text-gray-600">Manejando sus suscripciones</div>
              </div>
            </div>
          </div>

          {/* App Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-400/20 to-teal-400/20 rounded-3xl blur-3xl" />
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-emerald-100">
              <div className="space-y-4">
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <div className="text-sm text-gray-600">Gastos mensuales</div>
                    <div className="text-3xl font-bold text-gray-900">$127.000,50</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Mock Subscription Cards */}
                <div className="space-y-3">
                  {[
                    { name: "Netflix", amount: "$15.999", color: "from-red-500 to-red-600" },
                    { name: "Spotify", amount: "$9.999", color: "from-green-500 to-green-600" },
                    { name: "Adobe", amount: "$52.999", color: "from-purple-500 to-purple-600" },
                  ].map((sub) => (
                    <div key={sub.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div
                        className={`w-10 h-10 rounded-lg bg-linear-to-br ${sub.color} flex items-center justify-center text-white font-bold text-sm`}
                      >
                        {sub.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{sub.name}</div>
                        <div className="text-sm text-gray-600">Mensual</div>
                      </div>
                      <div className="font-bold text-gray-900">{sub.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para gestionar tus suscripciones
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simples funciones diseñadas para ayudarte a gestionar y optimizar el gasto de tus suscripciones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingDown className="w-6 h-6" />,
                title: "Seguimiento de Gastos",
                description:
                  "Ve exactamente cuánto estás gastando en suscripciones cada mes, trimestre y año en un solo panel unificado.",
                color: "from-emerald-500 to-teal-600",
              },
              {
                icon: <Bell className="w-6 h-6" />,
                title: "Recordatorios de pagos",
                description:
                  "No vuelvas a perder una fecha de pago. Recibe notificaciones antes de que se realicen los cargos.",
                color: "from-blue-500 to-cyan-600",
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: "Periodos Personalizados",
                description:
                  "Haz seguimiento de suscripciones con ciclos de facturación únicos, ya sean mensuales, anuales o personalizados.",
                color: "from-purple-500 to-pink-600",
              },
              {
                icon: <CreditCard className="w-6 h-6" />,
                title: "Multiples Métodos de Pago",
                description:
                  "Organiza tus suscripciones según tus métodos de pago preferidos, ya sea tarjeta de crédito, débito o PayPal.",
                color: "from-orange-500 to-red-600",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Seguridad de tus datos",
                description:
                  "Encriptamos toda tu información sensible para garantizar que tus datos estén siempre protegidos.",
                color: "from-green-500 to-emerald-600",
              },
              {
                icon: <Check className="w-6 h-6" />,
                title: "Fácil de Usar",
                description:
                  "Simple, intuitivo y eficiente. Nuestra interfaz está diseñada para que gestionar tus suscripciones sea pan comido.",
                color: "from-indigo-500 to-blue-600",
              },
            ].map((benefit, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-gray-200">
                <div
                  className={`w-12 h-12 rounded-xl bg-linear-to-br ${benefit.color} flex items-center justify-center text-white mb-4`}
                >
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-linear-to-br from-gray-900 to-gray-800 py-16 md:py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">
                $2.4M+
              </div>
              <div className="text-gray-400">de suscripciones</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">
                10,000+
              </div>
              <div className="text-gray-400">Usuarios Activos</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">
                98%
              </div>
              <div className="text-gray-400">Tasa de satisfacción</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Listo para tomar el control?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están gestionando sus suscripciones de manera inteligente y eficiente.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white text-lg px-12">
              Empezar gratis
            </Button>
          </Link>
          <p className="text-sm text-gray-600 mt-4">
            Sin tarjeta de crédito. Sin compromiso.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">Manscripcion</span>
            </div>
            <div className="text-sm text-gray-600">© 2025 Manscripcion.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
