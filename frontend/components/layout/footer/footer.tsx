import Logo from "../shared/logo";
import FooterContentSection from "./footer-content-section";

const footer = () => {
  return (
    <footer className="flex items-center justify-between ps-4">
      <Logo size="2xl" />
      <FooterContentSection />
      <div className="text-secondary">
        © 2024 ReelFind. Cinematic Discovery.
      </div>
    </footer>
  );
};

export default footer;
