
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Upload, BarChart3, PlusCircle, AlertTriangle, Calculator, ShieldCheck, Settings, Database } from "lucide-react";

const mesesBase = [
  { mes: "Jan/26", sobras: 324742.58, receita: 3324109.68 },
  { mes: "Fev/26", sobras: 439828.42, receita: 2632304.29 },
  { mes: "Mar/26", sobras: 518567.71, receita: 3140000.00 }
];

const contasBase = [
  { conta: "7.1.1.00", descricao: "Rendas de Operações de Crédito", tipo: "Conta Crítica", anterior: 1296615.19, media3: 1368500.22, atual: 1588000.44, status: "Alerta crítico" },
  { conta: "8.1.7.00", descricao: "Despesas Administrativas", tipo: "Despesa", anterior: 896441.95, media3: 951200.31, atual: 1220000.77, status: "Alerta moderado" },
  { conta: "7.1.9.86", descricao: "Centralização Financeira", tipo: "Receita", anterior: 524960.83, media3: 598000.12, atual: 0, status: "Conta zerada" },
  { conta: "8.9.4.00", descricao: "Tributos sobre o Resultado", tipo: "Conta Crítica", anterior: 28905.25, media3: 24100.44, atual: 38900.18, status: "Alerta crítico" }
];

function moeda(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor || 0));
}

function variacao(atual, base) {
  if (!base) return atual ? 100 : 0;
  return ((atual - base) / base) * 100;
}

