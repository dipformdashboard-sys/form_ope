import PasswordGate from "@/components/PasswordGate";
import AtividadesForm from "./AtividadesForm";

const Index = () => (
  <PasswordGate>
    <AtividadesForm />
  </PasswordGate>
);

export default Index;
