import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfesionalesPanel } from "@/components/ajustes/profesionales-panel"
import { CatalogoPanel } from "@/components/ajustes/catalogo-panel"
import { UsuariosPanel } from "@/components/ajustes/usuarios-panel"
import { Users, BookOpen, UserPlus } from "lucide-react"

export default async function AjustesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.user_metadata?.role !== "admin") redirect("/dashboard")

  const [{ data: profesionales }, { data: servicios }] = await Promise.all([
    supabase.from("profesionales").select("*").order("nombre"),
    supabase.from("servicios_catalogo").select("*").order("nombre"),
  ])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Ajustes</h1>
        <p className="text-sm text-muted-foreground">Solo visible para administradores</p>
      </div>

      <Tabs defaultValue="profesionales">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="profesionales" className="gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" /> Profesionales
          </TabsTrigger>
          <TabsTrigger value="catalogo" className="gap-1.5 text-xs">
            <BookOpen className="w-3.5 h-3.5" /> Catálogo
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-1.5 text-xs">
            <UserPlus className="w-3.5 h-3.5" /> Usuarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profesionales">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Gestión de profesionales</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfesionalesPanel profesionales={profesionales ?? []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalogo">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Catálogo de servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <CatalogoPanel servicios={servicios ?? []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Gestión de usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <UsuariosPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
