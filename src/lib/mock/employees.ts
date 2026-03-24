export interface Employee {
  id: number;
  nome: string;
  cargo: "Vigilante" | "Supervisor" | "Operador CFTV" | "Coordenador Operacional";
  status: "Em Posto" | "Folga" | "Alerta";
  score: number;
  foto: string;
}

const nomes = ["Ricardo", "Ana", "Carlos", "Beatriz", "Daniel", "Fernanda", "Gabriel", "Helena", "Igor", "Juliana", "Lucas", "Mariana", "Nicolas", "Olivia", "Pedro", "Quiteria", "Rafael", "Sofia", "Thiago", "Ursula", "Victor", "Yasmin", "Zeca", "Amanda", "Bruno", "Camila", "Diego", "Eduarda", "Felipe", "Giovana"];
const sobrenomes = ["Mendes", "Silva", "Santos", "Oliveira", "Souza", "Pereira", "Lima", "Carvalho", "Almeida", "Rodrigues", "Ferreira", "Alves", "Gomes", "Costa", "Ribeiro", "Martins", "Barbosa", "Cavalcanti", "Nunes", "Dias", "Araujo", "Cardoso", "Rocha", "Teixeira", "Cavalcante", "Moura", "Pinto", "Machado", "Campos"];
const cargos: ("Vigilante" | "Supervisor" | "Operador CFTV" | "Coordenador Operacional")[] = ["Vigilante", "Supervisor", "Operador CFTV", "Coordenador Operacional"];
const statuses: ("Em Posto" | "Folga" | "Alerta")[] = ["Em Posto", "Folga", "Alerta"];

export function generateEmployees(): Employee[] {
  const employees: Employee[] = [];
  for (let i = 1; i <= 142; i++) {
    const nome = `${nomes[i % nomes.length]} ${sobrenomes[i % sobrenomes.length]}`;
    employees.push({
      id: i,
      nome,
      cargo: cargos[i % cargos.length],
      status: statuses[i % statuses.length],
      score: Math.floor(Math.random() * (98 - 60 + 1)) + 60,
      foto: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`
    });
  }
  return employees;
}
