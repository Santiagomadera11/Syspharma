import { Inicio } from '../components/dashboard/Inicio';

interface DashboardEmpleadoProps {
  user: any;
}

export default function DashboardEmpleado({ user }: DashboardEmpleadoProps) {
  return <Inicio />;
}
