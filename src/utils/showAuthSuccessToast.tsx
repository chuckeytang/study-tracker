import { toast } from "react-toastify";

const AUTH_SUCCESS_TOAST_ID = "auth-success-toast";

export function showAuthSuccessToast(
  message: string = "Success",
  autoClose: number = 1200,
) {
  toast.dismiss(AUTH_SUCCESS_TOAST_ID);

  toast.success(
    <div className="auth-success-toast__content">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15.9998 29.3334C19.6817 29.3334 23.015 27.841 25.4279 25.4281C27.8408 23.0153 29.3332 19.6819 29.3332 16.0001C29.3332 12.3182 27.8408 8.98488 25.4279 6.57199C23.015 4.15913 19.6817 2.66675 15.9998 2.66675C12.318 2.66675 8.98464 4.15913 6.57174 6.57199C4.15889 8.98488 2.6665 12.3182 2.6665 16.0001C2.6665 19.6819 4.15889 23.0153 6.57174 25.4281C8.98464 27.841 12.318 29.3334 15.9998 29.3334Z"
          stroke="#303236"
          strokeWidth="3"
        />
        <path
          d="M10.6665 16L14.6665 20L22.6665 12"
          stroke="#303236"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{message}</span>
    </div>,
    {
      toastId: AUTH_SUCCESS_TOAST_ID,
      icon: false,
      closeButton: false,
      autoClose,
      pauseOnHover: false,
      draggable: false,
      className: "auth-success-toast",
      bodyClassName: "auth-success-toast__body",
    },
  );
}
