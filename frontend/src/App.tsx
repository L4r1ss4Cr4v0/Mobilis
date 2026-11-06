import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Cadastro } from "./pages/Cadastro";
import { CadastroAgente } from "./pages/CadastroAgente";
import { NovoPedido } from "./pages/cliente/NovoPedido";
import { Alugar } from "./pages/cliente/Alugar";
import { MeusPedidos } from "./pages/cliente/MeusPedidos";
import { Perfil } from "./pages/cliente/Perfil";
import { PedidosAgente } from "./pages/agente/Pedidos";
import { AnalisePedido } from "./pages/agente/AnalisePedido";
import { Contratos } from "./pages/agente/Contratos";
import { Clientes } from "./pages/agente/Clientes";
import { Automoveis } from "./pages/agente/Automoveis";
import { ContratoEditor } from "./pages/agente/ContratoEditor";
import { PerfilAgente } from "./pages/agente/PerfilAgente";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/cadastro/agente" element={<CadastroAgente />} />

      <Route
        path="/cliente/novo-pedido"
        element={
          <Layout area="cliente">
            <NovoPedido />
          </Layout>
        }
      />
      <Route
        path="/cliente/alugar/:carroId"
        element={
          <Layout area="cliente">
            <Alugar />
          </Layout>
        }
      />
      <Route
        path="/cliente/pedidos"
        element={
          <Layout area="cliente">
            <MeusPedidos />
          </Layout>
        }
      />
      <Route
        path="/cliente/perfil"
        element={
          <Layout area="cliente">
            <Perfil />
          </Layout>
        }
      />

      <Route
        path="/agente/pedidos"
        element={
          <Layout area="agente">
            <PedidosAgente />
          </Layout>
        }
      />
      <Route
        path="/agente/pedidos/:id"
        element={
          <Layout area="agente">
            <AnalisePedido />
          </Layout>
        }
      />
      <Route
        path="/agente/pedidos/:id/contrato"
        element={
          <Layout area="agente">
            <ContratoEditor />
          </Layout>
        }
      />
      <Route
        path="/agente/contratos"
        element={
          <Layout area="agente">
            <Contratos />
          </Layout>
        }
      />
      <Route
        path="/agente/clientes"
        element={
          <Layout area="agente">
            <Clientes />
          </Layout>
        }
      />
      <Route
        path="/agente/automoveis"
        element={
          <Layout area="agente">
            <Automoveis />
          </Layout>
        }
      />
      <Route
        path="/agente/perfil"
        element={
          <Layout area="agente">
            <PerfilAgente />
          </Layout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
