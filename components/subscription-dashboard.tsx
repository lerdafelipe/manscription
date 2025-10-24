"use client"

import type React from "react"
import { useState, useTransition, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Calendar, TrendingUp, Plus, X, LogOut, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"
import { addSubscription, deleteSubscription, logout } from "@/app/actions"
import { cn } from "@/lib/utils"

interface Subscription {
  id: number
  name: string
  logo_url: string | null
  amount: string
  period: string
  next_payment_date: string
  bank: string | null
  card_last_four: string | null
  category: string | null
  currency?: string
  payment_method?: string | null
}

interface ExchangeRates {
  USD: number
  EUR: number
  lastUpdate: string
}

const CATEGORIES = [
  "Entretenimiento",
  "Streaming",
  "Música",
  "Productividad",
  "Software",
  "Cloud Storage",
  "Fitness",
  "Educación",
  "Noticias",
  "Gaming",
  "Diseño",
  "Desarrollo",
  "Marketing",
  "Comunicación",
  "Otros",
]

const PAYMENT_METHODS = [
  "Tarjeta",
  "PayPal",
  "Apple Pay",
  "Google Pay",
  "Transferencia",
  "Mercado Pago",
  "Stripe",
  "Otro",
]

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "Dólar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "ARS", symbol: "$", name: "Peso Argentino" },
]

