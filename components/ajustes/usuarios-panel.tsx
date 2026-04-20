"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { invitarUsuario } from "@/app/(app)/ajustes/actions"

export function UsuariosPanel() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "recepcion">("recepcion")

  function handleInvitar() {
    if (!email.trim()) return
    startTransition(async () => {
      const result = await invitarUsuario(email.trim(), role)
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      } else {
        toast({
          title: "Usuario creado",
          description: `${email} — rol: ${role}. El usuario puede acceder con la contraseña que tú le asignes desde Supabase Auth.`,
        })
        setEmail("")
      }
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Crea usuarios para que accedan a la aplicación. Después asígnales contraseña desde el panel de Supabase Auth o activa el envío de email de confirmación.
      </p>

      <div className="flex gap-2 flex-wrap items-end">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Email</label>
          <Input
            type="email"
            placeholder="usuario@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvitar()}
            className="w-64"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Rol</label>
          <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recepcion">Recepción</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleInvitar} disabled={isPending || !email.trim()} size="sm">
          {isPending
            ? <Loader2 className="mr-1 w-4 h-4 animate-spin" />
            : <UserPlus className="mr-1 w-4 h-4" />}
          Crear usuario
        </Button>
      </div>
    </div>
  )
}
