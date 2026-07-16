export const metadata = {
  title: 'Sr. Fix - Prospección',
  description: 'Copiloto de prospección para talleres',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
