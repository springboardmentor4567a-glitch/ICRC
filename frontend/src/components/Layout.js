import Header from "./Header";
import InsuranceChatbot from "./InsuranceChatbot";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="app-shell">
        {children}
      </main>
      <InsuranceChatbot />
    </>
  );
}
