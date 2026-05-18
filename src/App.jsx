import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  BarChart3,
  Calculator,
  RefreshCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const initialPredictiveData = [
  { mes: 'Jan', sobras: 125000 },
  { mes: 'Fev', sobras: 138000 },
  { mes: 'Mar', sobras: 146000 },
  { mes: 'Abr', sobras: 152000 },
  { mes: 'Mai', sobras: 158000 },
  { mes: 'Jun', sobras: 164000 },
];

function toNumber(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const cleaned = String(value)
    .replace(/R\$/gi, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseBalanceText(text) {
  const lower = text.toLowerCase();

  const findValue = (labels) => {
    for (const label of labels) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`${escaped}[^0-9-]*(-?\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?|-?\\d+(?:[.,]\\d+)?)`, 'i');
      const match = text.match(regex);
      if (match) return toNumber(match[1]);
    }
    return 0;
  };

  const receitas = findValue(['receitas', 'receita total', 'ingressos', 'rendas']);
  const despesas = findValue(['despesas', 'despesa total', 'dispêndios', 'custos']);
  const ativos = findValue(['ativos', 'ativo total']);
  const passivos = findValue(['passivos', 'passivo total']);
  const sobrasInformadas = findValue(['sobras', 'resultado', 'resultado líquido', 'superávit']);

  const linhas = text.split(/\r?\n/).filter(Boolean).length;
  const contemBalanco = lower.includes('balanço') || lower.includes('balanco') || lower.includes('ativo') || lower.includes('passivo');

  return {
    receitas,
    despesas,
    ativos,
    passivos,
    sobrasInformadas,
    linhas,
    contemBalanco,
  };
}

function calculateValidation(parsed) {
  const checks = [];

  checks.push({
    label: 'Arquivo possui estrutura de balanço',
    ok: parsed.contemBalanco,
  });
  checks.push({
    label: 'Receitas identificadas',
    ok: parsed.receitas > 0,
  });
  checks.push({
    label: 'Despesas identificadas',
    ok: parsed.despesas > 0,
  });
  checks.push({
    label: 'Ativos ou passivos identificados',
    ok: parsed.ativos > 0 || parsed.passivos > 0,
  });

  const validCount = checks.filter((item) => item.ok).length;
  const status = validCount >= 3 ? 'Validado' : validCount >= 2 ? 'Validado com ressalvas' : 'Não validado';

  return { checks, status, validCount };
}

function calculatePredictedSurplus(parsed, validation) {
  const base = parsed.sobrasInformadas || Math.max(parsed.receitas - parsed.despesas, 0);

  if (validation.status === 'Validado') return base * 1.08;
  if (validation.status === 'Validado com ressalvas') return base * 0.92;
  return 0;
}

function Card({ children, className = '' }) {
  return <section className={`rounded-2xl bg-white p-5 shadow-sm border border-slate-100 ${className}`}>{children}</section>;
}

function Metric({ title, value, icon: Icon, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
    </Card>
  );
}