export function SubscriptionDashboard({
  user,
  initialSubscriptions,
}: {
  user: User
  initialSubscriptions: Subscription[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; subscription: Subscription | null }>({
    isOpen: false,
    subscription: null,
  })

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null)

  const [categoryOpen, setCategoryOpen] = useState(false)
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)
  const [nameOpen, setNameOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    period: "Mensual",
    nextPaymentDate: "",
    paymentMethod: "",
    bank: "",
    cardLastFour: "",
    category: "",
    currency: "ARS",
  })

  useState(() => {
    fetch("/api/exchange-rates")
      .then((res) => res.json())
      .then((data) => setExchangeRates(data))
      .catch((err) => console.error("[v0] Error fetching exchange rates:", err))
  })

  const uniqueCards = useMemo(() => {
    const cards = subscriptions.filter((sub) => sub.card_last_four).map((sub) => sub.card_last_four as string)
    return Array.from(new Set(cards))
  }, [subscriptions])

  const uniqueNames = useMemo(() => {
    const names = subscriptions.map((sub) => sub.name)
    return Array.from(new Set(names))
  }, [subscriptions])

  const convertToARS = (amount: number, currency: string) => {
    if (!exchangeRates) return amount
    if (currency === "ARS") return amount
    if (currency === "USD") return amount * exchangeRates.USD
    if (currency === "EUR") return amount * exchangeRates.EUR
    return amount
  }

  const convertFromARS = (amountARS: number, targetCurrency: string) => {
    if (!exchangeRates) return amountARS
    if (targetCurrency === "ARS") return amountARS
    if (targetCurrency === "USD") return amountARS / exchangeRates.USD
    if (targetCurrency === "EUR") return amountARS / exchangeRates.EUR
    return amountARS
  }

  const calculateMonthlyTotal = () => {
    return subscriptions.reduce((total, sub) => {
      let monthlyAmount = Number.parseFloat(sub.amount)
      if (sub.period === "Anual") monthlyAmount = monthlyAmount / 12
      if (sub.period === "Trimestral") monthlyAmount = monthlyAmount / 3
      if (sub.period === "Semestral") monthlyAmount = monthlyAmount / 6

      const amountInARS = convertToARS(monthlyAmount, sub.currency || "ARS")
      return total + amountInARS
    }, 0)
  }

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    const newSubscription = {
      name: formData.name,
      amount: Number.parseFloat(formData.amount),
      period: formData.period,
      nextPaymentDate: formData.nextPaymentDate,
      paymentMethod: formData.paymentMethod,
      bank: formData.bank,
      cardLastFour: formData.cardLastFour,
      category: formData.category,
      currency: formData.currency,
    }

    startTransition(async () => {
      const result = await addSubscription(newSubscription)

      if (result.success) {
        if (!result.subscription) return
        setSubscriptions((prev) => [...prev, result.subscription])

        setIsModalOpen(false)
        setFormData({
          name: "",
          amount: "",
          period: "Mensual",
          nextPaymentDate: "",
          paymentMethod: "",
          bank: "",
          cardLastFour: "",
          category: "",
          currency: "ARS",
        })
        router.refresh()
      }
    })
  }

  const handleDeleteClick = (subscription: Subscription) => {
    setDeleteConfirmation({ isOpen: true, subscription })
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.subscription) return

    startTransition(async () => {
      if (!deleteConfirmation.subscription) return
      const result = await deleteSubscription(deleteConfirmation.subscription.id)
      if (result.success) {
        setSubscriptions((prev) => prev.filter((sub) => sub.id !== deleteConfirmation.subscription?.id))

        setDeleteConfirmation({ isOpen: false, subscription: null })
        router.refresh()
      }
    })
  }

  const handleLogout = async () => {
    startTransition(async () => {
      await logout()
      router.push("/login")
      router.refresh()
    })
  }

  const getCurrencySymbol = (code?: string) => {
    const currency = CURRENCIES.find((c) => c.code === (code || "ARS"))
    return currency?.symbol || "$"
  }

  const monthlyTotal = calculateMonthlyTotal()
  const annualTotal = monthlyTotal * 12

  const nextPaymentSub =
    subscriptions.length > 0
      ? subscriptions.reduce((earliest, sub) => {
          return new Date(sub.next_payment_date) < new Date(earliest.next_payment_date) ? sub : earliest
        })
      : null

  const shouldShowBankField = () => {
    return (
      formData.paymentMethod === "Tarjeta" ||
      formData.paymentMethod === "Otro" ||
      formData.paymentMethod === "Transferencia"
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-emerald-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-3xl py-4 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Manscripcion</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleLogout} disabled={isPending} className="cursor-pointer">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto space-y-6 max-w-3xl p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-balance">Mis Suscripciones</h1>
              <p className="mt-1 text-sm text-muted-foreground">Hola, {user.name || user.email}! 👋🏻👋🏻</p>
            </div>
          </div>
          <Button className="w-full gap-2 cursor-pointer" onClick={() => setIsModalOpen(true)} disabled={isPending}>
            <Plus className="h-4 w-4" />
            Añadir Suscripción
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Gasto Mensual</p>
                <p className="mt-1 text-2xl font-bold">$ {monthlyTotal.toFixed(2)} ARS</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{subscriptions.length} suscripciones activas</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Gasto Anual</p>
                <p className="mt-1 text-2xl font-bold">$ {annualTotal.toFixed(2)} ARS</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Proyección anual estimada</p>
          </Card>

          {nextPaymentSub && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Próximo Pago</p>
                  <p className="mt-1 text-2xl font-bold">
                    {getCurrencySymbol(nextPaymentSub.currency)}
                    {Number.parseFloat(nextPaymentSub.amount).toFixed(2)}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                  <CreditCard className="h-5 w-5 text-chart-3" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {nextPaymentSub.name} -{" "}
                {new Date(nextPaymentSub.next_payment_date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </Card>
          )}
        </div>

        {/* Subscriptions Grid */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Todas las Suscripciones</h2>
          {subscriptions.length === 0 ? (
            <Card className="px-8 text-center">
              <p className="text-muted-foreground">No tienes suscripciones aún. Añade tu primera suscripción.</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {subscriptions.map((subscription) => {
                const amount = Number.parseFloat(subscription.amount)
                const amountInARS = convertToARS(amount, subscription.currency || "ARS")
                const showConversion = subscription.currency && subscription.currency !== "ARS" && exchangeRates

                return (
                  <Card key={subscription.id} className="overflow-hidden">
                    <div className="px-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <img
                              src={subscription.logo_url || "/placeholder.svg?height=40&width=40"}
                              alt={subscription.name}
                              className="h-6 w-6 rounded"
                            />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">{subscription.name}</h3>
                            {subscription.category && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {subscription.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive cursor-pointer"
                          onClick={() => handleDeleteClick(subscription)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Cantidad</span>
                          <div className="text-right">
                            <span className="text-base font-bold">
                              {getCurrencySymbol(subscription.currency)}
                              {amount.toFixed(2)}
                            </span>
                            {showConversion && (
                              <div className="text-xs text-muted-foreground">≈ $ {amountInARS.toFixed(2)} ARS</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Periodo</span>
                          <Badge variant="outline" className="text-xs">
                            {subscription.period}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Próximo pago</span>
                          <span className="text-xs font-medium">
                            {new Date(subscription.next_payment_date).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {subscription.payment_method && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Método de pago</span>
                            <span className="text-xs font-medium">{subscription.payment_method}</span>
                          </div>
                        )}

                        {subscription.bank && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Detalles</span>
                            <span className="text-xs font-medium">{subscription.bank}</span>
                          </div>
                        )}

                        {subscription.card_last_four && (
                          <div className="border-t pt-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Tarjeta</span>
                              <div className="flex items-center gap-1.5">
                                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium">•••• {subscription.card_last_four}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-4 pb-2 -mt-2">
              <h2 className="text-lg font-semibold">Nueva Suscripción</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="cursor-pointer">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleAddSubscription} className="space-y-4 px-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Popover open={nameOpen} onOpenChange={setNameOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={nameOpen}
                      className="w-full justify-between font-normal bg-transparent cursor-pointer"
                    >
                      {formData.name || "Netflix, Spotify, etc."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Buscar o ingresar..."
                        value={formData.name}
                        onValueChange={(value) => setFormData({ ...formData, name: value })}
                      />
                      <CommandList>
                        {uniqueNames.length === 0 ? (
                          <CommandEmpty>Ingresa el nombre de la suscripción.</CommandEmpty>
                        ) : (
                          <CommandGroup heading="Suscripciones guardadas">
                            {uniqueNames.map((name) => (
                              <CommandItem
                                key={name}
                                value={name}
                                onSelect={(currentValue) => {
                                  setFormData({ ...formData, name: currentValue })
                                  setNameOpen(false)
                                }}
                              >
                                <Check
                                  className={cn("mr-2 h-4 w-4", formData.name === name ? "opacity-100" : "opacity-0")}
                                />
                                {name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="amount">Cantidad *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="15.99"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    required
                  >
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="period">Periodo *</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) => setFormData({ ...formData, period: value })}
                    required
                  >
                    <SelectTrigger id="period" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensual">Mensual</SelectItem>
                      <SelectItem value="Trimestral">Trimestral</SelectItem>
                      <SelectItem value="Semestral">Semestral</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextPaymentDate">Próximo Pago *</Label>
                  <Input
                    id="nextPaymentDate"
                    type="date"
                    value={formData.nextPaymentDate}
                    onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="w-full justify-between font-normal bg-transparent cursor-pointer"
                    >
                      {formData.category || "Selecciona una categoría..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar categoría..." />
                      <CommandList>
                        <CommandEmpty>No se encontró la categoría.</CommandEmpty>
                        <CommandGroup>
                          {CATEGORIES.map((category) => (
                            <CommandItem
                              key={category}
                              value={category}
                              onSelect={(currentValue) => {
                                setFormData({ ...formData, category: currentValue })
                                setCategoryOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.category === category ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {category}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Método de Pago *</Label>
                  <Popover open={paymentMethodOpen} onOpenChange={setPaymentMethodOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={paymentMethodOpen}
                        className="w-full justify-between font-normal bg-transparent cursor-pointer"
                      >
                        {formData.paymentMethod || "Selecciona un método..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar método..." />
                        <CommandList>
                          <CommandEmpty>No se encontró el método.</CommandEmpty>
                          <CommandGroup>
                            {PAYMENT_METHODS.map((method) => (
                              <CommandItem
                                key={method}
                                value={method}
                                onSelect={(currentValue) => {
                                  setFormData({ ...formData, paymentMethod: currentValue })
                                  setPaymentMethodOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.paymentMethod === method ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {method}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Últimos 4 dígitos de tarjeta</Label>
                  <Popover open={cardOpen} onOpenChange={setCardOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={cardOpen}
                        className="w-full justify-between font-normal bg-transparent cursor-pointer"
                      >
                        {formData.cardLastFour || "Ingresa o selecciona..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar o ingresar..."
                          value={formData.cardLastFour}
                          onValueChange={(value) => {
                            if (value.length <= 4 && /^\d*$/.test(value)) {
                              setFormData({ ...formData, cardLastFour: value })
                            }
                          }}
                        />
                        <CommandList>
                          {uniqueCards.length === 0 ? (
                            <CommandEmpty>Ingresa los 4 dígitos.</CommandEmpty>
                          ) : (
                            <CommandGroup heading="Tarjetas guardadas">
                              {uniqueCards.map((card) => (
                                <CommandItem
                                  key={card}
                                  value={card}
                                  onSelect={(currentValue) => {
                                    setFormData({ ...formData, cardLastFour: currentValue })
                                    setCardOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.cardLastFour === card ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  •••• {card}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {shouldShowBankField() && (
                <div className="space-y-2">
                  <Label htmlFor="bank">Detalles</Label>
                  <Input
                    id="bank"
                    placeholder="Santander, Galicia, BBVA, ..."
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent cursor-pointer"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer" disabled={isPending}>
                  {isPending ? "Añadiendo..." : "Añadir"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && deleteConfirmation.subscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm animate-in fade-in zoom-in-95">
            <div className="space-y-4 px-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Eliminar Suscripción</h3>
                <p className="text-sm text-muted-foreground">
                  ¿Estás seguro de que quieres eliminar la suscripción de{" "}
                  <span className="font-semibold text-foreground">{deleteConfirmation.subscription.name}</span>? Esta
                  acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent cursor-pointer"
                  onClick={() => setDeleteConfirmation({ isOpen: false, subscription: null })}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 cursor-pointer"
                  onClick={handleConfirmDelete}
                  disabled={isPending}
                >
                  {isPending ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="mx-auto space-y-6 max-w-3xl p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">Manscripcion</span>
            </div>
            <div className="text-sm text-gray-600">© 2025 Manscripcion. Todos los derechos reservados.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
