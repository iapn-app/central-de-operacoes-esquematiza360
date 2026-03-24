import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function FinanceiroDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("financial_kpis")
          .select("*")
          .single();

        if (error) throw error;

        if (active) setData(data);
      } catch (err) {
        console.error("Erro dashboard financeiro:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="text-white">Carregando financeiro...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Financeiro</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-4 rounded-xl">
          <p className="text-sm text-zinc-400">Saldo Atual</p>
          <p className="text-xl font-bold text-green-400">
            R$ {data?.saldo ?? 0}
          </p>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <p className="text-sm text-zinc-400">A Receber</p>
          <p className="text-xl font-bold text-blue-400">
            R$ {data?.receber ?? 0}
          </p>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <p className="text-sm text-zinc-400">A Pagar</p>
          <p className="text-xl font-bold text-red-400">
            R$ {data?.pagar ?? 0}
          </p>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <p className="text-sm text-zinc-400">Resultado</p>
          <p className="text-xl font-bold text-yellow-400">
            R$ {data?.resultado ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
