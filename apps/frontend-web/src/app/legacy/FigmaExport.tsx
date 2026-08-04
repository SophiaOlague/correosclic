import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import {
  Search, Bell, ShoppingCart, User, ChevronDown, ChevronRight, ChevronUp,
  Heart, Star, Plus, Check, ArrowRight, Menu, X, Package, Truck, Shield,
  CreditCard, Zap, Tag, Award, Mail, MapPin, TrendingUp,
  RotateCcw, Headphones, CheckCircle, Clock, Globe, Smartphone, Home,
  SlidersHorizontal, Filter, XCircle, ChevronLeft, Share2, ZoomIn, MessageCircle, Info, Minus, Trash2, Ticket, ShieldCheck, Lock, Store, Navigation, CheckSquare, Settings, LogOut, ChevronRight as ChevronRightIcon, UploadCloud, AlertCircle, AlertTriangle, Briefcase, BarChart as BarChartIcon, ShieldAlert, ArrowUpRight, ArrowDownRight, PlusCircle, MoreHorizontal, LayoutDashboard, Users, Box, TrendingDown, Map, Building, Car, FileText, Activity, ShieldHalf, UserPlus, FileSearch, AlertOctagon, Calendar, PackageCheck, ScanLine, Camera, ClipboardList, Inbox, History, Navigation2, PenTool, Eye, EyeOff, Facebook, Chrome} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  id: number; image: string; title: string; price: string;
  originalPrice?: string; rating: number; reviews: number;
  badge?: string; shipping?: string; seller: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const PRODUCTS: Record<string, Product[]> = {
  popular: [
    { id: 1, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&auto=format", title: "Reloj Casio G-Shock GA-2100 Carbon Core Guard", price: "$2,499 MXN", originalPrice: "$3,199 MXN", rating: 4.8, reviews: 1284, badge: "-22%", shipping: "Envío gratis", seller: "TechStore MX" },
    { id: 2, image: "https://images.unsplash.com/photo-1641048930621-ab5d225ae5b0?w=500&h=500&fit=crop&auto=format", title: "Audífonos Inalámbricos Premium Noise Cancelling", price: "$7,299 MXN", originalPrice: "$8,999 MXN", rating: 4.9, reviews: 2341, badge: "Más vendido", shipping: "Envío gratis", seller: "SoundMax" },
    { id: 3, image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=500&fit=crop&auto=format", title: "Nike Air Max 270 React ENG Hombre", price: "$3,299 MXN", originalPrice: "$4,099 MXN", rating: 4.7, reviews: 893, shipping: "Envío gratis", seller: "NikeOfficial" },
    { id: 4, image: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=500&h=500&fit=crop&auto=format", title: "Laptop Intel Core i5 512GB SSD 16GB RAM", price: "$12,999 MXN", rating: 4.6, reviews: 547, shipping: "Envío gratis", seller: "TechHub MX" },
  ],
  offers: [
    { id: 5, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop&auto=format", title: "iPhone 15 128GB Garantía Apple México", price: "$17,999 MXN", originalPrice: "$21,999 MXN", rating: 4.9, reviews: 3821, badge: "-18%", shipping: "Envío gratis", seller: "Apple Premium" },
    { id: 6, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&h=500&fit=crop&auto=format", title: "Set Perfumes Importados Unisex Premium x3", price: "$699 MXN", originalPrice: "$1,299 MXN", rating: 4.5, reviews: 412, badge: "-46%", shipping: "Envío gratis", seller: "FraganceMX" },
    { id: 7, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop&auto=format", title: "Mochila Premium 15.6\" Impermeable con USB", price: "$1,899 MXN", originalPrice: "$2,899 MXN", rating: 4.6, reviews: 228, badge: "-34%", shipping: "Envío gratis", seller: "BagsWorld" },
    { id: 8, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop&auto=format", title: "Lentes Ray-Ban Wayfarer Classic Polarizado UV400", price: "$2,199 MXN", originalPrice: "$3,499 MXN", rating: 4.8, reviews: 681, badge: "-37%", shipping: "Envío gratis", seller: "Óptica Visión" },
  ],
  new: [
    { id: 9,  image: "https://images.unsplash.com/photo-1760520338238-4137dd2dc28f?w=500&h=500&fit=crop&auto=format",   title: "Smartwatch Ultra Series GPS + Cellular 45mm",  price: "$9,499 MXN",  rating: 4.9, reviews: 156, badge: "Nuevo", shipping: "Envío gratis", seller: "TechStore MX" },
    { id: 10, image: "https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=500&h=500&fit=crop&auto=format",   title: "Tenis Urbanos Minimalistas Cuero Genuino",      price: "$2,899 MXN",  rating: 4.7, reviews: 89,  badge: "Nuevo", shipping: "Envío gratis", seller: "Moda Urbana" },
    { id: 11, image: "https://images.unsplash.com/photo-1650661926447-9efb2610f64c?w=500&h=500&fit=crop&auto=format",   title: "Laptop Ultradelgada OLED 14\" Intel i7 1TB",    price: "$22,499 MXN", rating: 4.8, reviews: 43,  badge: "Nuevo", shipping: "Envío gratis", seller: "Samsung Oficial" },
    { id: 12, image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=500&h=500&fit=crop&auto=format",   title: "Colección Accesorios Primavera 2025 Set",       price: "$3,299 MXN",  rating: 4.6, reviews: 27,  badge: "Nuevo", shipping: "Envío gratis", seller: "StyleBox MX" },
  ],
};

// ─── PRODUCTS ──────────────────────────────────────────────────────────────────
// Removing old tabbed products in favor of separate sections.
// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
export function Dashboard({ setView, switchRole }: { setView: (v: string) => void, switchRole: () => void }) {
  // El Módulo 8 se llevó la pestaña "vendedor" a `/vender`, así que la vista
  // por defecto vuelve a ser el perfil.
  const [activeTab, setActiveTab] = useState("perfil");

  const menuItems = [
    { id: "perfil", label: "Mi perfil", icon: <User className="w-5 h-5" /> },
    { id: "pedidos", label: "Mis pedidos", icon: <Package className="w-5 h-5" /> },
    { id: "favoritos", label: "Favoritos", icon: <Heart className="w-5 h-5" /> },
    { id: "direcciones", label: "Direcciones", icon: <MapPin className="w-5 h-5" /> },
    { id: "pagos", label: "Métodos de pago", icon: <CreditCard className="w-5 h-5" /> },
    { id: "seguridad", label: "Seguridad", icon: <ShieldAlert className="w-5 h-5" /> },
    { id: "configuracion", label: "Configuración", icon: <Settings className="w-5 h-5" /> },
    { id: "vendedor", label: "Convertirme en Vendedor", icon: <Store className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <span className="hover:text-foreground cursor-pointer" onClick={() => setView("home")}>Inicio</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-semibold">Mi cuenta</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-[280px] shrink-0">
            {/* User card */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm mb-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-xl font-black shadow-inner">
                MG
              </div>
              <div>
                <h2 className="font-bold text-foreground">María González</h2>
                <p className="text-xs text-muted-foreground">maria.g@ejemplo.com</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <nav className="flex flex-col">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all border-l-4 ${activeTab === item.id ? "bg-primary/5 text-primary border-primary" : "border-transparent text-foreground hover:bg-[#F5F6F8]"}`}
                  >
                    <span className={activeTab === item.id ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>
                    {item.label}
                    <ChevronRightIcon className={`w-4 h-4 ml-auto ${activeTab === item.id ? "text-primary" : "text-border"}`} />
                  </button>
                ))}
                <div className="h-px bg-border mx-6 my-2" />
                <button className="flex items-center gap-3 px-6 py-4 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-all border-l-4 border-transparent">
                  <LogOut className="w-5 h-5 text-destructive/70" />
                  Cerrar sesión
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-6">
            
            {activeTab === "perfil" && (
              <>
                <h1 className="text-2xl font-black text-foreground mb-6">Mi perfil</h1>
                
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                      <Package className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-foreground">12</p>
                    <p className="text-xs text-muted-foreground font-medium">Pedidos totales</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
                      <Star className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-foreground">5</p>
                    <p className="text-xs text-muted-foreground font-medium">Reseñas escritas</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Heart className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-foreground">24</p>
                    <p className="text-xs text-muted-foreground font-medium">Favoritos</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                    <h2 className="text-lg font-bold text-foreground">Información personal</h2>
                    <button className="text-sm font-semibold text-primary hover:underline">Editar</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Nombre completo</p>
                      <p className="text-sm font-semibold text-foreground">María González Ramírez</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Correo electrónico</p>
                      <p className="text-sm font-semibold text-foreground">maria.g@ejemplo.com</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Teléfono móvil</p>
                      <p className="text-sm font-semibold text-foreground">+52 55 1234 5678</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Fecha de nacimiento</p>
                      <p className="text-sm font-semibold text-foreground">14 de Agosto, 1990</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                    <h2 className="text-lg font-bold text-foreground">Pedido reciente</h2>
                    <button onClick={() => setActiveTab("pedidos")} className="text-sm font-semibold text-primary hover:underline">Ver todos</button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-[#F5F6F8] p-4 rounded-xl border border-transparent hover:border-border transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-border">
                        <img src={PRODUCTS.popular[1].image} alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Pedido <span className="font-bold text-foreground">#CC-849201</span></p>
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{PRODUCTS.popular[1].title}</p>
                        <p className="text-xs font-bold text-[#006847] mt-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#006847]" /> En tránsito</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setView("tracking")}
                      className="shrink-0 bg-white border border-border text-foreground px-5 h-10 rounded-xl text-xs font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm"
                    >
                      Rastrear pedido
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "pedidos" && (
              <>
                <h1 className="text-2xl font-black text-foreground mb-6">Mis pedidos</h1>
                <div className="space-y-4">
                  {[1, 2].map((item, i) => (
                    <div key={`order-${i}`} className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-border gap-2">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha de pedido</p>
                            <p className="text-sm font-semibold text-foreground">12 Ago 2025</p>
                          </div>
                          <div className="w-px h-8 bg-border" />
                          <div>
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="text-sm font-semibold text-foreground">$7,299.00 MXN</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-muted-foreground">Pedido <span className="font-bold text-foreground">#CC-84920{i}</span></p>
                          <button className="text-xs font-semibold text-primary hover:underline mt-0.5">Ver recibo</button>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-[#F5F6F8] rounded-xl overflow-hidden shrink-0 border border-border">
                            <img src={PRODUCTS.popular[i === 0 ? 1 : 3].image} alt="Product" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground line-clamp-2">{PRODUCTS.popular[i === 0 ? 1 : 3].title}</p>
                            <p className="text-xs text-muted-foreground mt-1">Vendido por: {PRODUCTS.popular[i === 0 ? 1 : 3].seller}</p>
                            
                            {i === 0 ? (
                              <p className="text-xs font-bold text-[#006847] mt-2 flex items-center gap-1.5 bg-[#006847]/10 px-2 py-1 rounded-md w-fit">
                                <Truck className="w-3.5 h-3.5" /> En tránsito - Llega el Jueves
                              </p>
                            ) : (
                              <p className="text-xs font-bold text-muted-foreground mt-2 flex items-center gap-1.5 bg-[#F5F6F8] px-2 py-1 rounded-md w-fit">
                                <CheckSquare className="w-3.5 h-3.5" /> Entregado el 5 de Julio
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col gap-2">
                          <button 
                            onClick={() => setView("tracking")}
                            className="w-full md:w-auto bg-primary text-white px-6 h-10 rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
                          >
                            {i === 0 ? "Rastrear paquete" : "Comprar de nuevo"}
                          </button>
                          <button className="w-full md:w-auto bg-white border border-border text-foreground px-6 h-10 rounded-xl text-sm font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm">
                            {i === 0 ? "Ver detalles" : "Escribir reseña"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {["direcciones", "pagos", "favoritos", "configuracion", "seguridad"].includes(activeTab) && (
              <div className="bg-white rounded-2xl border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[#F5F6F8] rounded-full flex items-center justify-center mb-4">
                  {menuItems.find(m => m.id === activeTab)?.icon}
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">{menuItems.find(m => m.id === activeTab)?.label}</h2>
                <p className="text-muted-foreground max-w-sm mb-6">Esta sección se encuentra en desarrollo. Pronto podrás administrar tus {menuItems.find(m => m.id === activeTab)?.label.toLowerCase()} desde aquí.</p>
                <button onClick={() => setActiveTab("perfil")} className="bg-[#F5F6F8] border border-border hover:border-primary/20 hover:text-primary text-foreground px-6 h-10 rounded-xl text-sm font-bold transition-all">
                  Volver a mi perfil
                </button>
              </div>
            )}

            {/* El onboarding real vive en `/vender` (Módulo 8): esta pestaña
                solo lleva allí en vez de duplicar la pantalla. */}
            {activeTab === "vendedor" && (
              <div className="bg-white rounded-2xl border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <Store className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Vende en CorreosClic</h2>
                <p className="text-muted-foreground max-w-sm mb-6">Solicita tu cuenta de vendedor y administra tu propia tienda.</p>
                <button onClick={() => setView("become_seller")} className="bg-primary text-white px-6 h-11 rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20">
                  Ir a la solicitud
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SUPER ADMIN DASHBOARD ───────────────────────────────────────────────────
export function SuperAdminDashboard({ setView }: { setView: (v: string) => void }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const sidebarSections = [
    {
      title: "GENERAL",
      items: [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      ]
    },
    {
      title: "PERSONAS",
      items: [
        { id: "usuarios", label: "Todos los Usuarios", icon: <Users className="w-4 h-4" /> },
        { id: "clientes", label: "Clientes", icon: <Heart className="w-4 h-4" /> },
        { id: "vendedores", label: "Vendedores", icon: <Store className="w-4 h-4" /> },
        { id: "solicitudes", label: "Solicitudes Vendedor", icon: <FileSearch className="w-4 h-4" />, badge: 14 },
      ]
    },
    {
      title: "ADMINISTRACIÓN",
      items: [
        { id: "admins_reg", label: "Admins Regionales", icon: <Shield className="w-4 h-4" /> },
        { id: "admins_loc", label: "Admins Locales", icon: <ShieldHalf className="w-4 h-4" /> },
        { id: "recepcionistas", label: "Recepcionistas", icon: <Briefcase className="w-4 h-4" /> },
        { id: "repartidores", label: "Repartidores", icon: <Truck className="w-4 h-4" /> },
      ]
    },
    {
      title: "LOGÍSTICA",
      items: [
        { id: "regiones", label: "Regiones", icon: <Map className="w-4 h-4" /> },
        { id: "sucursales", label: "Sucursales", icon: <Building className="w-4 h-4" /> },
        { id: "vehiculos", label: "Vehículos", icon: <Car className="w-4 h-4" /> },
        { id: "pedidos", label: "Pedidos", icon: <Package className="w-4 h-4" /> },
        { id: "envios", label: "Envíos", icon: <Navigation className="w-4 h-4" /> },
        { id: "incidencias", label: "Incidencias", icon: <AlertOctagon className="w-4 h-4" />, badge: 3 },
      ]
    },
    {
      title: "SISTEMA",
      items: [
        { id: "reportes", label: "Reportes", icon: <BarChartIcon className="w-4 h-4" /> },
        { id: "configuracion", label: "Configuración Global", icon: <Settings className="w-4 h-4" /> },
        { id: "auditoria", label: "Auditoría", icon: <Activity className="w-4 h-4" /> },
      ]
    }
  ];

  const kpis = [
    { label: "Usuarios registrados", val: "2.4M", trend: "+12%", up: true },
    { label: "Clientes activos", val: "850K", trend: "+8%", up: true },
    { label: "Vendedores activos", val: "45K", trend: "+15%", up: true },
    { label: "Solicitudes pendientes", val: "14", trend: "-5", up: true },
    { label: "Pedidos del día", val: "12,400", trend: "+24%", up: true },
    { label: "Pedidos del mes", val: "385K", trend: "+18%", up: true },
    { label: "Ventas totales (Mes)", val: "$420M", trend: "+22%", up: true },
    { label: "Ingresos por comisiones", val: "$33.6M", trend: "+22%", up: true },
    { label: "Sucursales activas", val: "1,204", trend: "+12", up: true },
    { label: "Vehículos activos", val: "4,500", trend: "+150", up: true },
    { label: "Repartidores activos", val: "8,200", trend: "+300", up: true },
  ];

  const chartDataRegion = [
    { name: 'Norte', ventas: 120, pedidos: 80 },
    { name: 'Sur', ventas: 90, pedidos: 60 },
    { name: 'Centro', ventas: 250, pedidos: 180 },
    { name: 'Bajío', ventas: 150, pedidos: 110 },
    { name: 'Occidente', ventas: 180, pedidos: 130 },
  ];

  const chartDataUsers = [
    { name: 'Ene', usuarios: 400, solicitudes: 24 },
    { name: 'Feb', usuarios: 600, solicitudes: 35 },
    { name: 'Mar', usuarios: 800, solicitudes: 45 },
    { name: 'Abr', usuarios: 1200, solicitudes: 60 },
    { name: 'May', usuarios: 1800, solicitudes: 85 },
    { name: 'Jun', usuarios: 2400, solicitudes: 120 },
  ];

  const topCategories = [
    { name: "Electrónica", percent: 85, color: "bg-blue-500" },
    { name: "Moda y Ropa", percent: 65, color: "bg-[#E4007C]" },
    { name: "Hogar", percent: 45, color: "bg-amber-500" },
    { name: "Deportes", percent: 30, color: "bg-[#006847]" },
  ];

  const recentActivity = [
    { type: "seller", msg: "Moda Urbana MX se registró como vendedor.", time: "Hace 5 min", icon: <Store className="w-4 h-4" />, color: "text-blue-600 bg-blue-50" },
    { type: "branch", msg: "Nueva sucursal activada en Monterrey Centro.", time: "Hace 22 min", icon: <Building className="w-4 h-4" />, color: "text-[#006847] bg-[#006847]/10" },
    { type: "issue", msg: "Retraso logístico reportado en Ruta 4 (CDMX).", time: "Hace 1 hora", icon: <AlertOctagon className="w-4 h-4" />, color: "text-orange-600 bg-orange-50" },
    { type: "approve", msg: "Solicitud de vendedor aprobada (TechHub).", time: "Hace 2 horas", icon: <CheckSquare className="w-4 h-4" />, color: "text-[#E4007C] bg-[#E4007C]/10" },
    { type: "order", msg: "Pedido masivo procesado (#CC-99021).", time: "Hace 3 horas", icon: <Package className="w-4 h-4" />, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="flex h-screen bg-[#F5F6F8] overflow-hidden font-sans">
      <input type="checkbox" id="mobile-menu-sa" className="peer hidden" />
      {/* Sidebar - Dark SaaS Theme */}
      <aside className="fixed md:relative inset-y-0 left-0 z-50 transform -translate-x-full peer-checked:translate-x-0 md:translate-x-0 transition-transform duration-300 w-[260px] bg-[#0F0F1A] text-slate-300 flex flex-col h-full shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 cursor-pointer" onClick={() => setView("home")}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-sm shadow-primary/20">
            <span className="text-white font-black text-xs">CC</span>
          </div>
          <span className="font-bold text-white tracking-tight">Super Admin</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 scrollbar-hide">
          {sidebarSections.map((section, idx) => (
            <div key={`section-${idx}`} className="mb-8">
              <h3 className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                {section.title}
              </h3>
              <nav className="space-y-0.5 px-3">
                {section.items.map(item => {
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? "bg-primary text-white shadow-md shadow-primary/20" 
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
                      {item.label}
                      {item.badge && (
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? "bg-white text-primary" : "bg-primary text-white"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold border border-slate-700">SA</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Admin Principal</p>
              <p className="text-xs text-slate-500 truncate">admin@correosclic.mx</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <label htmlFor="mobile-menu-sa" className="md:hidden cursor-pointer text-muted-foreground"><Menu className="w-5 h-5" /></label>
            <h1 className="text-sm sm:text-lg font-bold text-foreground">Vista general de la plataforma</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Buscar ID, usuario, sucursal..." className="w-64 bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-full pl-9 pr-4 py-1.5 text-sm outline-none transition-all" />
            </div>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F6F8] hover:bg-border transition-colors text-muted-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Crear administrador regional
            </button>
            <button className="bg-white border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm flex items-center gap-2">
              <Building className="w-4 h-4" /> Crear sucursal
            </button>
            <button className="bg-white border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> Ver reportes
            </button>
            <button className="bg-white border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Administrar usuarios
            </button>
            <button className="bg-white border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm flex items-center gap-2">
              <Settings className="w-4 h-4" /> Configurar plataforma
            </button>
          </div>

          {/* KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, i) => (
              <div key={`kpi-${i}`} className={`bg-white rounded-xl border border-border p-5 shadow-sm ${i >= 8 ? 'lg:col-span-1' : ''}`}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">{kpi.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-black text-foreground leading-none">{kpi.val}</p>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${kpi.up ? 'bg-[#006847]/10 text-[#006847]' : 'bg-destructive/10 text-destructive'}`}>
                    {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend}
                  </div>
                </div>
              </div>
            ))}
            {/* Empty filler for grid balance if needed */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-5 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-primary/10 transition-colors">
              <p className="text-sm font-bold text-primary mb-1">Ver reporte mensual</p>
              <p className="text-xs text-primary/70">Descargar PDF / CSV</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Chart: Sales by Region */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground">Ventas y Pedidos por Región (Millones MXN)</h3>
                <button className="text-xs font-bold text-primary hover:underline">Ver mapa detallado</button>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataRegion} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#717182' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#717182' }} />
                    <Tooltip cursor={{fill: '#F5F6F8'}} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="ventas" name="Ventas ($M)" fill="#E4007C" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="pedidos" name="Pedidos (K)" fill="#006847" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Categories & Sellers */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col">
              <h3 className="font-bold text-foreground mb-6">Top Categorías</h3>
              <div className="space-y-5 mb-8">
                {topCategories.map((cat, i) => (
                  <div key={`cat-${i}`}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-foreground">{cat.name}</span>
                      <span className="font-bold text-muted-foreground">{cat.percent}%</span>
                    </div>
                    <div className="w-full bg-[#F5F6F8] rounded-full h-2">
                      <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${cat.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-foreground mb-4 pt-4 border-t border-border">Top Vendedores (Mes)</h3>
              <div className="flex-1 space-y-4">
                {[
                  { name: "TechStore MX", sales: "$4.2M", orders: "1,204" },
                  { name: "Moda Urbana", sales: "$3.8M", orders: "2,150" },
                  { name: "Apple Premium", sales: "$3.5M", orders: "840" },
                ].map((seller, i) => (
                  <div key={`ts-${i}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs border border-border shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{seller.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{seller.orders} pedidos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#006847]">{seller.sales}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Chart: Users Growth */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground">Crecimiento de Usuarios vs Solicitudes Vendedor (K)</h3>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDataUsers} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient key="colorUsers" id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient key="colorReqs" id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E4007C" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#E4007C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#717182' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#717182' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="usuarios" name="Nuevos Usuarios" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" dataKey="solicitudes" name="Solicitudes de Vendedor" stroke="#E4007C" strokeWidth={3} fillOpacity={1} fill="url(#colorReqs)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground">Actividad reciente</h3>
                <button className="text-xs font-semibold text-primary hover:underline">Ver todo</button>
              </div>
              <div className="relative pl-3">
                <div className="absolute top-2 bottom-2 left-[15px] w-px bg-border" />
                <div className="space-y-6">
                  {recentActivity.map((act, i) => (
                    <div key={`act-${i}`} className="relative flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white ${act.color}`}>
                        {act.icon}
                      </div>
                      <div className="pt-1.5">
                        <p className="text-sm font-medium text-foreground leading-snug mb-1">{act.msg}</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// ─── REGIONAL ADMIN DASHBOARD ────────────────────────────────────────────────
export function RegionalAdminDashboard({ setView }: { setView: (v: string) => void }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const sidebarSections = [
    {
      title: "GENERAL",
      items: [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      ]
    },
    {
      title: "ESTRUCTURA",
      items: [
        { id: "sucursales", label: "Sucursales", icon: <Building className="w-4 h-4" /> },
        { id: "admins_locales", label: "Administradores Locales", icon: <ShieldHalf className="w-4 h-4" /> },
        { id: "recepcionistas", label: "Recepcionistas", icon: <Briefcase className="w-4 h-4" /> },
      ]
    },
    {
      title: "LOGÍSTICA",
      items: [
        { id: "repartidores", label: "Repartidores", icon: <Users className="w-4 h-4" /> },
        { id: "vehiculos", label: "Vehículos", icon: <Car className="w-4 h-4" /> },
        { id: "pedidos", label: "Pedidos", icon: <Package className="w-4 h-4" /> },
        { id: "envios", label: "Envíos", icon: <Navigation className="w-4 h-4" /> },
        { id: "incidencias", label: "Incidencias", icon: <AlertOctagon className="w-4 h-4" />, badge: 5 },
      ]
    },
    {
      title: "REGIÓN",
      items: [
        { id: "reportes", label: "Reportes Regionales", icon: <BarChartIcon className="w-4 h-4" /> },
        { id: "configuracion", label: "Configuración Regional", icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  const kpis = [
    { label: "Sucursales", val: "42", trend: "+2", up: true },
    { label: "Pedidos activos", val: "3,250", trend: "+12%", up: true },
    { label: "Envíos en tránsito", val: "1,840", trend: "+5%", up: true },
    { label: "Repartidores (Disp)", val: "215", trend: "-12", up: false },
    { label: "Vehículos (Disp)", val: "180", trend: "+5", up: true },
    { label: "Mantenimiento (Veh)", val: "12", trend: "-2", up: true },
    { label: "Solicitudes pend.", val: "8", trend: "+2", up: false },
    { label: "Incidencias abiertas", val: "5", trend: "-3", up: true },
  ];

  const chartDataEnvios = [
    { name: 'Lun', envios: 420 },
    { name: 'Mar', envios: 380 },
    { name: 'Mie', envios: 550 },
    { name: 'Jue', envios: 480 },
    { name: 'Vie', envios: 620 },
    { name: 'Sab', envios: 840 },
    { name: 'Dom', envios: 210 },
  ];

  const topSucursales = [
    { name: "Sucursal Monterrey Centro", envios: 1250, color: "bg-blue-500" },
    { name: "Sucursal San Pedro", envios: 980, color: "bg-[#006847]" },
    { name: "Sucursal Guadalupe", envios: 850, color: "bg-amber-500" },
    { name: "Sucursal Apodaca", envios: 620, color: "bg-[#E4007C]" },
  ];

  const recentActivity = [
    { type: "order", msg: "Nuevo pedido masivo recibido en Monterrey Centro.", time: "Hace 10 min", icon: <Package className="w-4 h-4" />, color: "text-blue-600 bg-blue-50" },
    { type: "issue", msg: "Incidencia: Vehículo averiado en ruta San Pedro.", time: "Hace 25 min", icon: <AlertOctagon className="w-4 h-4" />, color: "text-orange-600 bg-orange-50" },
    { type: "driver", msg: "Nuevo repartidor asignado a Sucursal Apodaca.", time: "Hace 1 hora", icon: <UserPlus className="w-4 h-4" />, color: "text-[#006847] bg-[#006847]/10" },
    { type: "vehicle", msg: "Vehículo V-402 asignado a nueva ruta.", time: "Hace 2 horas", icon: <Car className="w-4 h-4" />, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="flex h-screen bg-[#F5F6F8] overflow-hidden font-sans">
      <input type="checkbox" id="mobile-menu-ra" className="peer hidden" />
      {/* Sidebar */}
      <aside className="fixed md:relative inset-y-0 left-0 z-50 transform -translate-x-full peer-checked:translate-x-0 md:translate-x-0 transition-transform duration-300 w-[260px] bg-[#002D1F] text-slate-300 flex flex-col h-full shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 cursor-pointer" onClick={() => setView("home")}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <span className="text-[#002D1F] font-black text-xs">CC</span>
          </div>
          <span className="font-bold text-white tracking-tight">Admin Regional</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 scrollbar-hide">
          {sidebarSections.map((section, idx) => (
            <div key={`reg-sec-${idx}`} className="mb-8">
              <h3 className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                {section.title}
              </h3>
              <nav className="space-y-0.5 px-3">
                {section.items.map(item => {
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? "bg-white text-[#002D1F] shadow-sm" 
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className={isActive ? "text-[#002D1F]" : "text-slate-400"}>{item.icon}</span>
                      {item.label}
                      {item.badge && (
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? "bg-destructive text-white" : "bg-destructive text-white"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#004A33] flex items-center justify-center text-white text-xs font-bold border border-[#006847]">AR</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Región Norte</p>
              <p className="text-xs text-slate-400 truncate">norte@correosclic.mx</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <label htmlFor="mobile-menu-ra" className="md:hidden cursor-pointer text-muted-foreground"><Menu className="w-5 h-5" /></label>
            <h1 className="text-sm sm:text-lg font-bold text-foreground">Operaciones: Región Norte</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Buscar pedido, sucursal..." className="w-64 bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-full pl-9 pr-4 py-1.5 text-sm outline-none transition-all" />
            </div>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F6F8] hover:bg-border transition-colors text-muted-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button className="bg-[#006847] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#005439] transition-colors shadow-sm flex items-center gap-2">
              <Building className="w-4 h-4" /> Registrar sucursal
            </button>
            <button className="bg-white border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm flex items-center gap-2">
              <ShieldHalf className="w-4 h-4" /> Asignar admin local
            </button>
            <button className="bg-white border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm flex items-center gap-2">
              <Car className="w-4 h-4" /> Registrar vehículo
            </button>
            <button className="bg-white border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Asignar repartidores
            </button>
            <button className="bg-white border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> Ver reportes
            </button>
          </div>

          {/* KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, i) => (
              <div key={`rkpi-${i}`} className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{kpi.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-black text-foreground leading-none">{kpi.val}</p>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                    kpi.up && kpi.trend.includes('-') && kpi.label.includes('Incidencias') ? 'bg-destructive/10 text-destructive' : 
                    !kpi.up && kpi.trend.includes('-') && kpi.label.includes('Repartidores') ? 'bg-orange-100 text-orange-600' :
                    kpi.up ? 'bg-[#006847]/10 text-[#006847]' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {kpi.trend.includes('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend.replace('+', '').replace('-', '')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Chart: Deliveries by Day */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground">Envíos por día (Últimos 7 días)</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-[#006847] bg-[#006847]/10 px-2 py-1 rounded">
                  <Clock className="w-3.5 h-3.5" /> Tiempo prom. entrega: 2.4 días
                </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDataEnvios} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient key="colorEnvios" id="colorEnvios" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006847" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#006847" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#717182' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#717182' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="envios" stroke="#006847" strokeWidth={3} fillOpacity={1} fill="url(#colorEnvios)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Branches */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col">
              <h3 className="font-bold text-foreground mb-6">Desempeño de Sucursales</h3>
              <div className="space-y-5 mb-4 flex-1">
                {topSucursales.map((suc, i) => (
                  <div key={`rsuc-${i}`}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-foreground truncate pr-2">{suc.name}</span>
                      <span className="font-bold text-muted-foreground">{suc.envios} envíos</span>
                    </div>
                    <div className="w-full bg-[#F5F6F8] rounded-full h-2">
                      <div className={`${suc.color} h-2 rounded-full`} style={{ width: `${(suc.envios / 1250) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full text-xs font-bold text-primary bg-primary/5 py-2 rounded-lg hover:bg-primary/10 transition-colors">
                Ver reporte completo
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-foreground">Actividad Reciente (Región Norte)</h3>
              <button className="text-xs font-semibold text-primary hover:underline">Ver bitácora completa</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentActivity.map((act, i) => (
                <div key={`ract-${i}`} className="p-4 rounded-xl border border-border hover:shadow-md transition-shadow">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${act.color}`}>
                    {act.icon}
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1 line-clamp-2">{act.msg}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">{act.time}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// ─── LOCAL ADMIN DASHBOARD ───────────────────────────────────────────────────
export function LocalAdminDashboard({ setView }: { setView: (v: string) => void }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "recepcionistas", label: "Recepcionistas", icon: <Briefcase className="w-4 h-4" /> },
    { id: "repartidores", label: "Repartidores", icon: <Users className="w-4 h-4" /> },
    { id: "vehiculos", label: "Vehículos", icon: <Car className="w-4 h-4" /> },
    { id: "recepcion", label: "Recepción de paquetes", icon: <PackageCheck className="w-4 h-4" />, badge: 12 },
    { id: "pedidos", label: "Pedidos", icon: <Package className="w-4 h-4" /> },
    { id: "envios", label: "Envíos", icon: <Navigation className="w-4 h-4" /> },
    { id: "asignaciones", label: "Asignaciones", icon: <MapPin className="w-4 h-4" /> },
    { id: "incidencias", label: "Incidencias", icon: <AlertOctagon className="w-4 h-4" />, badge: 2 },
    { id: "reportes", label: "Reportes", icon: <BarChartIcon className="w-4 h-4" /> },
    { id: "configuracion", label: "Configuración sucursal", icon: <Settings className="w-4 h-4" /> },
  ];

  const kpis = [
    { label: "Pedidos pendientes", val: "142", trend: "-5", up: true },
    { label: "Pedidos listos", val: "85", trend: "+12", up: true },
    { label: "Paquetes recibidos", val: "340", trend: "+45", up: true },
    { label: "Paquetes entregados", val: "215", trend: "+20", up: true },
    { label: "Repartidores (Disp)", val: "18", trend: "-2", up: false },
    { label: "Vehículos (Disp)", val: "12", trend: "0", up: true },
    { label: "Vehículos en ruta", val: "24", trend: "+3", up: true },
    { label: "Incidencias", val: "2", trend: "-1", up: true },
  ];

  const recentPackages = [
    { id: "PQ-8891", origin: "Bodega Central", dest: "Ruta 4 (Centro)", status: "Asignado", time: "10:30 AM" },
    { id: "PQ-8890", origin: "Sucursal Sur", dest: "Ruta 2 (Norte)", status: "En almacén", time: "10:15 AM" },
    { id: "PQ-8889", origin: "Vendedor Local", dest: "Ruta 1 (Este)", status: "Recibido", time: "09:45 AM" },
    { id: "PQ-8888", origin: "Bodega Central", dest: "Entregado", status: "Completado", time: "09:00 AM" },
  ];

  const timeline = [
    { time: "10:45 AM", title: "Asignación de ruta", desc: "Ruta 4 asignada a Roberto M. con Vehículo V-12", type: "assign" },
    { time: "10:15 AM", title: "Lote recibido", desc: "45 paquetes ingresados desde Bodega Central", type: "receive" },
    { time: "09:30 AM", title: "Incidencia reportada", desc: "Dirección incorrecta en paquete PQ-8750", type: "issue" },
    { time: "08:00 AM", title: "Apertura de turno", desc: "24 vehículos en ruta, 18 repartidores activos", type: "start" },
  ];

  return (
    <div className="flex h-screen bg-[#F5F6F8] overflow-hidden font-sans">
      <input type="checkbox" id="mobile-menu-la" className="peer hidden" />
      {/* Sidebar - Clean White Theme for Local Admin */}
      <aside className="fixed md:relative inset-y-0 left-0 z-50 transform -translate-x-full peer-checked:translate-x-0 md:translate-x-0 transition-transform duration-300 w-[260px] bg-white border-r border-border flex flex-col h-full shrink-0 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0 cursor-pointer" onClick={() => setView("home")}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-sm shadow-primary/20">
            <span className="text-white font-black text-xs">CC</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">Admin Local</span>
        </div>
        
        <div className="p-5 border-b border-border shrink-0">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">SUCURSAL</p>
          <p className="text-sm font-black text-foreground">Monterrey Centro</p>
          <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-[#006847]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006847]" /> Operando normal
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide space-y-1">
          {sidebarItems.map(item => {
            const isActive = activeMenu === item.id;
            return (
              <button
                key={`loc-menu-${item.id}`}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-primary/5 text-primary" 
                    : "text-muted-foreground hover:bg-[#F5F6F8] hover:text-foreground"
                }`}
              >
                <span className={isActive ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-primary text-white" : "bg-[#F5F6F8] text-muted-foreground"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-border shrink-0">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <label htmlFor="mobile-menu-la" className="md:hidden cursor-pointer text-muted-foreground"><Menu className="w-5 h-5" /></label>
            <h1 className="text-sm sm:text-lg font-bold text-foreground">Dashboard Operativo</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Buscar ID de paquete, repartidor..." className="w-72 bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-full pl-9 pr-4 py-2 text-sm outline-none transition-all" />
            </div>
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F6F8] hover:bg-border transition-colors text-muted-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#F5F6F8]" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Asignar repartidor
            </button>
            <button className="bg-white border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm flex items-center gap-2">
              <Car className="w-4 h-4" /> Asignar vehículo
            </button>
            <button className="bg-white border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm flex items-center gap-2">
              <PackageCheck className="w-4 h-4" /> Registrar paquete
            </button>
            <button className="bg-white border border-border text-destructive px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-destructive/5 transition-colors shadow-sm flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" /> Registrar incidencia
            </button>
          </div>

          {/* KPIs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, i) => (
              <div key={`loc-kpi-${i}`} className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{kpi.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-black text-foreground leading-none">{kpi.val}</p>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                    kpi.label === "Incidencias" && !kpi.trend.includes('-') ? 'bg-destructive/10 text-destructive' :
                    kpi.label === "Incidencias" && kpi.trend.includes('-') ? 'bg-[#006847]/10 text-[#006847]' :
                    kpi.up ? 'bg-[#006847]/10 text-[#006847]' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {kpi.trend.includes('+') ? <ArrowUpRight className="w-3 h-3" /> : kpi.trend.includes('-') ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {kpi.trend.replace('+', '').replace('-', '')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            
            {/* Map Placeholder */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
              <div className="p-5 border-b border-border flex items-center justify-between bg-white z-10 relative">
                <h3 className="font-bold text-foreground">Mapa de rutas activas</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                  <Navigation className="w-3.5 h-3.5" /> 24 Rutas activas
                </div>
              </div>
              <div className="flex-1 bg-[#F5F6F8] relative min-h-[300px] flex items-center justify-center border-t border-border/50">
                {/* Simulated map background */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#E4007C 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="text-center z-10 bg-white/80 backdrop-blur px-6 py-4 rounded-2xl border border-border shadow-sm">
                  <Map className="w-8 h-8 text-primary mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-foreground">Vista de Mapa en vivo</p>
                  <p className="text-xs text-muted-foreground mt-1">Conectando a GPS de unidades...</p>
                </div>
              </div>
            </div>

            {/* Delivery Calendar / Schedule */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground">Entregas programadas</h3>
                <button className="text-muted-foreground hover:text-primary"><Calendar className="w-4 h-4" /></button>
              </div>
              
              <div className="space-y-4 flex-1">
                {[
                  { time: "09:00 - 12:00", count: 145, status: "En progreso", color: "bg-blue-500" },
                  { time: "12:00 - 15:00", count: 210, status: "Próximo", color: "bg-amber-500" },
                  { time: "15:00 - 18:00", count: 180, status: "Próximo", color: "bg-slate-300" },
                  { time: "18:00 - 21:00", count: 90, status: "Próximo", color: "bg-slate-300" },
                ].map((slot, i) => (
                  <div key={`slot-${i}`} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                    <div className="w-12 text-center shrink-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Turno</p>
                      <p className="text-xs font-black text-foreground">{i+1}</p>
                    </div>
                    <div className="w-px h-8 bg-border shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{slot.time}</p>
                      <p className="text-xs text-muted-foreground">{slot.count} paquetes</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="flex h-2.5 w-2.5">
                        <span className={`animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full ${slot.color} opacity-75 ${slot.status === 'Próximo' ? 'hidden' : ''}`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${slot.color}`}></span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Recent Packages Table */}
            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground">Paquetes Recientes</h3>
                <button className="text-xs font-semibold text-primary hover:underline">Ver inventario completo</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F5F6F8]/50 text-xs text-muted-foreground uppercase">
                    <tr>
                      <th className="px-5 py-3 font-semibold">ID Paquete</th>
                      <th className="px-5 py-3 font-semibold">Origen</th>
                      <th className="px-5 py-3 font-semibold">Destino</th>
                      <th className="px-5 py-3 font-semibold">Estado</th>
                      <th className="px-5 py-3 font-semibold text-right">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentPackages.map((pkg, i) => (
                      <tr key={`pkg-${i}`} className="hover:bg-[#F5F6F8]/50 transition-colors">
                        <td className="px-5 py-3 font-bold text-foreground">{pkg.id}</td>
                        <td className="px-5 py-3 text-muted-foreground">{pkg.origin}</td>
                        <td className="px-5 py-3 font-medium">{pkg.dest}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            pkg.status === 'Completado' ? 'bg-[#006847]/10 text-[#006847]' :
                            pkg.status === 'Recibido' ? 'bg-blue-100 text-blue-800' :
                            pkg.status === 'Asignado' ? 'bg-amber-100 text-amber-800' :
                            'bg-[#F5F6F8] text-muted-foreground'
                          }`}>
                            {pkg.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-right">{pkg.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-6">Timeline de Actividad</h3>
              <div className="relative pl-3">
                <div className="absolute top-2 bottom-2 left-[15px] w-px bg-border" />
                <div className="space-y-6">
                  {timeline.map((act, i) => (
                    <div key={`loctl-${i}`} className="relative flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white ${
                        act.type === 'assign' ? 'bg-blue-100 text-blue-600' :
                        act.type === 'receive' ? 'bg-[#006847]/10 text-[#006847]' :
                        act.type === 'issue' ? 'bg-orange-100 text-orange-600' :
                        'bg-[#F5F6F8] text-muted-foreground'
                      }`}>
                        {act.type === 'assign' ? <MapPin className="w-4 h-4" /> :
                         act.type === 'receive' ? <PackageCheck className="w-4 h-4" /> :
                         act.type === 'issue' ? <AlertOctagon className="w-4 h-4" /> :
                         <Clock className="w-4 h-4" />}
                      </div>
                      <div className="pt-1.5 flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-bold text-foreground">{act.title}</p>
                          <p className="text-[10px] font-bold text-muted-foreground">{act.time}</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug">{act.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// ─── COMPOSICIONES DE RUTA ─────────────────────────────────────────────────────
// Reproducen tal cual las ramas de vista que `App()` tenía en el export de
// Figma, ahora que el router es quien decide qué se monta.
// TODO: desaparecen conforme cada módulo migre sus pantallas a `features/`.