function App() {
  const [fileName, setFileName] = useState('');
  const [rawText, setRawText] = useState('');
  const [manualValidation, setManualValidation] = useState('Automática');

  const parsed = useMemo(() => parseBalanceText(rawText), [rawText]);
  const automaticValidation = useMemo(() => calculateValidation(parsed), [parsed]);

  const validation = useMemo(() => {
    if (manualValidation === 'Automática') return automaticValidation;
    return {
      ...automaticValidation,
      status: manualValidation,
    };
  }, [automaticValidation, manualValidation]);

  const predictedSurplus = useMemo(
    () => calculatePredictedSurplus(parsed, validation),
    [parsed, validation]
  );

  const chartData = useMemo(() => {
    if (!predictedSurplus) return initialPredictiveData;
    return [
      ...initialPredictiveData.slice(0, 5),
      { mes: 'Atual', sobras: Math.round(predictedSurplus) },
    ];
  }, [predictedSurplus]);

  const validationTone = validation.status === 'Validado'
    ? 'green'
    : validation.status === 'Validado com ressalvas'
      ? 'amber'
      : 'slate';

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const content = await file.text();
      setRawText(content);
      setManualValidation('Automática');
    } catch (error) {
      setRawText('');
      alert('Não foi possível ler o arquivo. Envie um CSV, TXT ou arquivo textual do balanço.');
    }
  }

  function resetAnalysis() {
    setFileName('');
    setRawText('');
    setManualValidation('Automática');
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-100">ARE COOP</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">Análise Preditiva</h1>
              <p className="mt-2 max-w-2xl text-emerald-50">
                Faça upload do balanço e acompanhe a validação automática com atualização imediata das Sobras Previstas.
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 px-5 py-3 backdrop-blur">
              <p className="text-sm text-emerald-50">Status</p>
              <p className="text-lg font-semibold">Protótipo operacional</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric title="Validação" value={validation.status} icon={CheckCircle2} tone={validationTone} />
          <Metric title="Sobras Previstas" value={money.format(predictedSurplus)} icon={TrendingUp} tone="green" />
          <Metric title="Receitas" value={money.format(parsed.receitas)} icon={Calculator} tone="blue" />
          <Metric title="Despesas" value={money.format(parsed.despesas)} icon={BarChart3} tone="amber" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Upload do Balanço</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Envie um arquivo textual, CSV ou TXT contendo campos como Receitas, Despesas, Ativos, Passivos ou Sobras.
                </p>
              </div>
              <FileSpreadsheet className="text-emerald-700" />
            </div>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 px-6 py-10 text-center hover:bg-emerald-50">
              <Upload className="mb-3 text-emerald-700" size={34} />
              <span className="font-semibold text-emerald-800">Clique para enviar o balanço</span>
              <span className="mt-1 text-sm text-slate-500">CSV, TXT ou arquivo legível pelo navegador</span>
              <input className="hidden" type="file" accept=".csv,.txt,.json,.html,.xml" onChange={handleUpload} />
            </label>

            {fileName && (
              <div className="mt-4 rounded-xl bg-slate-100 p-4 text-sm">
                <p className="font-semibold text-slate-800">Arquivo carregado</p>
                <p className="mt-1 text-slate-600">{fileName}</p>
              </div>
            )}

            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-700">Campo Validação</label>
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
                value={manualValidation}
                onChange={(event) => setManualValidation(event.target.value)}
              >
                <option>Automática</option>
                <option>Validado</option>
                <option>Validado com ressalvas</option>
                <option>Não validado</option>
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Ao alterar este campo, Sobras Previstas é recalculado automaticamente.
              </p>
            </div>

            <button
              type="button"
              onClick={resetAnalysis}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
            >
              <RefreshCcw size={18} />
              Limpar análise
            </button>
          </Card>

          <Card>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold">Resultado da Análise Preditiva</h2>
                <p className="mt-1 text-sm text-slate-500">
                  A barra “Atual” muda conforme o upload do balanço e o campo Validação.
                </p>
              </div>
              <div className={`rounded-full px-4 py-2 text-sm font-semibold ${
                validation.status === 'Validado'
                  ? 'bg-green-100 text-green-700'
                  : validation.status === 'Validado com ressalvas'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-700'
              }`}>
                {validation.status}
              </div>
            </div>

            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                  <Tooltip formatter={(value) => money.format(value)} />
                  <Bar dataKey="sobras" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {validation.checks.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  {item.ok ? <CheckCircle2 className="text-green-600" size={20} /> : <AlertTriangle className="text-amber-600" size={20} />}
                  <span className="text-sm text-slate-700">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-800">Regra aplicada</p>
              <p className="mt-2 text-sm text-emerald-900">
                Validado: base das sobras + 8%. Validado com ressalvas: base das sobras - 8%. Não validado: Sobras Previstas zeradas até correção do balanço.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

export default App;
