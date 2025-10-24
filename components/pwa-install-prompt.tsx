"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Bell } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches

    if (!isInstalled) {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setShowInstallPrompt(true)
      }

      window.addEventListener("beforeinstallprompt", handler)

      return () => window.removeEventListener("beforeinstallprompt", handler)
    } else {
      // If installed, check notification permission
      if ("Notification" in window && Notification.permission === "default") {
        setShowNotificationPrompt(true)
      }
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowInstallPrompt(false)
      // After install, show notification prompt
      setTimeout(() => {
        if ("Notification" in window && Notification.permission === "default") {
          setShowNotificationPrompt(true)
        }
      }, 2000)
    }

    setDeferredPrompt(null)
  }

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Este navegador no soporta notificaciones")
      return
    }

    const permission = await Notification.requestPermission()

    if (permission === "granted") {
      // Subscribe to push notifications
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready

        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""),
          })

          // Send subscription to server
          await fetch("/api/notifications/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription),
          })

          setShowNotificationPrompt(false)
        } catch (error) {
          console.error("Error subscribing to push notifications:", error)
        }
      }
    } else {
      setShowNotificationPrompt(false)
    }
  }

  if (showInstallPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50 animate-in slide-in-from-bottom">
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Instalar Mascripcion</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Instala la app para acceso rápido y recibir recordatorios de pagos
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" className="flex-1 bg-accent hover:bg-accent">
                Instalar
              </Button>
              <Button onClick={() => setShowInstallPrompt(false)} variant="outline" size="sm">
                Ahora no
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showNotificationPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50 animate-in slide-in-from-bottom">
        <button
          onClick={() => setShowNotificationPrompt(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Activar Notificaciones</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Recibe recordatorios antes de tus pagos de suscripciones
            </p>
            <div className="flex gap-2">
              <Button onClick={handleEnableNotifications} size="sm" className="flex-1">
                Activar
              </Button>
              <Button onClick={() => setShowNotificationPrompt(false)} variant="outline" size="sm">
                Ahora no
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
