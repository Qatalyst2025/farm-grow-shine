import { Link } from "react-router-dom";
import agrilinkaLogo from "@/assets/agrilinka-logo.png";

interface LogoProps {
  to?: string;
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ to = "/", className = "", showText = true, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={agrilinkaLogo} 
        alt="AgriLinka Logo" 
        className={`${sizeClasses[size]} w-auto`}
      />
      {showText && (
        <span className={`font-bold text-primary ${textSizeClasses[size]}`}>
          AgriLinka
        </span>
      )}
    </div>
  );

  return to ? (
    <Link to={to} className="transition-opacity hover:opacity-80">
      {content}
    </Link>
  ) : (
    content
  );
};
