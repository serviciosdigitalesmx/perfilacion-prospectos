import { TarjetaProspeccion } from '../components/TarjetaProspeccion';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
      <TarjetaProspeccion tallerId="TALLER_TEST_001" />
    </main>
  );
}
