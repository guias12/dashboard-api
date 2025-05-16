import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#a832a6'];

function App() {
  const [dados, setDados] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtrados, setFiltrados] = useState([]);

  useEffect(() => {
    const buscarDados = async () => {
      const moedasRes = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
      const moedas = Object.entries(moedasRes.data.rates).slice(0, 10).map(([nome, valor]) => ({
        nome,
        valor,
        tipo: "moeda",
      }));

      const criptoRes = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=10&page=1"
      );
      const criptos = criptoRes.data.map((c) => ({
        nome: c.name,
        valor: c.current_price,
        tipo: "cripto",
      }));

      const acoes = [
        { nome: "AAPL", valor: 185, tipo: "acao" },
        { nome: "GOOGL", valor: 135, tipo: "acao" },
        { nome: "AMZN", valor: 120, tipo: "acao" },
      ];

      const commodities = [
        { nome: "Ouro", valor: 2000, tipo: "commoditie" },
        { nome: "Petróleo", valor: 85, tipo: "commoditie" },
        { nome: "Milho", valor: 6.5, tipo: "commoditie" },
      ];

      const todos = [...moedas, ...criptos, ...acoes, ...commodities];
      setDados(todos);
      setFiltrados(todos);
    };

    buscarDados();
  }, []);

  // Atualiza os dados filtrados sempre que tipo ou texto mudar
  useEffect(() => {
    let filtragem = [...dados];
    if (filtroTipo !== "todos") {
      filtragem = filtragem.filter((item) => item.tipo === filtroTipo);
    }
    if (filtroTexto.trim() !== "") {
      filtragem = filtragem.filter((item) =>
        item.nome.toLowerCase().includes(filtroTexto.toLowerCase())
      );
    }
    setFiltrados(filtragem);
  }, [filtroTipo, filtroTexto, dados]);

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Dados Financeiros", 14, 10);
    autoTable(doc, {
      head: [["Nome", "Valor", "Tipo"]],
      body: filtrados.map((item) => [item.nome, item.valor, item.tipo]),
    });
    doc.save("dados-financeiros.pdf");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Dashboard Financeiro</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Filtrar por tipo: </label>
        <select onChange={(e) => setFiltroTipo(e.target.value)} value={filtroTipo}>
          <option value="todos">Todos</option>
          <option value="moeda">Moedas</option>
          <option value="cripto">Criptomoedas</option>
          <option value="acao">Ações</option>
          <option value="commoditie">Commodities</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Filtrar por nome: </label>
        <input
          type="text"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          placeholder="Digite o nome ex: ouro, USD, BTC..."
          style={{ padding: 8, width: "100%" }}
        />
      </div>

      <h3>📍 Gráfico de Barras</h3>
      <BarChart width={730} height={250} data={filtrados}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="nome" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="valor" fill="#8884d8" />
      </BarChart>

      <h3>🧩 Gráfico de Pizza</h3>
      <PieChart width={400} height={300}>
        <Pie
          data={filtrados}
          dataKey="valor"
          nameKey="nome"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {filtrados.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>

      <h3>📈 Gráfico de Linha</h3>
      <LineChart width={730} height={250} data={filtrados}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="nome" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="valor" stroke="#82ca9d" />
      </LineChart>

      <button onClick={exportarPDF} style={{ marginTop: 20, padding: 10 }}>
        📥 Exportar para PDF
      </button>
    </div>
  );
}

export default App;
