import "./globals.css";

export const metadata = {
  title: "masako会議システム",
  description: "複数AI人格による意思決定支援ツール"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
