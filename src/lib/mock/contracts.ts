export interface Contract {
  id: number;
  cliente: string;
  valorMensal: number;
  renovacao: string;
  status: "Vigente" | "Encerrado" | "Pendente";
}

export const contracts: Contract[] = [
  {
    id: 1,
    cliente: "Shopping Center Sul",
    valorMensal: 120000,
    renovacao: "2026-12-01",
    status: "Vigente"
  },
  {
    id: 2,
    cliente: "Condomínio Reserva Verde",
    valorMensal: 48000,
    renovacao: "2026-08-15",
    status: "Vigente"
  },
  {
    id: 3,
    cliente: "Centro Logístico Alpha",
    valorMensal: 76000,
    renovacao: "2027-02-01",
    status: "Vigente"
  },
  {
    id: 4,
    cliente: "Hospital Vida Nova",
    valorMensal: 95000,
    renovacao: "2026-11-01",
    status: "Vigente"
  },
  {
    id: 5,
    cliente: "Indústria TecnoSteel",
    valorMensal: 68000,
    renovacao: "2026-09-01",
    status: "Vigente"
  }
];
