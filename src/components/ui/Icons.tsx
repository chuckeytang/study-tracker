// src/components/ui/Icons.tsx
// [+] 新增 全局复用的 SVG 图标组件库

export const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <g clipPath="url(#clip0_409_84)">
        <path d="M9.99996 18.3334C14.6023 18.3334 18.3333 14.6025 18.3333 10.0001C18.3333 5.39771 14.6023 1.66675 9.99996 1.66675C5.39758 1.66675 1.66663 5.39771 1.66663 10.0001C1.66663 14.6025 5.39758 18.3334 9.99996 18.3334Z" fill="#84888C" stroke="#84888C" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M13.25 7L7 13.25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 7L13.25 13.25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_409_84">
          <rect width="20" height="20" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
  
  export const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#84888C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
  
  export const CheckSquareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="0.3" y="0.3" width="23.4" height="23.4" rx="5.7" stroke="#A3A3A3" strokeWidth="0.6"/>
      <path d="M7.62424 12.1756C7.38993 11.9413 7.01003 11.9413 6.77571 12.1756C6.5414 12.41 6.5414 12.7899 6.77571 13.0242L9.77571 16.0242C10.01 16.2585 10.3899 16.2585 10.6242 16.0242L17.2242 9.42417C17.4586 9.18985 17.4586 8.80995 17.2242 8.57564C16.9899 8.34132 16.61 8.34132 16.3757 8.57564L10.2 14.7514L7.62424 12.1756Z" fill="#656565"/>
    </svg>
  );
  
  export const SquareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="0.3" y="0.3" width="23.4" height="23.4" rx="5.7" stroke="#A3A3A3" strokeWidth="0.6"/>
    </svg>
  );