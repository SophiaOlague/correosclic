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

// ─── ORDER TRACKING ────────────────────────────────────────────────────────────
export function OrderTracking({ setView }: { setView: (v: string) => void }) {
  // Hardcoded tracking state for demonstration
  const currentStep = 4; // 0 to 6. 4 = En tránsito
  
  const timeline = [
    { label: "Pedido recibido", desc: "Hemos recibido tu orden.", date: "12 Ago, 09:30 hrs", icon: <CheckSquare className="w-5 h-5" /> },
    { label: "Pago confirmado", desc: "El pago fue procesado con éxito.", date: "12 Ago, 09:35 hrs", icon: <ShieldCheck className="w-5 h-5" /> },
    { label: "Preparando paquete", desc: "El vendedor está empacando tu pedido.", date: "12 Ago, 14:15 hrs", icon: <Package className="w-5 h-5" /> },
    { label: "Entregado en sucursal", desc: "El paquete fue entregado en Correos de México.", date: "13 Ago, 10:05 hrs", icon: <Store className="w-5 h-5" /> },
    { label: "En tránsito", desc: "El paquete viaja hacia tu ciudad.", date: "14 Ago, 08:20 hrs", icon: <Truck className="w-5 h-5" /> },
    { label: "En reparto", desc: "El cartero está en camino a tu domicilio.", date: "Pendiente", icon: <Navigation className="w-5 h-5" /> },
    { label: "Entregado", desc: "El paquete ha sido entregado.", date: "Pendiente", icon: <Home className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <span className="hover:text-foreground cursor-pointer" onClick={() => setView("home")}>Inicio</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-foreground cursor-pointer">Mis pedidos</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-semibold">Rastrear pedido</span>
        </div>

        <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-8">Rastreo de envío</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Tracking Summary / Codes */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-3">Detalles del envío</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Código CorreosClic</p>
                  <p className="text-sm font-black text-foreground font-mono bg-[#F5F6F8] px-3 py-1.5 rounded-lg inline-block">#CC-849201</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Guía Correos de México</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-[#006847] font-mono bg-[#006847]/10 px-3 py-1.5 rounded-lg inline-block">MX-9988776655</p>
                    <button className="text-xs font-semibold text-primary hover:underline" onClick={() => toast.success("Código copiado")}>Copiar</button>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Estado actual</p>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <p className="text-base font-bold text-primary">{timeline[currentStep].label}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Entrega estimada</p>
                  <p className="text-sm font-bold text-foreground">Jueves, 15 de Agosto</p>
                </div>
              </div>
            </div>

            <div className="bg-[#006847]/5 border border-[#006847]/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-[#006847]" />
                <h3 className="font-bold text-[#006847] text-sm">Dirección de entrega</h3>
              </div>
              <p className="text-sm text-[#006847]/80 leading-relaxed">
                Av. Paseo de la Reforma 250, Int 4<br />
                Col. Juárez, Cuauhtémoc<br />
                06600, CDMX
              </p>
            </div>
            
            <button className="w-full bg-white border border-border text-foreground h-12 rounded-xl font-bold hover:bg-[#F5F6F8] transition-colors shadow-sm text-sm">
              Ver detalles del pedido
            </button>
          </div>

          {/* Timeline */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-8">Historial de movimientos</h2>
            
            <div className="relative pl-4 sm:pl-8">
              {/* Vertical line */}
              <div className="absolute top-2 bottom-6 left-8 sm:left-12 w-0.5 bg-border rounded-full" />
              <div 
                className="absolute top-2 left-8 sm:left-12 w-0.5 bg-[#006847] rounded-full transition-all duration-1000"
                style={{ height: `${(currentStep / (timeline.length - 1)) * 100}%` }}
              />

              <div className="space-y-8">
                {timeline.map((step, i) => {
                  const isCompleted = i < currentStep;
                  const isCurrent = i === currentStep;
                  const isFuture = i > currentStep;

                  return (
                    <div key={`tl-${i}`} className={`relative flex items-start gap-6 transition-all duration-300 ${isFuture ? "opacity-50" : "opacity-100"}`}>
                      {/* Icon */}
                      <div className="relative z-10 shrink-0 mt-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                          ${isCompleted ? "bg-[#006847] border-[#006847] text-white" : 
                            isCurrent ? "bg-white border-[#006847] text-[#006847] shadow-lg shadow-[#006847]/20" : 
                            "bg-white border-border text-border"}`}
                        >
                          {step.icon}
                        </div>
                        {isCurrent && (
                          <div className="absolute inset-0 border-2 border-[#006847] rounded-full animate-ping opacity-20" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 pt-1 ${isCurrent ? "scale-105 origin-left transition-transform" : ""}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                          <h3 className={`text-sm font-bold ${isCurrent ? "text-[#006847]" : "text-foreground"}`}>
                            {step.label}
                          </h3>
                          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap bg-[#F5F6F8] px-2 py-0.5 rounded-md w-fit">
                            {step.date}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── SELLER DASHBOARD ──────────────────────────────────────────────────────────
export function SellerDashboard({ setView, switchRole }: { setView: (v: string) => void, switchRole: () => void }) {
  const [activeTab, setActiveTab] = useState("productos");

  const menuItems = [
    { id: "inicio", label: "Inicio", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "pedidos", label: "Pedidos", icon: <Package className="w-5 h-5" />, badge: 3 },
    { id: "productos", label: "Productos", icon: <Box className="w-5 h-5" /> },
    { id: "clientes", label: "Clientes", icon: <Users className="w-5 h-5" /> },
    { id: "estadisticas", label: "Estadísticas", icon: <BarChartIcon className="w-5 h-5" /> },
    { id: "configuracion", label: "Configuración", icon: <Settings className="w-5 h-5" /> },
  ];

  const salesData = [
    { name: 'Lun', ingresos: 4200, pedidos: 24 },
    { name: 'Mar', ingresos: 3800, pedidos: 18 },
    { name: 'Mie', ingresos: 5500, pedidos: 32 },
    { name: 'Jue', ingresos: 4800, pedidos: 28 },
    { name: 'Vie', ingresos: 6200, pedidos: 38 },
    { name: 'Sab', ingresos: 8400, pedidos: 52 },
    { name: 'Dom', ingresos: 7100, pedidos: 45 },
  ];

  const recentOrders = [
    { id: "#CC-1092", date: "Hoy, 14:32", customer: "Carlos Ramírez", total: "$1,299.00", status: "Pendiente", items: 2 },
    { id: "#CC-1091", date: "Hoy, 11:15", customer: "Ana López", total: "$3,499.00", status: "Pagado", items: 1 },
    { id: "#CC-1090", date: "Ayer, 18:40", customer: "Roberto Díaz", total: "$599.00", status: "Enviado", items: 3 },
    { id: "#CC-1089", date: "Ayer, 09:20", customer: "Elena Martínez", total: "$8,250.00", status: "Entregado", items: 1 },
  ];

  const lowStock = [
    { name: "Audífonos Inalámbricos Premium", sku: "AUD-001", stock: 3, status: "Crítico" },
    { name: "Funda Silicona iPhone 15", sku: "FUN-IP15", stock: 8, status: "Bajo" },
    { name: "Cable USB-C a Lightning 2m", sku: "CBL-002", stock: 12, status: "Bajo" },
  ];

  return (
    <div className="bg-[#F1F2F4] min-h-screen py-6">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        
        {/* Toggle Button & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#006847] rounded-lg flex items-center justify-center text-white font-black shadow-sm">TM</div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">TechStore MX</h1>
              <p className="text-xs text-muted-foreground">Panel de Vendedor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={switchRole}
              className="bg-white border border-border text-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent transition-colors shadow-sm flex items-center gap-2"
            >
              <User className="w-4 h-4" /> Cambiar a vista de Cliente
            </button>
            <button onClick={() => setActiveTab("nuevo_producto")} className="bg-[#006847] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#005439] transition-colors shadow-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Nuevo producto
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-[240px] shrink-0">
            <nav className="space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? "bg-white text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:bg-black/5 hover:text-foreground border border-transparent"}`}
                >
                  <span className={activeTab === item.id ? "text-[#006847]" : ""}>{item.icon}</span>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-[#E4007C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-border/50">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors">
                <Store className="w-5 h-5" /> Ver mi tienda
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 w-full space-y-6">
            
            {activeTab === "inicio" && (
              <>
                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Agregar producto", icon: <PlusCircle className="w-5 h-5" />, color: "text-[#006847]", bg: "bg-[#006847]/10", onClick: () => setActiveTab("nuevo_producto") },
                { label: "Gestionar inventario", icon: <Box className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Ver reportes", icon: <BarChartIcon className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Marketing", icon: <Tag className="w-5 h-5" />, color: "text-[#E4007C]", bg: "bg-[#E4007C]/10" }
              ].map(action => (
                <button key={`action-${action.label}`} onClick={action.onClick} className="bg-white border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-semibold text-foreground text-center">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Ventas totales (7d)", val: "$40,000.00", trend: "+12.5%", up: true },
                { title: "Pedidos", val: "237", trend: "+5.2%", up: true },
                { title: "Tasa de conversión", val: "3.2%", trend: "-0.4%", up: false },
                { title: "Visitas a la tienda", val: "12,450", trend: "+18.1%", up: true },
              ].map(m => (
                <div key={m.title} className="bg-white border border-border rounded-xl p-5 shadow-sm">
                  <p className="text-xs text-muted-foreground font-medium mb-2">{m.title}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-black text-foreground">{m.val}</p>
                    <div className={`flex items-center gap-1 text-xs font-bold ${m.up ? 'text-[#006847]' : 'text-destructive'}`}>
                      {m.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {m.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="lg:col-span-2 bg-white border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-foreground">Ventas e Ingresos</h3>
                  <select className="text-xs border border-border rounded-md px-2 py-1 bg-transparent outline-none">
                    <option>Últimos 7 días</option>
                    <option>Últimos 30 días</option>
                    <option>Este mes</option>
                  </select>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient key="colorIngresos" id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#006847" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#006847" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#717182' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#717182' }} dx={-10} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Ingresos"]}
                      />
                      <Area type="monotone" dataKey="ingresos" stroke="#006847" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">Inventario bajo</h3>
                  <button className="text-xs font-semibold text-primary hover:underline">Ver todo</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {lowStock.map((item, i) => (
                    <div key={`lowStock-${i}`} className="flex items-center gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="w-10 h-10 bg-[#F5F6F8] rounded-lg shrink-0 border border-border" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">{item.stock} un.</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${item.status === 'Crítico' ? 'text-destructive' : 'text-amber-500'}`}>{item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 bg-[#F5F6F8] text-foreground text-xs font-bold py-2.5 rounded-lg hover:bg-border transition-colors">
                  Actualizar inventario
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground">Últimos pedidos</h3>
                <button className="text-xs font-semibold text-primary hover:underline">Ver todos los pedidos</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F5F6F8]/50 text-xs text-muted-foreground uppercase">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Pedido</th>
                      <th className="px-5 py-3 font-semibold">Fecha</th>
                      <th className="px-5 py-3 font-semibold">Cliente</th>
                      <th className="px-5 py-3 font-semibold">Estado</th>
                      <th className="px-5 py-3 font-semibold">Items</th>
                      <th className="px-5 py-3 font-semibold text-right">Total</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-[#F5F6F8]/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-foreground">{order.id}</td>
                        <td className="px-5 py-4 text-muted-foreground">{order.date}</td>
                        <td className="px-5 py-4 font-medium">{order.customer}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                            order.status === 'Pagado' ? 'bg-[#006847]/10 text-[#006847]' :
                            order.status === 'Pendiente' ? 'bg-amber-100 text-amber-800' :
                            order.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{order.items} un.</td>
                        <td className="px-5 py-4 font-bold text-right">{order.total}</td>
                        <td className="px-5 py-4 text-right">
                          <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
          )}

          {activeTab === "nuevo_producto" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-black text-foreground">Nuevo producto</h2>
                  <p className="text-sm text-muted-foreground">Agrega un nuevo artículo a tu catálogo.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveTab("productos")} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                    Descartar
                  </button>
                  <button onClick={() => { toast.success("Producto creado exitosamente"); setActiveTab("productos"); }} className="bg-[#006847] text-white px-6 h-10 rounded-xl text-sm font-bold hover:bg-[#005439] transition-colors shadow-sm">
                    Guardar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Info */}
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-foreground">Información general</h3>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Título</label>
                      <input type="text" placeholder="Ej. Audífonos Bluetooth..." className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Descripción</label>
                      <textarea rows={6} className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"></textarea>
                    </div>
                  </div>

                  {/* Media */}
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-foreground">Multimedia</h3>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-[#F5F6F8] transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-border mb-3 shadow-sm">
                        <UploadCloud className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-bold text-foreground mb-1">Haz clic para subir o arrastra y suelta</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF hasta 10MB</p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-foreground">Precio</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Precio</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <input type="number" placeholder="0.00" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl pl-8 pr-4 py-3 text-sm outline-none transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Precio de comparación</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <input type="number" placeholder="0.00" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl pl-8 pr-4 py-3 text-sm outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Status */}
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-foreground">Estado</h3>
                    <select className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all appearance-none cursor-pointer">
                      <option>Activo</option>
                      <option>Borrador</option>
                    </select>
                  </div>

                  {/* Organization */}
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-foreground">Organización</h3>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Categoría</label>
                      <select defaultValue="" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all appearance-none cursor-pointer">
                        <option value="" disabled>Seleccionar...</option>
                        <option>Electrónica</option>
                        <option>Moda</option>
                        <option>Hogar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Marca</label>
                      <input type="text" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                    </div>
                  </div>

                  {/* Inventory */}
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-foreground">Inventario</h3>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">SKU</label>
                      <input type="text" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Cantidad en stock</label>
                      <input type="number" defaultValue={0} className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "productos" && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input 
                      type="text" 
                      placeholder="Buscar productos por nombre o SKU..." 
                      className="w-full bg-white border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg pl-9 pr-4 py-2 text-sm outline-none transition-all shadow-sm"
                    />
                  </div>
                  <button className="bg-white border border-border text-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent transition-colors shadow-sm flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filtros
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-[#F5F6F8]/50 text-xs text-muted-foreground uppercase border-b border-border">
                      <tr>
                        <th className="px-5 py-4 font-semibold w-12">
                          <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                        </th>
                        <th className="px-5 py-4 font-semibold">Producto</th>
                        <th className="px-5 py-4 font-semibold">Estado</th>
                        <th className="px-5 py-4 font-semibold">Inventario</th>
                        <th className="px-5 py-4 font-semibold">Precio</th>
                        <th className="px-5 py-4 font-semibold">Categoría</th>
                        <th className="px-5 py-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {PRODUCTS.popular.map((p, i) => (
                        <tr key={`manage-product-${p.id}`} className="hover:bg-[#F5F6F8]/50 transition-colors group">
                          <td className="px-5 py-4">
                            <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#F5F6F8] overflow-hidden shrink-0 border border-border">
                                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-foreground truncate max-w-[200px]">{p.title}</span>
                                <span className="text-xs text-muted-foreground mt-0.5">SKU: TMX-{p.id.toString().padStart(4, '0')}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-[#006847]/10 text-[#006847]">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#006847]" /> Activo
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`font-medium ${i === 1 ? 'text-destructive' : 'text-foreground'}`}>
                              {i === 1 ? '3 en stock' : '45 en stock'}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-foreground">
                            {p.price}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            Electrónica
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded hover:bg-accent" title="Editar">
                                <Settings className="w-4 h-4" />
                              </button>
                              <button className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded hover:bg-destructive/10" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mostrando 1-4 de 24 productos</span>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground disabled:opacity-50" disabled>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-[#F5F6F8] text-foreground font-semibold text-sm">
                      1
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-[#F5F6F8]">
                      2
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-[#F5F6F8]">
                      3
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-[#F5F6F8]">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {["pedidos", "clientes", "estadisticas", "configuracion"].includes(activeTab) && (
            <div className="bg-white rounded-2xl border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-[#F5F6F8] rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                {menuItems.find(m => m.id === activeTab)?.icon}
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">{menuItems.find(m => m.id === activeTab)?.label}</h2>
              <p className="text-muted-foreground max-w-sm mb-6">Esta sección de administración está en desarrollo.</p>
              <button onClick={() => setActiveTab("inicio")} className="bg-[#F5F6F8] border border-border hover:border-primary/20 hover:text-primary text-foreground px-6 h-10 rounded-xl text-sm font-bold transition-all">
                Volver a inicio
              </button>
            </div>
          )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
export function Dashboard({ setView, sellerStatus, setSellerStatus, switchRole }: { setView: (v: string) => void, sellerStatus: string, setSellerStatus: (s: string) => void, switchRole: () => void }) {
  const [activeTab, setActiveTab] = useState("vendedor");

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

            {activeTab === "vendedor" && (
              <BecomeSeller sellerStatus={sellerStatus} setSellerStatus={setSellerStatus} setView={setView} />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BECOME SELLER ─────────────────────────────────────────────────────────────
export function BecomeSeller({ sellerStatus, setSellerStatus, setView }: { sellerStatus: string, setSellerStatus: (s: string) => void, setView: (v: string) => void }) {
  
  return (
    <div className="space-y-6">
      {/* Toggle Button & Header */}
      {/* Dev Simulator Toggle */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <span className="text-xs font-bold text-amber-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Simulador de Estados (Dev Only)</span>
        <div className="flex flex-wrap gap-2">
          {['none', 'form', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setSellerStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sellerStatus === s ? "bg-amber-800 text-white" : "bg-white border border-amber-200 text-amber-800 hover:bg-amber-100"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {sellerStatus === "none" && (
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-10 items-center mb-12">
            <div className="flex-1 order-2 lg:order-1">
              <h1 className="text-3xl lg:text-4xl font-black text-foreground mb-4 leading-tight">Vende en CorreosClic</h1>
              <p className="text-lg text-muted-foreground mb-8">Expande tu negocio utilizando la red logística de CorreosClic y llega a millones de mexicanos.</p>
              <button onClick={() => setSellerStatus("form")} className="w-full sm:w-auto bg-primary text-white px-8 h-14 rounded-xl font-bold hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25 text-base">
                Comenzar solicitud
              </button>
            </div>
            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <div className="aspect-video bg-[#F5F6F8] rounded-3xl overflow-hidden relative border border-border">
                <img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=600&fit=crop&auto=format" alt="Ecommerce" className="w-full h-full object-cover opacity-90 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-black text-foreground mb-6">Beneficios exclusivos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { icon: <Package className="w-5 h-5" />, title: "Productos ilimitados", desc: "Publica todo tu catálogo sin costo extra." },
              { icon: <Globe className="w-5 h-5" />, title: "Cobertura nacional", desc: "Llega a clientes de todo México." },
              { icon: <Navigation className="w-5 h-5" />, title: "Rastreo integrado", desc: "Monitorea todos tus envíos en tiempo real." },
              { icon: <Briefcase className="w-5 h-5" />, title: "Gestión de inventario", desc: "Control total de tu stock desde el panel." },
              { icon: <Store className="w-5 h-5" />, title: "Dashboard de ventas", desc: "Administra tu negocio desde un solo lugar." },
              { icon: <BarChartIcon className="w-5 h-5" />, title: "Estadísticas", desc: "Analiza tu rendimiento y crecimiento." },
              { icon: <Truck className="w-5 h-5" />, title: "Envíos CorreosClic", desc: "Aprovecha nuestras tarifas preferenciales." }
            ].map(b => (
              <div key={b.title} className="p-5 rounded-2xl bg-[#F5F6F8] border border-transparent hover:border-border transition-colors">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm mb-4">
                  {b.icon}
                </div>
                <h4 className="font-bold text-foreground text-sm mb-1">{b.title}</h4>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {sellerStatus === "form" && (
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">Información del negocio</h2>
              <p className="text-sm text-muted-foreground">Completa los datos de tu tienda para enviar la solicitud.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-2">Nombre de la tienda <span className="text-destructive">*</span></label>
                <input type="text" placeholder="Ej. Moda Urbana MX" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-2">Descripción de la tienda <span className="text-destructive">*</span></label>
                <textarea rows={3} placeholder="¿Qué vendes y por qué los clientes deberían comprarte?" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-2">Categoría principal <span className="text-destructive">*</span></label>
                <div className="relative">
                  <select defaultValue="" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl pl-4 pr-10 py-3 text-sm outline-none transition-all appearance-none cursor-pointer">
                    <option value="" disabled>Selecciona una categoría</option>
                    <option>Electrónica</option>
                    <option>Moda</option>
                    <option>Hogar y Jardín</option>
                    <option>Deportes</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-2">Logotipo</label>
                <button className="w-full bg-[#F5F6F8] border border-dashed border-border hover:border-primary focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary h-[46px]">
                  <UploadCloud className="w-4 h-4" /> Subir imagen
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-2">Teléfono de contacto <span className="text-destructive">*</span></label>
                <input type="tel" placeholder="+52" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-2">Correo de soporte <span className="text-muted-foreground font-normal">(Opcional)</span></label>
                <input type="email" placeholder="soporte@mitienda.com" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-2">Dirección fiscal <span className="text-destructive">*</span></label>
                <input type="text" placeholder="Calle, número, colonia, CP, ciudad, estado" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-2">RFC <span className="text-muted-foreground font-normal">(Opcional)</span></label>
                <input type="text" placeholder="XAXX010101000" className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all uppercase" />
              </div>
            </div>

            <div className="pt-4 pb-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="w-5 h-5 mt-0.5 rounded border border-border group-hover:border-primary transition-colors flex items-center justify-center bg-white shrink-0">
                  <Check className="w-3.5 h-3.5 text-transparent" />
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  Acepto los <a href="#" className="text-primary font-semibold hover:underline">Términos y Condiciones</a> y el <a href="#" className="text-primary font-semibold hover:underline">Aviso de Privacidad</a> para vendedores de CorreosClic.
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button onClick={() => setSellerStatus("pending")} className="bg-primary text-white px-10 h-12 rounded-xl font-bold hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25">
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {sellerStatus === "pending" && (
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-3">Solicitud en revisión</h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto">Estamos revisando la información de tu tienda. Este proceso puede tardar algunos días hábiles.</p>
          
          <div className="relative flex justify-between items-center max-w-md mx-auto before:absolute before:top-1/2 before:left-0 before:w-full before:h-1 before:bg-[#F5F6F8] before:-z-10 before:-translate-y-1/2">
            <div className="absolute top-1/2 left-0 w-1/3 h-1 bg-blue-600 -z-10 -translate-y-1/2 transition-all" />
            
            <div className="flex flex-col items-center gap-3 bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-white shadow-sm">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-foreground absolute top-10">Enviada</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-white border-4 border-blue-600 shadow-sm relative">
                <div className="absolute inset-1 bg-blue-600 rounded-full animate-pulse" />
              </div>
              <span className="text-xs font-bold text-blue-600 absolute top-10 whitespace-nowrap">En revisión</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-white border-4 border-[#F5F6F8] flex items-center justify-center" />
              <span className="text-xs font-semibold text-muted-foreground absolute top-10">Aprobación</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-white border-4 border-[#F5F6F8] flex items-center justify-center" />
              <span className="text-xs font-semibold text-muted-foreground absolute top-10 whitespace-nowrap">Panel Vendedor</span>
            </div>
          </div>
          
          <div className="mt-16 text-sm text-muted-foreground bg-[#F5F6F8] p-4 rounded-xl inline-block">
            Recibirás una notificación por correo cuando haya una actualización.
          </div>
        </div>
      )}

      {sellerStatus === "approved" && (
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-[#006847]/10 text-[#006847] rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-[#006847] rounded-full animate-ping opacity-20" />
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-3">¡Bienvenido como vendedor!</h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto">Tu solicitud fue aprobada. Ahora puedes administrar tu tienda, publicar productos y ver tus ventas desde el Panel del Vendedor.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => { setView("seller_dashboard"); }} className="bg-[#006847] text-white px-8 h-12 rounded-xl font-bold hover:bg-[#005439] transition-colors shadow-lg shadow-[#006847]/25 flex items-center justify-center gap-2">
              <Store className="w-5 h-5" /> Ir al Panel del Vendedor
            </button>
            <button className="bg-white border-2 border-border text-foreground px-8 h-12 rounded-xl font-bold hover:bg-[#F5F6F8] transition-colors">
              Cambiar al modo vendedor
            </button>
          </div>
        </div>
      )}

      {sellerStatus === "rejected" && (
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-3">Solicitud rechazada</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Lamentablemente no pudimos aprobar tu solicitud en este momento debido a las siguientes razones:</p>
          
          <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm font-medium mb-10 text-left">
            <ul className="list-disc pl-5 space-y-1">
              <li>El comprobante de domicilio no coincide con la dirección fiscal.</li>
              <li>La identificación oficial no es legible.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setSellerStatus("form")} className="bg-white border-2 border-border text-foreground px-8 h-12 rounded-xl font-bold hover:bg-[#F5F6F8] transition-colors">
              Editar información
            </button>
            <button onClick={() => setSellerStatus("pending")} className="bg-primary text-white px-8 h-12 rounded-xl font-bold hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25">
              Enviar nuevamente la solicitud
            </button>
          </div>
        </div>
      )}
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

// ─── RECEPCIONISTA DASHBOARD ───────────────────────────────────────────────
export function ReceptionistDashboard({ setView }: { setView: (v: string) => void }) {
  const [activeMenu, setActiveMenu] = useState("recepcion");
  const [innerView, setInnerView] = useState("list"); // list, detail, incidence, success
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "recepcion", label: "Recepción de paquetes", icon: <PackageCheck className="w-4 h-4" /> },
    { id: "escanear", label: "Escanear guía", icon: <ScanLine className="w-4 h-4" /> },
    { id: "recibidos", label: "Paquetes recibidos", icon: <Inbox className="w-4 h-4" /> },
    { id: "incidencias", label: "Incidencias", icon: <AlertOctagon className="w-4 h-4" /> },
    { id: "historial", label: "Historial", icon: <History className="w-4 h-4" /> },
    { id: "perfil", label: "Mi perfil", icon: <User className="w-4 h-4" /> },
  ];

  const kpis = [
    { label: "Recibidos hoy", val: "142", icon: <PackageCheck className="w-5 h-5 text-[#006847]" />, bg: "bg-[#006847]/10" },
    { label: "Pendientes revisión", val: "18", icon: <ClipboardList className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
    { label: "Con incidencias", val: "3", icon: <AlertTriangle className="w-5 h-5 text-orange-600" />, bg: "bg-orange-50" },
    { label: "Listos p/ asignación", val: "124", icon: <Truck className="w-5 h-5 text-[#E4007C]" />, bg: "bg-[#E4007C]/10" },
    { label: "Tiempo prom. recepción", val: "45s", icon: <Clock className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
  ];

  const packagesList = [
    { id: "CC-9082", sepomex: "MX-112233", order: "ORD-543", client: "Roberto Díaz", seller: "TechStore MX", time: "10:30 AM", status: "Pendiente" },
    { id: "CC-9083", sepomex: "MX-112234", order: "ORD-544", client: "María González", seller: "Moda Urbana", time: "10:45 AM", status: "Recibido" },
    { id: "CC-9084", sepomex: "MX-112235", order: "ORD-545", client: "Ana López", seller: "Apple Premium", time: "11:00 AM", status: "Pendiente" },
    { id: "CC-9085", sepomex: "MX-112236", order: "ORD-546", client: "Carlos Ramírez", seller: "TechHub MX", time: "11:15 AM", status: "Incidencia" },
  ];

  const historyData = [
    { id: "CC-9083", client: "María González", seller: "Moda Urbana", date: "12 Ago, 10:45 AM", status: "Recibido", issues: "Ninguna", receptionist: "Juan Pérez" },
    { id: "CC-9085", client: "Carlos Ramírez", seller: "TechHub MX", date: "12 Ago, 11:15 AM", status: "Incidencia", issues: "Empaque dañado", receptionist: "Juan Pérez" },
    { id: "CC-9070", client: "Lucía Fernández", seller: "ElectroStore", date: "11 Ago, 16:30 PM", status: "Entregado a Admin", issues: "Ninguna", receptionist: "Ana Soto" },
    { id: "CC-9065", client: "José Martínez", seller: "Deportes VIP", date: "11 Ago, 14:15 PM", status: "Entregado a Admin", issues: "Etiqueta ilegible", receptionist: "Ana Soto" },
    { id: "CC-9050", client: "Fernanda López", seller: "Hogar Deco", date: "10 Ago, 09:20 AM", status: "Entregado a Admin", issues: "Ninguna", receptionist: "Juan Pérez" },
  ];

  const [checks, setChecks] = useState({
    sellado: false,
    legible: false,
    correcta: false,
    sindanos: false,
    peso: false,
    dimensiones: false
  });

  const handleCheck = (key: keyof typeof checks) => {
    setChecks((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checks).every(Boolean);

  const resetFlow = () => {
    setInnerView("list");
    setChecks({ sellado: false, legible: false, correcta: false, sindanos: false, peso: false, dimensiones: false });
    setScannedCode("");
    setScanning(false);
  };

  return (
    <div className="flex h-screen bg-[#F5F6F8] overflow-hidden font-sans selection:bg-primary/20">
      <input type="checkbox" id="mobile-menu-rec" className="peer hidden" />
      {/* Sidebar - Clean Light Theme */}
      <aside className="fixed md:relative inset-y-0 left-0 z-50 transform -translate-x-full peer-checked:translate-x-0 md:translate-x-0 transition-transform duration-300 w-[260px] bg-white border-r border-border flex flex-col h-full shrink-0 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0 cursor-pointer" onClick={() => setView("home")}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-sm shadow-primary/20">
            <span className="text-white font-black text-xs">CC</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">Recepción</span>
        </div>
        
        <div className="p-5 border-b border-border shrink-0 bg-[#F5F6F8]/50">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">PUNTO DE CONTACTO</p>
          <p className="text-sm font-black text-foreground">Sucursal MTY Centro</p>
          <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-muted-foreground">
            <User className="w-3 h-3" /> Juan Pérez
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide space-y-1">
          {sidebarItems.map(item => {
            const isActive = activeMenu === item.id;
            return (
              <button
                key={`rec-menu-${item.id}`}
                onClick={() => { setActiveMenu(item.id); if(item.id === "recepcion") resetFlow(); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-[#F5F6F8] hover:text-foreground"
                }`}
              >
                <span className={isActive ? "text-white" : "text-muted-foreground"}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <label htmlFor="mobile-menu-rec" className="md:hidden cursor-pointer text-muted-foreground"><Menu className="w-5 h-5" /></label>
            <h1 className="text-sm sm:text-lg font-bold text-foreground">
              {innerView === "list" ? "Recepción de Paquetes" : 
               innerView === "detail" ? "Verificación de Paquete" : 
               innerView === "incidence" ? "Registrar Incidencia" : "Confirmación"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-foreground bg-[#F5F6F8] px-4 py-1.5 rounded-full flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> 11:24 AM
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          
          {activeMenu === "dashboard" && (
            <div className="max-w-6xl mx-auto space-y-8">
              <h2 className="text-2xl font-black text-foreground">Resumen del turno</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {kpis.map((kpi, i) => (
                  <div key={`rec-kpi-${i}`} className="bg-white rounded-2xl border border-border p-5 shadow-sm flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
                    <div className={`w-12 h-12 rounded-full ${kpi.bg} flex items-center justify-center mb-3`}>
                      {kpi.icon}
                    </div>
                    <p className="text-2xl font-black text-foreground mb-1">{kpi.val}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{kpi.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border">
                  <h3 className="font-bold text-foreground">Últimos paquetes registrados</h3>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F5F6F8]/50 text-xs text-muted-foreground uppercase">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Guía</th>
                      <th className="px-5 py-3 font-semibold">Cliente</th>
                      <th className="px-5 py-3 font-semibold">Vendedor</th>
                      <th className="px-5 py-3 font-semibold">Llegada</th>
                      <th className="px-5 py-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {packagesList.map((pkg, i) => (
                      <tr key={`rec-pkg-db-${i}`} className="hover:bg-[#F5F6F8]/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-foreground">{pkg.id}</td>
                        <td className="px-5 py-4 font-medium">{pkg.client}</td>
                        <td className="px-5 py-4 text-muted-foreground">{pkg.seller}</td>
                        <td className="px-5 py-4 text-muted-foreground">{pkg.time}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            pkg.status === 'Recibido' ? 'bg-[#006847]/10 text-[#006847]' :
                            pkg.status === 'Pendiente' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {pkg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === "recepcion" && innerView === "list" && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Scanner Bar */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full relative">
                  <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Escanear o ingresar código de guía CorreosClic / Correos de México..." 
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    className="w-full h-14 bg-[#F5F6F8] border-2 border-transparent focus:border-primary focus:bg-white rounded-xl pl-12 pr-4 text-base font-medium outline-none transition-all shadow-inner"
                    autoFocus
                  />
                </div>
                <button 
                  onClick={() => setInnerView("detail")}
                  className="w-full md:w-auto bg-primary text-white px-8 h-14 rounded-xl font-bold hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-lg shrink-0"
                >
                  <Search className="w-5 h-5" /> Buscar
                </button>
              </div>

              {/* Pending List */}
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border flex justify-between items-center bg-[#F5F6F8]/30">
                  <h3 className="font-bold text-foreground">Paquetes en sucursal (En espera de recepción)</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-md">2 Pendientes</span>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F5F6F8]/50 text-xs text-muted-foreground uppercase border-b border-border">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Guía CorreosClic</th>
                      <th className="px-5 py-4 font-semibold">Pedido</th>
                      <th className="px-5 py-4 font-semibold">Vendedor</th>
                      <th className="px-5 py-4 font-semibold">Llegada</th>
                      <th className="px-5 py-4 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {packagesList.filter(p => p.status === "Pendiente").map((pkg, i) => (
                      <tr key={`rec-pkg-${i}`} className="hover:bg-[#F5F6F8]/80 transition-colors group">
                        <td className="px-5 py-4 font-black text-foreground text-base">{pkg.id}</td>
                        <td className="px-5 py-4 font-medium">{pkg.order}</td>
                        <td className="px-5 py-4 text-muted-foreground">{pkg.seller}</td>
                        <td className="px-5 py-4 font-semibold">{pkg.time}</td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => setInnerView("detail")}
                            className="bg-[#006847] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#005439] transition-colors shadow-sm"
                          >
                            Procesar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === "recepcion" && innerView === "detail" && (
            <div className="max-w-5xl mx-auto">
              <button onClick={() => setInnerView("list")} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
                <ChevronLeft className="w-4 h-4" /> Volver a la lista
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Col: Info */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Codes */}
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                    <h3 className="font-bold text-foreground mb-4 text-sm text-muted-foreground uppercase tracking-widest">Identificación</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Guía CorreosClic</p>
                        <p className="text-xl font-black text-foreground font-mono bg-[#F5F6F8] px-3 py-2 rounded-lg border border-border inline-block">CC-9082</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Guía Correos de México</p>
                        <p className="text-lg font-black text-[#006847] font-mono bg-[#006847]/10 px-3 py-2 rounded-lg inline-block">MX-112233</p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-foreground mb-2 text-sm text-muted-foreground uppercase tracking-widest">Detalles</h3>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Vendedor</p>
                      <p className="text-sm font-bold text-foreground">TechStore MX</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Destinatario</p>
                      <p className="text-sm font-bold text-foreground">Roberto Díaz</p>
                      <p className="text-xs text-muted-foreground">Sucursal destino: Monterrey Centro</p>
                    </div>
                    <div className="pt-2 border-t border-border grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Peso decl.</p>
                        <p className="text-sm font-bold text-foreground">1.2 kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Dimensiones</p>
                        <p className="text-sm font-bold text-foreground">20x15x10 cm</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Checklist & Actions */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                      <ClipboardList className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-black text-foreground">Checklist de Recepción</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {[
                        { key: "sellado", label: "Empaque correctamente sellado" },
                        { key: "legible", label: "Etiqueta legible" },
                        { key: "correcta", label: "Guía correcta" },
                        { key: "sindanos", label: "Sin daños visibles" },
                        { key: "peso", label: "Peso verificado" },
                        { key: "dimensiones", label: "Dimensiones verificadas" },
                      ].map(check => (
                        <label key={`chk-${check.key}`} className="flex items-center gap-4 p-4 rounded-xl border border-border cursor-pointer hover:bg-[#F5F6F8] transition-colors select-none">
                          <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${checks[check.key as keyof typeof checks] ? "bg-[#006847] border-[#006847] text-white" : "border-border bg-white"}`}>
                            {checks[check.key as keyof typeof checks] && <Check className="w-5 h-5" />}
                          </div>
                          <span className="text-sm font-bold text-foreground">{check.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-4 mb-8">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-2">Fotografía de evidencia <span className="text-muted-foreground font-normal">(Opcional si no hay daños)</span></label>
                        <button className="w-full bg-[#F5F6F8] border border-dashed border-border hover:border-primary focus:bg-white rounded-xl px-4 py-4 text-sm outline-none transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                          <Camera className="w-6 h-6" /> 
                          <span className="font-semibold">Tomar fotografía o subir imagen</span>
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-2">Observaciones</label>
                        <input type="text" placeholder="Añadir notas internas..." className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                      <button 
                        onClick={() => setInnerView("incidence")}
                        className="flex-1 bg-white text-destructive border-2 border-destructive/20 h-14 rounded-xl font-bold hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2 text-base"
                      >
                        <AlertOctagon className="w-5 h-5" /> Registrar Incidencia
                      </button>
                      <button 
                        onClick={() => setInnerView("success")}
                        disabled={!allChecked}
                        className={`flex-1 h-14 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base shadow-lg ${allChecked ? "bg-[#006847] text-white hover:bg-[#005439] shadow-[#006847]/25" : "bg-[#F5F6F8] text-muted-foreground cursor-not-allowed shadow-none"}`}
                      >
                        <CheckSquare className="w-5 h-5" /> Confirmar Recepción
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "recepcion" && innerView === "incidence" && (
            <div className="max-w-2xl mx-auto mt-10">
              <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-2">Reportar Incidencia</h2>
                <p className="text-muted-foreground mb-8">Selecciona el problema detectado para el paquete <span className="font-bold text-foreground">CC-9082</span>.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {["Empaque dañado", "Etiqueta ilegible", "Producto incorrecto", "Peso inconsistente", "Paquete abierto", "Otro"].map((inc, i) => (
                    <label key={`inc-${i}`} className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-colors">
                      <input type="radio" name="incidence_type" className="w-4 h-4 text-orange-600 focus:ring-orange-600 accent-orange-600" />
                      <span className="text-sm font-bold text-foreground">{inc}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">Evidencia Fotográfica <span className="text-destructive">*</span></label>
                    <button className="w-full bg-[#F5F6F8] border border-dashed border-border hover:border-orange-500 rounded-xl px-4 py-6 text-sm flex flex-col items-center justify-center gap-2 text-muted-foreground transition-all">
                      <Camera className="w-6 h-6" /> <span className="font-semibold">Capturar daños</span>
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">Comentarios adicionales</label>
                    <textarea rows={3} placeholder="Describe el estado del paquete..." className="w-full bg-[#F5F6F8] border border-transparent focus:border-orange-500 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"></textarea>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setInnerView("detail")} className="flex-1 bg-white border-2 border-border text-foreground h-12 rounded-xl font-bold hover:bg-[#F5F6F8] transition-colors">
                    Cancelar
                  </button>
                  <button onClick={() => { toast.success("Incidencia guardada"); resetFlow(); }} className="flex-1 bg-orange-600 text-white h-12 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/25">
                    Guardar incidencia
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "recepcion" && innerView === "success" && (
            <div className="max-w-md mx-auto mt-20 text-center">
              <div className="w-32 h-32 bg-[#006847]/10 text-[#006847] rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 border-4 border-[#006847] rounded-full animate-ping opacity-20" />
                <CheckCircle className="w-16 h-16" />
              </div>
              <h2 className="text-3xl font-black text-foreground mb-4">Paquete recibido</h2>
              <p className="text-muted-foreground mb-10 text-lg">El paquete fue recibido correctamente y está listo para ser asignado por el Administrador Local.</p>
              
              <button 
                onClick={resetFlow}
                className="w-full bg-primary text-white h-16 rounded-xl font-bold text-lg hover:bg-[#C4006A] transition-colors shadow-xl shadow-primary/25 flex items-center justify-center gap-3"
              >
                <ScanLine className="w-6 h-6" /> Registrar siguiente paquete
              </button>
            </div>
          )}

          {/* Placeholder for other menus */}
          {["escanear", "recibidos", "incidencias", "perfil"].includes(activeMenu) && (
            <div className="bg-white rounded-2xl border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center max-w-3xl mx-auto mt-10">
              <div className="w-20 h-20 bg-[#F5F6F8] rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                {sidebarItems.find(m => m.id === activeMenu)?.icon}
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">{sidebarItems.find(m => m.id === activeMenu)?.label}</h2>
              <p className="text-muted-foreground mb-6">Panel operativo en desarrollo.</p>
              <button onClick={() => setActiveMenu("recepcion")} className="bg-primary text-white px-6 h-10 rounded-xl text-sm font-bold transition-all shadow-sm">
                Ir a Recepción
              </button>
            </div>
          )}

          {activeMenu === "historial" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-foreground">Historial de Recepciones</h2>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input type="text" placeholder="Buscar por guía, cliente..." className="w-full bg-white border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all shadow-sm" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F5F6F8]/50 text-xs text-muted-foreground uppercase border-b border-border">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Guía</th>
                      <th className="px-5 py-4 font-semibold">Cliente / Vendedor</th>
                      <th className="px-5 py-4 font-semibold">Fecha y Hora</th>
                      <th className="px-5 py-4 font-semibold">Estado</th>
                      <th className="px-5 py-4 font-semibold">Incidencias</th>
                      <th className="px-5 py-4 font-semibold">Recepcionista</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {historyData.map((record, i) => (
                      <tr key={`hist-${i}`} className="hover:bg-[#F5F6F8]/80 transition-colors group">
                        <td className="px-5 py-4 font-black text-foreground">{record.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-foreground">{record.client}</p>
                          <p className="text-xs text-muted-foreground">de: {record.seller}</p>
                        </td>
                        <td className="px-5 py-4 font-medium text-muted-foreground">{record.date}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            record.status === 'Recibido' || record.status.includes('Entregado') ? 'bg-[#006847]/10 text-[#006847]' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold ${record.issues === 'Ninguna' ? 'text-muted-foreground' : 'text-destructive'}`}>
                            {record.issues}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                          <User className="w-3.5 h-3.5" /> {record.receptionist}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// ─── DRIVER DASHBOARD ────────────────────────────────────────────────────────
export function DriverDashboard({ setView }: { setView: (v: string) => void }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [routeView, setRouteView] = useState("none"); // none, active, delivery, confirm, incidence
  const [driverStatus, setDriverStatus] = useState("Disponible");

  const deliveries = [
    { id: "CC-9083", sepomex: "MX-112234", client: "María González", address: "Av. Paseo de la Reforma 250, Juárez, 06600, CDMX", phone: "55 1234 5678", est: "11:30 AM", status: "Próximo", coords: "1.2 km" },
    { id: "CC-9084", sepomex: "MX-112235", client: "Ana López", address: "Calle Havre 30, Juárez, 06600, CDMX", phone: "55 8765 4321", est: "11:45 AM", status: "Pendiente", coords: "1.5 km" },
    { id: "CC-9085", sepomex: "MX-112236", client: "Roberto Díaz", address: "Calle Liverpool 89, Juárez, 06600, CDMX", phone: "55 5656 4444", est: "12:10 PM", status: "Pendiente", coords: "2.1 km" },
  ];

  const handleStartRoute = () => {
    setDriverStatus("En Ruta");
    setRouteView("active");
  };

  const handleFinishDelivery = () => {
    toast.success("¡Entrega finalizada con éxito!");
    setRouteView("active");
  };

  const handleSaveIncidence = () => {
    toast.error("Incidencia registrada. Se notificará a la sucursal.");
    setRouteView("active");
  };

  if (routeView !== "none") {
    // In-Route Experience (Full Screen Takeover)
    return (
      <div className="flex flex-col h-screen bg-[#F5F6F8] font-sans relative">
        <div className="absolute inset-0 z-0 bg-[#F5F6F8]">
          {/* Fake Map Background */}
          <div className="w-full h-full bg-[#E5E7EB] relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            {/* Map Route SVG Line Mock */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <path d="M 50,500 L 150,400 L 100,250 L 300,100" stroke="#E4007C" strokeWidth="6" fill="none" strokeDasharray="10 10" className="animate-pulse" />
            </svg>
            <div className="absolute top-[100px] left-[300px] w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg z-10" />
            <div className="absolute top-[500px] left-[50px] w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10 flex items-center justify-center">
              <Navigation2 className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Top Header */}
        <header className="absolute top-0 left-0 right-0 p-4 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setRouteView("none")} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-foreground hover:bg-[#F5F6F8]">
              <ChevronLeft className="w-6 h-6" />
            </button>
            {routeView === "active" && (
              <div className="bg-white px-5 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2">
                <Navigation2 className="w-4 h-4 text-primary" /> Ruta 4 en progreso
              </div>
            )}
          </div>
        </header>

        {/* Bottom Sheets based on State */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          
          {routeView === "active" && (
            <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6">
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm font-bold text-primary mb-1 uppercase tracking-widest">Siguiente destino</p>
                  <h2 className="text-2xl font-black text-foreground leading-tight">{deliveries[0].client}</h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">{deliveries[0].address}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-black text-foreground">8 <span className="text-lg">min</span></p>
                  <p className="text-sm font-semibold text-muted-foreground">{deliveries[0].coords}</p>
                </div>
              </div>
              <button 
                onClick={() => setRouteView("delivery")}
                className="w-full bg-[#006847] text-white h-16 rounded-2xl font-black text-lg hover:bg-[#005439] transition-colors shadow-lg shadow-[#006847]/25 flex items-center justify-center gap-2"
              >
                <MapPin className="w-6 h-6" /> Llegué al destino
              </button>
            </div>
          )}

          {routeView === "delivery" && (
            <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 max-h-[85vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-foreground">{deliveries[0].client}</h2>
                  <p className="text-sm font-bold text-muted-foreground mt-1">{deliveries[0].address}</p>
                </div>
                <button className="w-12 h-12 bg-[#F5F6F8] rounded-full flex items-center justify-center text-primary shrink-0">
                  <Smartphone className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#F5F6F8] p-4 rounded-2xl mb-6">
                <p className="text-xs text-muted-foreground mb-1">Guía CorreosClic</p>
                <p className="text-lg font-black text-foreground">{deliveries[0].id}</p>
                <p className="text-xs font-bold text-[#006847] mt-2">1 Paquete • 1.2 kg</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="bg-white border-2 border-primary/20 text-primary h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
                  <ScanLine className="w-5 h-5" /> Escanear
                </button>
                <button onClick={() => setRouteView("incidence")} className="bg-white border-2 border-border text-foreground h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#F5F6F8] transition-colors">
                  <AlertTriangle className="w-5 h-5" /> Incidencia
                </button>
              </div>

              <button 
                onClick={() => setRouteView("confirm")}
                className="w-full bg-[#006847] text-white h-16 rounded-2xl font-black text-lg hover:bg-[#005439] transition-colors shadow-lg shadow-[#006847]/25 flex items-center justify-center gap-2"
              >
                <CheckSquare className="w-6 h-6" /> Confirmar Entrega
              </button>
            </div>
          )}

          {routeView === "confirm" && (
            <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-foreground">Finalizar entrega</h2>
                <button onClick={() => setRouteView("delivery")} className="p-2 text-muted-foreground bg-[#F5F6F8] rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Fotografía de evidencia <span className="text-destructive">*</span></label>
                  <button className="w-full h-32 bg-[#F5F6F8] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-sm font-semibold">Tomar fotografía</span>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Nombre de quien recibe <span className="text-destructive">*</span></label>
                  <input type="text" placeholder="Ej. Roberto Díaz" className="w-full bg-[#F5F6F8] border-2 border-transparent focus:border-primary rounded-2xl px-5 py-4 text-base outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Firma <span className="text-muted-foreground font-normal">(Opcional)</span></label>
                  <div className="w-full h-32 bg-[#F5F6F8] rounded-2xl flex items-center justify-center text-muted-foreground border-2 border-border/50 relative">
                    <PenTool className="absolute top-4 left-4 w-5 h-5 opacity-30" />
                    <span className="text-sm font-semibold opacity-50">Área de firma</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleFinishDelivery}
                className="w-full bg-primary text-white h-16 rounded-2xl font-black text-lg hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25"
              >
                Finalizar entrega
              </button>
            </div>
          )}

          {routeView === "incidence" && (
            <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-foreground">Registrar incidencia</h2>
                <button onClick={() => setRouteView("delivery")} className="p-2 text-muted-foreground bg-[#F5F6F8] rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4 mb-8">
                {["Cliente ausente", "Dirección incorrecta", "No fue posible acceder", "Paquete dañado", "Rechazó recibir", "Otro"].map((r, i) => (
                  <label key={`inc-${i}`} className="flex items-center gap-4 p-4 rounded-xl border border-border cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-colors">
                    <input type="radio" name="inc_reason" className="w-5 h-5 text-orange-600 focus:ring-orange-600 accent-orange-600" />
                    <span className="text-sm font-bold text-foreground">{r}</span>
                  </label>
                ))}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 mt-4">Observaciones</label>
                  <textarea rows={3} placeholder="Detalles de la incidencia..." className="w-full bg-[#F5F6F8] border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-4 text-sm outline-none transition-all resize-none"></textarea>
                </div>
                <button className="w-full h-14 bg-[#F5F6F8] border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground font-semibold">
                  <Camera className="w-5 h-5" /> Agregar fotografía
                </button>
              </div>

              <button 
                onClick={handleSaveIncidence}
                className="w-full bg-orange-600 text-white h-16 rounded-2xl font-black text-lg hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/25"
              >
                Guardar incidencia
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // Normal Dashboard / Navigation View
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F5F6F8] font-sans selection:bg-primary/20">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-[260px] bg-white border-r border-border flex-col h-full shrink-0 z-10 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0 cursor-pointer" onClick={() => setView("home")}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-sm shadow-primary/20">
            <span className="text-white font-black text-xs">CC</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">Repartidor</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
            { id: "rutas", label: "Mis rutas", icon: <Map className="w-5 h-5" /> },
            { id: "entregas", label: "Mis entregas", icon: <Package className="w-5 h-5" /> },
            { id: "historial", label: "Historial", icon: <History className="w-5 h-5" /> },
            { id: "incidencias", label: "Incidencias", icon: <AlertOctagon className="w-5 h-5" /> },
          ].map(item => (
            <button
              key={`drv-side-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-[#F5F6F8] hover:text-foreground"
              }`}
            >
              <span className={activeTab === item.id ? "text-white" : "text-muted-foreground"}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white px-5 py-4 border-b border-border sticky top-0 z-10 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3" onClick={() => setView("home")}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-[10px]">CC</span>
            </div>
            <span className="font-bold text-foreground tracking-tight text-lg">Driver App</span>
          </div>
          <Bell className="w-6 h-6 text-muted-foreground" />
        </header>

        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
          
          {activeTab === "dashboard" && (
            <>
              {/* Driver ID Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-border flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format" alt="Driver" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                <div className="flex-1">
                  <h1 className="text-2xl font-black text-foreground mb-1">Carlos Mendoza</h1>
                  <p className="text-sm font-semibold text-muted-foreground mb-4">Sucursal Monterrey Centro • V-402</p>
                  
                  <div className="inline-block relative w-full sm:w-auto">
                    <select 
                      value={driverStatus}
                      onChange={(e) => setDriverStatus(e.target.value)}
                      className={`w-full sm:w-auto appearance-none px-6 py-2.5 rounded-full text-sm font-bold shadow-sm cursor-pointer outline-none ${
                        driverStatus === "Disponible" ? "bg-[#F5F6F8] text-foreground border-border" :
                        driverStatus === "En Ruta" ? "bg-primary text-white border-primary shadow-primary/20" :
                        "bg-red-50 text-red-600 border-red-100"
                      } border-2`}
                    >
                      <option>Disponible</option>
                      <option>En Ruta</option>
                      <option>Fuera de servicio</option>
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${driverStatus === 'En Ruta' ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Pendientes", val: "12", icon: <Package className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
                  { label: "Entregados", val: "34", icon: <CheckSquare className="w-5 h-5 text-[#006847]" />, bg: "bg-[#006847]/10" },
                  { label: "Tiempo Prom.", val: "8m", icon: <Clock className="w-5 h-5 text-primary" />, bg: "bg-primary/10" },
                  { label: "Distancia", val: "42km", icon: <Navigation className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
                ].map((k, i) => (
                  <div key={`dkpi-${i}`} className="bg-white rounded-2xl p-4 shadow-sm border border-border flex flex-col justify-center items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${k.bg}`}>
                      {k.icon}
                    </div>
                    <p className="text-xl font-black text-foreground mb-0.5">{k.val}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{k.label}</p>
                  </div>
                ))}
              </div>

              {/* Active Route Quick Access */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
                <h3 className="font-bold text-foreground mb-4">Ruta Asignada (Hoy)</h3>
                <div className="bg-[#F5F6F8] rounded-2xl p-5 border border-border">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Map className="w-5 h-5 text-primary" />
                      <span className="font-black text-lg">Ruta 4</span>
                    </div>
                    <span className="bg-[#006847]/10 text-[#006847] text-xs font-bold px-2.5 py-1 rounded-md">Lista</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">46 paquetes • 12 km estimados • Centro Histórico</p>
                  <button 
                    onClick={handleStartRoute}
                    className="w-full bg-primary text-white h-14 rounded-xl font-bold text-lg hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25"
                  >
                    Iniciar ruta ahora
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "rutas" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-foreground">Mis Rutas</h2>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Map className="w-6 h-6 text-primary" />
                    <span className="font-black text-xl">Ruta 4</span>
                  </div>
                  <span className="bg-[#006847]/10 text-[#006847] text-xs font-bold px-3 py-1.5 rounded-lg">Asignada</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Horario</p>
                    <p className="text-sm font-bold text-foreground">08:00 AM - 16:00 PM</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Paquetes</p>
                    <p className="text-sm font-bold text-foreground">46</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Vehículo</p>
                    <p className="text-sm font-bold text-foreground">V-402 (Van)</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Sucursal</p>
                    <p className="text-sm font-bold text-foreground">MTY Centro</p>
                  </div>
                </div>

                <button 
                  onClick={handleStartRoute}
                  className="w-full bg-primary text-white h-14 rounded-xl font-bold text-lg hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25"
                >
                  Iniciar ruta
                </button>
              </div>

              {/* Completed route fake data */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-border opacity-60">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Map className="w-6 h-6 text-muted-foreground" />
                    <span className="font-black text-xl">Ruta 2</span>
                  </div>
                  <span className="bg-[#F5F6F8] text-muted-foreground text-xs font-bold px-3 py-1.5 rounded-lg">Completada ayer</span>
                </div>
                <p className="text-sm font-bold text-foreground">52 paquetes entregados con éxito.</p>
              </div>
            </div>
          )}

          {activeTab === "entregas" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-foreground">Lista de Entregas</h2>
              <div className="space-y-4">
                {deliveries.map((del, i) => (
                  <div key={`dlist-${i}`} className="bg-white rounded-3xl p-5 shadow-sm border border-border relative overflow-hidden">
                    {i === 0 && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />}
                    <div className="flex justify-between items-start mb-3 pl-2">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-1">{del.id}</p>
                        <h3 className="text-lg font-black text-foreground leading-tight">{del.client}</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                        del.status === 'Próximo' ? 'bg-primary/10 text-primary' : 'bg-[#F5F6F8] text-muted-foreground'
                      }`}>
                        {del.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-4 pl-2 pr-6 leading-relaxed">
                      {del.address}
                    </p>
                    <div className="flex gap-3 pl-2">
                      <button onClick={handleStartRoute} className="flex-1 bg-[#F5F6F8] text-foreground border-2 border-transparent hover:border-primary/20 h-12 rounded-xl font-bold transition-colors">
                        Ver detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {["historial", "incidencias"].includes(activeTab) && (
            <div className="bg-white rounded-3xl border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center mt-10">
              <div className="w-24 h-24 bg-[#F5F6F8] rounded-full flex items-center justify-center mb-6 text-muted-foreground">
                {activeTab === "historial" ? <History className="w-10 h-10" /> : <AlertOctagon className="w-10 h-10" />}
              </div>
              <h2 className="text-2xl font-black text-foreground mb-3 capitalize">{activeTab}</h2>
              <p className="text-muted-foreground mb-8">Esta sección está actualmente sin registros o en mantenimiento.</p>
              <button onClick={() => setActiveTab("dashboard")} className="bg-[#F5F6F8] text-foreground px-8 h-12 rounded-xl font-bold transition-all hover:bg-border">
                Volver a inicio
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40 px-4 py-3 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {[
          { id: "dashboard", label: "Inicio", icon: <Home className="w-6 h-6" /> },
          { id: "rutas", label: "Rutas", icon: <Map className="w-6 h-6" /> },
          { id: "entregas", label: "Entregas", icon: <Package className="w-6 h-6" /> },
          { id: "perfil", label: "Perfil", icon: <User className="w-6 h-6" /> },
        ].map(item => (
          <button
            key={`mob-nav-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1.5 w-16 transition-colors ${activeTab === item.id || (activeTab==='perfil' && item.id==='perfil') ? "text-primary" : "text-muted-foreground"}`}
          >
            <div className={`transition-transform ${activeTab === item.id ? "scale-110" : ""}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}

// ─── COMPOSICIONES DE RUTA ─────────────────────────────────────────────────────
// Reproducen tal cual las ramas de vista que `App()` tenía en el export de
// Figma, ahora que el router es quien decide qué se monta.
// TODO: desaparecen conforme cada módulo migre sus pantallas a `features/`.

