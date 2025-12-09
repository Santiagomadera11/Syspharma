import { Inicio } from '../components/dashboard/Inicio';

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  return <Inicio />;
}