function App() {
  const [pagina, setPagina] = useState("Dashboard");
  const [contas, setContas] = useState(contasBase);
  const [arquivo, setArquivo] = useState("");
  const [ajusteReceita, setAjusteReceita] = useState(0);
  const [ajusteDespesa, setAjusteDespesa] = useState(0);

  const atual = mesesBase[mesesBase.length - 1];
  const anterior = mesesBase[mesesBase.length - 2];
  const acumulado = mesesBase.reduce((s, m) => s + m.sobras, 0);
  const crescimento = variacao(atual.sobras, anterior.sobras);
  const sobrasPrevistas = atual.sobras + Number(ajusteReceita || 0) - Number(ajusteDespesa || 0);

  function simularUpload() {
    setArquivo("BALANCETE ABRIL 2026.PDF");
    setPagina("Validação");
  }

  function usarMesAnterior(index) {
    setContas(prev => prev.map((c, i) => i === index ? { ...c, atual: c.anterior, status: "Provisório" } : c));
  }

  const menu = [
    ["Dashboard", BarChart3],
    ["Importação", Upload],
    ["Validação", AlertTriangle],
    ["Ajustes", PlusCircle],
    ["Memória", Calculator],
    ["Plano Gerencial", Database],
    ["Auditoria", ShieldCheck],
    ["Configurações", Settings]
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="hidden lg:flex w-72 bg-zinc-950 border-r border-zinc-800 p-6 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ARE COOP</h1>
          <p className="text-sm text-zinc-400 mt-1">Análise de Receita e Sobras</p>
          <nav className="mt-10 space-y-2 text-sm">
            {menu.map(([label, Icon]) => (
              <button key={label} onClick={() => setPagina(label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left border transition ${pagina === label ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "text-zinc-400 border-transparent hover:bg-zinc-900 hover:text-white"}`}>
                <Icon size={18} /> {label}
              </button>
            ))}
          </nav>
        </div>
        <p className="text-xs text-zinc-500">Protótipo web para GitHub + Vercel</p>
      </aside>

      <main className="flex-1 p-6 lg:p-8" style={{ background: "radial-gradient(circle at top right, rgba(0,200,83,.12), transparent 35%), radial-gradient(circle at top left, rgba(41,121,255,.10), transparent 30%), #050505" }}>
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <p className="text-zinc-400 text-sm">Sicoob Coopercorreios • Março/2026</p>
            <h2 className="text-3xl lg:text-4xl font-semibold mt-1">{pagina}</h2>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPagina("Ajustes")} className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700">Ajuste Manual</button>
            <button onClick={() => setPagina("Importação")} className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">Importar Balancete</button>
          </div>
        </header>

        {pagina === "Dashboard" && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
              <Card title="Receita do Período" value={moeda(atual.receita)} helper="Contas de resultado credor" color="blue" />
              <Card title="Sobras Líquidas do Mês" value={moeda(atual.sobras)} helper="Março/2026" color="green" destaque />
              <Card title="Sobras Acumuladas" value={moeda(acumulado)} helper="Jan a Mar/2026" color="gold" />
              <Card title="Crescimento Mensal" value={`+${crescimento.toFixed(1)}%`} helper="Março vs Fevereiro" color="green" />
              <Card title="Sobras Previstas" value={moeda(sobrasPrevistas)} helper="Com ajustes manuais" color="blue" />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Panel className="xl:col-span-2">
                <h3 className="text-xl font-semibold">Evolução das Sobras Líquidas</h3>
                <p className="text-sm text-zinc-400 mt-1 mb-6">Apuração mensal validada por movimentação</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mesesBase}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="mes" stroke="#a1a1aa" />
                      <YAxis stroke="#a1a1aa" tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v) => moeda(v)} contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 16, color: "#fff" }} />
                      <Line type="monotone" dataKey="sobras" stroke="#00C853" strokeWidth={4} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel>
                <h3 className="text-xl font-semibold">Alertas do Upload</h3>
                <p className="text-sm text-zinc-400 mt-1 mb-6">Variações relevantes</p>
                <div className="space-y-3">
                  {contas.map(c => <div key={c.conta} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800"><b>{c.descricao}</b><p className="text-xs text-amber-300 mt-1">{c.status}</p></div>)}
                </div>
              </Panel>
            </section>
          </>
        )}

        {pagina === "Importação" && (
          <Panel className="max-w-4xl">
            <div className="border-2 border-dashed border-zinc-700 rounded-3xl p-10 text-center bg-zinc-900/40">
              <Upload className="mx-auto text-emerald-400" size={48} />
              <h3 className="text-2xl font-semibold mt-4">Importar Balancete SISBR</h3>
              <p className="text-zinc-400 mt-2">PDF ou Excel. Este protótipo simula o processamento.</p>
              <p className="text-sm text-zinc-500 mt-4">{arquivo || "Nenhum arquivo selecionado"}</p>
              <button onClick={simularUpload} className="mt-6 px-6 py-3 rounded-2xl bg-emerald-500 text-black font-semibold">Simular Upload</button>
            </div>
          </Panel>
        )}

        {pagina === "Validação" && (
          <Panel>
            <h3 className="text-xl font-semibold">Contas com Variação Relevante</h3>
            <p className="text-sm text-zinc-400 mt-1 mb-6">Comparação com mês anterior e média dos últimos 3 meses.</p>
            <div className="overflow-auto rounded-2xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900 text-zinc-400">
                  <tr>
                    <th className="p-4 text-left">Conta</th><th className="p-4 text-left">Descrição</th><th className="p-4 text-right">Anterior</th><th className="p-4 text-right">Média 3M</th><th className="p-4 text-right">Atual</th><th className="p-4 text-right">Var.</th><th className="p-4 text-right">Status</th><th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((c, i) => (
                    <tr key={c.conta} className="border-t border-zinc-800">
                      <td className="p-4">{c.conta}</td><td className="p-4 text-white">{c.descricao}</td><td className="p-4 text-right">{moeda(c.anterior)}</td><td className="p-4 text-right">{moeda(c.media3)}</td><td className="p-4 text-right text-emerald-300">{moeda(c.atual)}</td><td className="p-4 text-right text-amber-300">{variacao(c.atual, c.media3).toFixed(1)}%</td><td className="p-4 text-right">{c.status}</td><td className="p-4 text-right"><button onClick={() => usarMesAnterior(i)} className="px-3 py-2 rounded-xl bg-zinc-800">Usar mês anterior</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {pagina === "Ajustes" && (
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Panel className="xl:col-span-2">
              <h3 className="text-xl font-semibold">Lançamentos Manuais</h3>
              <p className="text-sm text-zinc-400 mt-1 mb-6">Ajustes gerenciais não substituem o valor contábil oficial.</p>
              <label className="block mb-4">Outras receitas<input type="number" value={ajusteReceita} onChange={e => setAjusteReceita(e.target.value)} className="mt-2 w-full bg-black border border-zinc-700 rounded-xl p-3" /></label>
              <label className="block">Outras despesas<input type="number" value={ajusteDespesa} onChange={e => setAjusteDespesa(e.target.value)} className="mt-2 w-full bg-black border border-zinc-700 rounded-xl p-3" /></label>
            </Panel>
            <Panel>
              <h3 className="text-xl font-semibold">Resultado Gerencial</h3>
              <div className="mt-6 space-y-4">
                <Box label="Sobras Contábeis" value={moeda(atual.sobras)} />
                <Box label="Sobras Previstas" value={moeda(sobrasPrevistas)} destaque />
              </div>
            </Panel>
          </section>
        )}

        {pagina === "Memória" && (
          <Panel className="max-w-5xl">
            <h3 className="text-xl font-semibold">Memória de Cálculo</h3>
            <p className="text-sm text-zinc-400 mt-1 mb-6">Regra oficial das sobras líquidas.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box label="Resultado Credor do mês" value="RC atual - RC anterior" />
              <Box label="Resultado Devedor do mês" value="RD atual - RD anterior" />
              <Box label="Sobras Líquidas" value="RC mês - RD mês" destaque />
              <Box label="Validação cruzada" value="Movimentação mensal = variação acumulada" destaque />
            </div>
          </Panel>
        )}

        {pagina === "Plano Gerencial" && (
          <Panel className="max-w-5xl">
            <h3 className="text-xl font-semibold mb-6">Plano Gerencial Inicial</h3>
            {["Resultado Credor", "Resultado Devedor", "Receitas de Operações de Crédito", "Receitas de Serviços", "Despesas Administrativas", "Transitórias", "Compensação"].map(x => <div key={x} className="p-4 mb-3 rounded-2xl bg-zinc-900 border border-zinc-800">{x}</div>)}
          </Panel>
        )}

        {pagina === "Auditoria" && (
          <Panel className="max-w-4xl">
            <h3 className="text-xl font-semibold mb-6">Auditoria</h3>
            <Box label="Arquivo" value={arquivo || "Nenhum novo arquivo importado"} />
            <Box label="Validações" value={`${contas.length} contas avaliadas`} />
            <Box label="Regra" value="Fechamento exige validação cruzada" destaque />
          </Panel>
        )}

        {pagina === "Configurações" && (
          <Panel className="max-w-4xl">
            <h3 className="text-xl font-semibold mb-6">Configurações de Alerta</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Box label="Receitas" value="±20%" />
              <Box label="Despesas" value="±25%" />
              <Box label="Contas críticas" value="±10%" destaque />
            </div>
          </Panel>
        )}
      </main>
    </div>
  );
}

function Card({ title, value, helper, color, destaque }) {
  const colors = {
    green: "from-emerald-500/25 to-emerald-500/5 border-emerald-500/30",
    blue: "from-blue-500/25 to-blue-500/5 border-blue-500/30",
    gold: "from-amber-500/25 to-amber-500/5 border-amber-500/30"
  };
  return <div className={`rounded-3xl bg-gradient-to-br ${colors[color]} bg-zinc-950 border shadow-2xl p-5 ${destaque ? "ring-1 ring-emerald-400/40" : ""}`}><p className="text-sm text-zinc-300">{title}</p><p className="text-2xl font-bold mt-3">{value}</p><p className="text-xs text-zinc-400 mt-3">{helper}</p></div>;
}

function Panel({ children, className = "" }) {
  return <div className={`bg-zinc-950/90 border border-zinc-800 rounded-3xl shadow-2xl p-6 ${className}`}>{children}</div>;
}

function Box({ label, value, destaque }) {
  return <div className={`p-4 rounded-2xl border mb-3 ${destaque ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-900/70 border-zinc-800"}`}><p className="text-xs text-zinc-400">{label}</p><p className="font-medium mt-1">{value}</p></div>;
}

createRoot(document.getElementById("root")).render(<App />);
