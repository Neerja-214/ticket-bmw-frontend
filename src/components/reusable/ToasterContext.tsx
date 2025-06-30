import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
type ToasterType = "success" | "error" | "warning";

interface ToasterState {
  message: string[];
  type: ToasterType;
  visible: boolean;
}

interface ToasterProps {
  className?: string;
}

const initialToasterState: ToasterState = {
  message: [""],
  type: "error",
  visible: false,
};

const ToasterContext = React.createContext<{
  showToaster: (message: string[], type: ToasterType) => void;
  hideToaster: () => void;
}>({
  showToaster: () => {},
  hideToaster: () => {},
});

export const ToasterProvider: React.FC<ToasterProps & { children: React.ReactNode }> = ({
  className = "",
  children,
}) => {
  const [toaster, setToaster] = useState<ToasterState>(initialToasterState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToaster = (message: string[], type: ToasterType) => {
    setToaster({ message, type, visible: true });

    const toastClass = type === "error" ? "swal-toast-error" : type === "success" ? "swal-toast-success" : "swal-toast-warning";
    const toSentenceLabel = (messages: string[]) => {
      const sentence = messages.join(". ");
      return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
    };

    Swal.fire({
      title: type.toUpperCase(),
      text: toSentenceLabel(message),
      icon: type,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: {
        popup: toastClass,
      },
      showClass: {
        popup: "swal-toast-show",
      },
      hideClass: {
        popup: "swal-toast-hide",
      },
    });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(hideToaster, 4000);
  };

  const hideToaster = () => {
    setToaster(initialToasterState);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <ToasterContext.Provider value={{ showToaster, hideToaster }}>
      {children}
    </ToasterContext.Provider>
  );
};

export const useToaster = () => React.useContext(ToasterContext);
