import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function App() {
  const [data, setData] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtrados, setFiltrados] = useState([]);

  // API pública de moedas
  const fetchData = async () => {
    const res = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
    const currencies = Object.entries(res.data.rates).map(([moeda, valor]) => ({
      moeda,
      valor,
    }));
    setData(currencies);
    setFiltrados(currencies);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFiltro = (e) => {
    const filtro = e.target.value.toUpperCase();
    setFiltro(filtro);
    setFiltrados(data.filter((item) => item.moeda.includes(filtro)));
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Moedas filtradas", 14, 10);
    autoTable(doc, {
      head: [["Moeda", "Valor"]],
      body: filtrados.map((item) => [item.moeda, item.valor]),
    });
    doc.save("moedas.pdf");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard de Moedas</h2>
      <input
        type="text"
        value={filtro}
        onChange={handleFiltro}
        placeholder="Filtrar por moeda (ex: BRL)"
        style={{ padding: 10, marginBottom: 20, width: "100%" }}
      />

      <BarChart width={700} height={300} data={filtrados}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="moeda" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="valor" fill="#8884d8" />
      </BarChart>

      <button onClick={exportarPDF} style={{ marginTop: 20, padding: 10 }}>
        Exportar para PDF
      </button>
    </div>
  );
}

export default App;
